from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import os

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    user_id: str = "anonymous"

class ChatResponse(BaseModel):
    response: str
    sources: list[str] = []

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    RAG chatbot endpoint.
    When FAISS + LangChain is configured, this will:
    1. Search vector store for relevant chunks
    2. Pass context + question to the LLM
    3. Return the generated response with source references
    
    Currently returns a fallback response for development.
    """
    # TODO: Integrate with LangChain + FAISS when HF_TOKEN is configured
    fallback_responses = {
        "hello": "Hello! I'm Tulasi AI. How can I help with your studies today?",
        "help": "I can help you learn concepts, explain PDFs you upload, and answer questions in multiple languages!",
    }
    
    msg_lower = request.message.lower()
    for key, response in fallback_responses.items():
        if key in msg_lower:
            return ChatResponse(response=response)
    
    return ChatResponse(
        response=f"I received your message: '{request.message}'. The AI backend will give intelligent responses once the LangChain + FAISS pipeline is configured with a HuggingFace model. For now, I echo your query.",
        sources=[]
    )

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF, parse it, chunk it, and store embeddings in FAISS.
    Currently saves the file and returns metadata.
    """
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, file.filename or "uploaded.pdf")
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    return {
        "filename": file.filename,
        "size_bytes": len(contents),
        "status": "uploaded",
        "message": "File saved. PDF parsing and FAISS indexing will be active once LangChain pipeline is configured."
    }
