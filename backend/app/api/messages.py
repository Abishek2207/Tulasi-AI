from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select, or_, and_
from typing import List, Dict
from pydantic import BaseModel
import json
import asyncio

from app.models.models import User, DirectMessage
from app.api.auth import get_current_user, get_user_from_token
from app.api.activity import log_activity_internal
from app.core.database import get_session

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

class MessageSend(BaseModel):
    receiver_id: int
    content: str

@router.post("")
async def send_message(req: MessageSend, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    msg = DirectMessage(sender_id=current_user.id, receiver_id=req.receiver_id, content=req.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    # ── 💬 Log Activity ───────────────────────────────────────────
    log_activity_internal(current_user, db, "message_sent", f"Sent a direct message")
    db.commit()
    # ─────────────────────────────────────────────────────────────
    
    # Notify recipient via WebSocket if online
    msg_data = {
        "type": "new_message",
        "message": {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "content": msg.content,
            "created_at": msg.created_at.isoformat() if hasattr(msg.created_at, 'isoformat') else str(msg.created_at)
        }
    }
    await manager.send_personal_message(msg_data, req.receiver_id)
    
    return {"status": "success", "message": msg}

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_session)):
    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4003)
        return

    await manager.connect(user.id, websocket)
    try:
        while True:
            # Just keep connection alive and wait for disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user.id)

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
