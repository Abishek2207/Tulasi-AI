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
