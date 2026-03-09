from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_, and_
from typing import List
from pydantic import BaseModel

from app.models.models import User, DirectMessage
from app.api.auth import get_current_user
from app.core.database import get_session

router = APIRouter()

class MessageSend(BaseModel):
    receiver_id: int
    content: str

@router.post("")
def send_message(req: MessageSend, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    msg = DirectMessage(sender_id=current_user.id, receiver_id=req.receiver_id, content=req.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"status": "success", "message": msg}

@router.get("/{other_user_id}")
def get_conversation(other_user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    statement = select(DirectMessage).where(
        or_(
            and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_user_id),
            and_(DirectMessage.sender_id == other_user_id, DirectMessage.receiver_id == current_user.id)
        )
    ).order_by(DirectMessage.created_at)
    
    messages = db.exec(statement).all()
    return {"messages": messages}

@router.get("/users/directory")
def get_user_directory(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    statement = select(User).where(User.id != current_user.id)
    users = db.exec(statement).all()
    return {"users": [{"id": u.id, "name": u.name or u.email.split("@")[0], "email": u.email, "role": u.role} for u in users]}
