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
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
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

        pdf_sessions[session_id] = {
            "filename": file.filename,
            "pages": len(reader.pages),
            "user_id": current_user.id,
            "text": full_text,
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

    # Use first 8000 chars as context to stay within token limits
    context = session["text"][:8000]

    try:
        gemini_key = settings.effective_gemini_key
        if gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"Answer the question based STRICTLY on this context:\n{context}\n\nQuestion: {req.question}"
            response = model.generate_content(prompt)
            return {"answer": response.text, "source": session["filename"]}

        if settings.GROQ_API_KEY:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"Answer from context only.\n\nCONTEXT:\n{context}"},
                    {"role": "user", "content": req.question},
                ],
                max_tokens=1024,
            )
            return {"answer": completion.choices[0].message.content, "source": session["filename"]}

        return {"answer": "No AI API key configured.", "source": session["filename"]}
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


