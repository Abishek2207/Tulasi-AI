from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from sqlmodel import Session, select

from app.core.ai_router import get_ai_response
from app.api.auth import get_current_user
from app.models.models import User, ChatMessage
from app.core.database import get_session

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    model_used: str

@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    session_id = req.session_id or str(uuid.uuid4())
    
    # Fetch history
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()
    history = [{"role": m.role, "content": m.content} for m in db_messages]
    
    # Generate AI Response
    response_text = get_ai_response(req.message, history)
    
    # Save User message
    user_msg = ChatMessage(session_id=session_id, user_id=current_user.id, role="user", content=req.message)
    db.add(user_msg)
    
    # Save AI message
    ai_msg = ChatMessage(session_id=session_id, user_id=current_user.id, role="assistant", content=response_text)
    db.add(ai_msg)
    
    db.commit()
    
    return ChatResponse(response=response_text, session_id=session_id, model_used="tulasi-ai")

@router.get("/history/{session_id}")
def get_history(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()
    messages = [{"role": m.role, "content": m.content} for m in db_messages]
    return {"messages": messages, "session_id": session_id}

@router.delete("/history/{session_id}")
def clear_history(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id)
    db_messages = db.exec(statement).all()
    for m in db_messages:
        db.delete(m)
    db.commit()
    return {"message": "Cleared"}

