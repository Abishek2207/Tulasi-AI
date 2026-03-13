from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
import os, uuid, tempfile

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

router = APIRouter()

# In-memory sessions: session_id -> { filename, pages, user_id, text }
pdf_sessions: dict = {}


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files accepted")

    session_id = str(uuid.uuid4())
    content = await file.read()

    try:
        with tempfile.NamedTemporaryFile(delete=False, mode="wb", suffix=".pdf") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # Extract text from PDF using pypdf (lightweight)
        reader = PdfReader(tmp_path)
        pages_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        os.unlink(tmp_path)

        full_text = "\n\n".join(pages_text)

        # Store in RAG vector store for indexed retrieval
        from app.services.ai_agents.vector_store.faiss_store import vector_store_manager
        vector_store_manager.process_document(full_text, metadata={"session_id": session_id, "user_id": current_user.id, "filename": file.filename})

        pdf_sessions[session_id] = {
            "filename": file.filename,
            "pages": len(reader.pages),
            "user_id": current_user.id,
            "text": full_text, # Still keeping text for fallback
        }
        return {"session_id": session_id, "pages": len(reader.pages), "filename": file.filename, "status": "ready"}
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
        from app.services.ai_agents.agents.rag_agent import rag_agent
        # RAG agent will automatically use the vector store we populated during upload
        answer = rag_agent.get_answer(req.question)
        return {"answer": answer, "source": session["filename"]}
    except Exception as e:
        return {"answer": f"Error: {str(e)}", "source": session["filename"]}


@router.get("/sessions")
def list_sessions(current_user: User = Depends(get_current_user)):
    user_sessions = {
        sid: {"filename": s["filename"], "pages": s["pages"]}
        for sid, s in pdf_sessions.items()
        if s["user_id"] == current_user.id
    }
    return {"sessions": user_sessions}


