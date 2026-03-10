from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
import os, uuid, tempfile

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

# LangChain + FAISS (lightweight, no heavy ChromaDB dependency)
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

router = APIRouter()

# In-memory sessions: session_id -> { filename, pages, user_id, vectorstore }
pdf_sessions: dict = {}

def _get_embeddings():
    """Lazy-init embeddings to avoid startup crash if key is missing."""
    key = settings.effective_gemini_key
    if not key:
        raise HTTPException(503, "GOOGLE_API_KEY / GEMINI_API_KEY not configured on server.")
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=key,
    )


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")

    session_id = str(uuid.uuid4())
    content = await file.read()

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # 1. Load Document
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        num_pages = len(docs)

        # 2. Chunk
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = splitter.split_documents(docs)

        for doc in splits:
            doc.metadata["session_id"] = session_id
            doc.metadata["user_id"] = str(current_user.id)

        # 3. Build in-memory FAISS vector store
        embeddings = _get_embeddings()
        vectorstore = FAISS.from_documents(splits, embeddings)

        os.unlink(tmp_path)

        pdf_sessions[session_id] = {
            "filename": file.filename,
            "pages": num_pages,
            "user_id": current_user.id,
            "vectorstore": vectorstore,
        }
        return {"session_id": session_id, "pages": num_pages, "filename": file.filename, "status": "ready"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"PDF processing error: {str(e)}")


class PDFQuestionRequest(BaseModel):
    question: str
    session_id: str


@router.post("/ask")
def ask_pdf(req: PDFQuestionRequest, current_user: User = Depends(get_current_user)):
    session = pdf_sessions.get(req.session_id)
    if not session:
        raise HTTPException(404, "PDF session not found. Please upload a PDF first.")

    try:
        # Retrieve context from FAISS vector store
        vectorstore: FAISS = session["vectorstore"]
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        relevant_docs = retriever.invoke(req.question)
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

        # Use Gemini for LLM Generation
        gemini_key = settings.effective_gemini_key
        if gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"Answer the question based STRICTLY on this context:\n{context}\n\nQuestion: {req.question}"
            response = model.generate_content(prompt)
            return {"answer": response.text, "source": session["filename"]}

        # Fallback: Groq
        if settings.GROQ_API_KEY:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"You are a helpful AI document assistant. Answer based strictly on the context below.\n\nCONTEXT:\n{context}"},
                    {"role": "user", "content": req.question},
                ],
                max_tokens=1024,
            )
            return {"answer": completion.choices[0].message.content, "source": session["filename"]}

        return {"answer": "No AI API key configured. Cannot generate response.", "source": session["filename"]}
    except Exception as e:
        return {"answer": f"Error performing RAG query: {str(e)}", "source": session["filename"]}


@router.get("/sessions")
def list_sessions(current_user: User = Depends(get_current_user)):
    """List all PDF sessions for the current user."""
    user_sessions = {
        sid: {"filename": s["filename"], "pages": s["pages"]}
        for sid, s in pdf_sessions.items()
        if s["user_id"] == current_user.id
    }
    return {"sessions": user_sessions}
