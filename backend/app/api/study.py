from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, StudyRoom, StudyRoomMessage
from app.api.activity import log_activity_internal

router = APIRouter()


class RoomCreate(BaseModel):
    name: str
    description: str = ""
    tag: str = "General"
    color: str = "#6C63FF"
    is_public: bool = True


class MessageCreate(BaseModel):
    content: str


@router.get("/rooms")
def list_rooms(session: Session = Depends(get_session)):
    rooms = session.exec(select(StudyRoom)).all()
    return {
        "rooms": [
            {
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "tag": r.tag,
                "color": r.color,
                "is_public": r.is_public,
                "created_at": r.created_at.isoformat(),
                # Member count is approximated from messages
                "active": 0,
            }
            for r in rooms
        ]
    }


@router.post("/create")
def create_room(
    req: RoomCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    room = StudyRoom(
        name=req.name,
        description=req.description,
        tag=req.tag,
        color=req.color,
        created_by=current_user.id,
        is_public=req.is_public,
    )
    session.add(room)
    session.commit()
    session.refresh(room)

    # ── 🏗️ Log Activity ──────────────────────────────────────────
    log_activity_internal(current_user, session, "message_sent", f"Created study room: {room.name}")
    session.commit()
    # ─────────────────────────────────────────────────────────────
    return {
        "id": room.id,
        "name": room.name,
        "description": room.description,
        "tag": room.tag,
        "color": room.color,
        "created_at": room.created_at.isoformat(),
    }


@router.post("/join/{room_id}")
def join_room(
    room_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not room:
        raise HTTPException(404, "Room not found")

    # ── 🤝 Log Activity ──────────────────────────────────────────
    log_activity_internal(current_user, session, "message_sent", f"Joined study room: {room.name}")
    session.commit()
    # ─────────────────────────────────────────────────────────────
    return {"room_id": room_id, "status": "joined", "room_name": room.name}


@router.get("/{room_id}/messages")
def get_messages(
    room_id: int,
    limit: int = 50,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    room = session.get(StudyRoom, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    msgs = session.exec(
        select(StudyRoomMessage)
        .where(StudyRoomMessage.room_id == room_id)
        .order_by(StudyRoomMessage.created_at)
        .limit(limit)
    ).all()
    return {
        "room_id": room_id,
        "room_name": room.name,
        "messages": [
            {
                "id": m.id,
                "user_name": m.user_name,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in msgs
        ]
    }


@router.post("/{room_id}/messages")
def send_message(
    room_id: int,
    req: MessageCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    room = session.get(StudyRoom, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    if not req.content.strip():
        raise HTTPException(400, "Message cannot be empty")

    msg = StudyRoomMessage(
        room_id=room_id,
        user_id=current_user.id,
        user_name=current_user.name or current_user.email.split("@")[0],
        content=req.content.strip(),
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)

    # ── 💬 Log Activity ──────────────────────────────────────────
    log_activity_internal(current_user, session, "message_sent", f"Sent message in room: {room.name}")
    session.commit()
    # ─────────────────────────────────────────────────────────────
    return {
        "id": msg.id,
        "user_name": msg.user_name,
        "content": msg.content,
        "created_at": msg.created_at.isoformat(),
    }
