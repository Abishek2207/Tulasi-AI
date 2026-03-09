from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()

@router.get("/")
def get_user_chats(db: Session = Depends(get_db)):
    return []

@router.post("/messages")
def send_message(content: str, db: Session = Depends(get_db)):
    return {"message": "Message received via API"}
