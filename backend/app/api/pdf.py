from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session
import PyPDF2
import io
from datetime import datetime

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, UserMemoryChunk
from app.services.vector_service import vector_service
from app.api.activity import log_activity_internal

router = APIRouter()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Upload a PDF, extract text, and index it into the user's vector memory."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        # Chunk the text to stay within embedding limits (approx 1000 chars per chunk)
        chunks = [text[i:i + 1500] for i in range(0, len(text), 1500)]
        
        print(f"📄 Indexing {len(chunks)} chunks for user {current_user.id}...")
        
        # Store in vector service (handles Gemini/FAISS internally)
        vector_service.store_batch_embeddings(current_user.id, chunks, db)

        log_activity_internal(current_user, db, "document_uploaded", f"Uploaded PDF: {file.filename} ({len(chunks)} chunks indexed)")
        db.commit()

        return {
            "filename": file.filename,
            "chunks_indexed": len(chunks),
            "message": "PDF processed and indexed successfully. You can now ask questions about it."
        }

    except Exception as e:
        print(f"❌ PDF Processing Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_pdf_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Check how many document chunks the user has indexed."""
    from sqlmodel import select, func
    statement = select(func.count()).select_from(UserMemoryChunk).where(UserMemoryChunk.user_id == current_user.id)
    count = db.exec(statement).one()
    return {"indexed_chunks": count}

@router.delete("/clear")
def clear_pdf_memory(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Clear all indexed document context for the user."""
    from sqlmodel import delete
    statement = delete(UserMemoryChunk).where(UserMemoryChunk.user_id == current_user.id)
    db.exec(statement)
    db.commit()
    return {"message": "Memory cleared successfully."}


# ── NEW: Direct Gemini RAG Query ─────────────────────────────────────────────
from pydantic import BaseModel

class DocumentQuery(BaseModel):
    question: str
    top_k: int = 5

@router.post("/ask")
async def ask_document(
    req: DocumentQuery,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve relevant document chunks for the user and query Gemini 1.5
    with full citation support. This is theprimary endpoint for the Neural Document Lab.
    """
    try:
        # 1. Retrieve top-k most relevant chunks from the user's vector store
        context_chunks = vector_service.retrieve_context(
            user_id=current_user.id,
            query=req.question,
            db=db,
            top_k=req.top_k
        )

        if not context_chunks:
            return {
                "answer": "I couldn't find any relevant content in your indexed documents. Please upload a document first.",
                "citations": []
            }

        # 2. Build an airtight RAG prompt for Gemini
        context_text = "\n\n---\n\n".join(
            f"[Chunk {i+1}]: {chunk}" for i, chunk in enumerate(context_chunks)
        )

        system_prompt = f"""You are the Neural Document Lab AI, an expert research assistant.
Your task: Answer the user's question based STRICTLY on the provided document chunks.
If the answer is not in the provided content, say: "I cannot find this in the indexed documents."
Cite chunk numbers (e.g., "According to [Chunk 2]...") when referencing specific information.

DOCUMENT CONTEXT:
{context_text}

USER QUESTION: {req.question}

Provide a detailed, accurate answer with citations where applicable."""

        # 3. Call Gemini 1.5 Flash for maximum speed
        import os, google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {"answer": "Gemini API key not configured. Please contact the administrator.", "citations": []}
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(system_prompt)

        # 4. Extract citation numbers from response text
        import re
        cited_chunks = re.findall(r'\[Chunk (\d+)\]', response.text)
        citations = [f"Chunk {c}" for c in set(cited_chunks)]

        return {
            "answer": response.text,
            "citations": citations,
            "chunks_used": len(context_chunks)
        }

    except Exception as e:
        import traceback
        print(f"❌ Document Ask Error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Neural engine error: {str(e)}")

