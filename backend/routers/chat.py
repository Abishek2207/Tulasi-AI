from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.rag_service import rag_service
from typing import Optional, List

router = APIRouter(prefix="/api/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str
    user_id: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    context: Optional[str] = None

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Search for context using RAG
    context = await rag_service.query_documents(request.message, request.user_id)
    
    # In a full implementation, we'd send context + message to LLM service
    # For now, we return a structured response
    return ChatResponse(
        response=f"I've analyzed your request: '{request.message}'. How can I help further?",
        context=context if context else "No specific document context found."
    )

@router.get("/history/{user_id}")
async def get_chat_history(user_id: str):
    return {"history": []}
