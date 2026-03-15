from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import uuid
from sqlmodel import Session, select

from app.core.ai_router import get_ai_response
from app.models.models import ChatMessage
from app.core.database import get_session
from app.core.rate_limit import limiter

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    image_base64: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    ai_model: str


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(request: Request, req: ChatRequest, db: Session = Depends(get_session)):
    
    session_id = req.session_id or str(uuid.uuid4())

    # Fetch history
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()

    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # Decode image if present
    image_data = None
    if req.image_base64:
        import base64
        try:
            if "," in req.image_base64:
                header, encoded = req.image_base64.split(",", 1)
            else:
                encoded = req.image_base64

            image_data = base64.b64decode(encoded)

        except Exception as e:
            print(f"Error decoding image: {e}")

    # Generate AI Response
    response_text = get_ai_response(req.message, history, image_data=image_data)

    # Save User message
    user_msg = ChatMessage(
        session_id=session_id,
        user_id=None,
        role="user",
        content=req.message
    )
    db.add(user_msg)

    # Save AI message
    ai_msg = ChatMessage(
        session_id=session_id,
        user_id=None,
        role="assistant",
        content=response_text
    )
    db.add(ai_msg)

    db.commit()

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        ai_model="tulasi-ai"
    )


@router.get("/history/{session_id}")
def get_history(session_id: str, db: Session = Depends(get_session)):

    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()

    messages = [{"role": m.role, "content": m.content} for m in db_messages]

    return {"messages": messages, "session_id": session_id}


@router.delete("/history/{session_id}")
def clear_history(session_id: str, db: Session = Depends(get_session)):

    statement = select(ChatMessage).where(ChatMessage.session_id == session_id)
    db_messages = db.exec(statement).all()

    for m in db_messages:
        db.delete(m)

    db.commit()

    return {"message": "Cleared"}