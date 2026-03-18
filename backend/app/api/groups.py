"""
Group Chat API — /api/groups
Supports: create group, join by code, list user groups, get/send messages
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import random
import string
from datetime import datetime

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User, Group, GroupMember, GroupMessage

router = APIRouter()


def generate_join_code(length: int = 6) -> str:
    """Generate a unique 6-character alphanumeric join code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


def _ensure_unique_code(db: Session) -> str:
    for _ in range(10):
        code = generate_join_code()
        existing = db.exec(select(Group).where(Group.join_code == code)).first()
        if not existing:
            return code
    raise HTTPException(500, "Could not generate unique join code. Try again.")


# ── Schemas ──────────────────────────────────────────────────────────────────

class CreateGroupRequest(BaseModel):
    name: str
    description: str = ""


class JoinGroupRequest(BaseModel):
    join_code: str


class SendMessageRequest(BaseModel):
    content: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/create")
def create_group(
    req: CreateGroupRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    code = _ensure_unique_code(db)
    group = Group(
        name=req.name.strip(),
        description=req.description.strip(),
        join_code=code,
        created_by=current_user.id,
    )
    db.add(group)
    db.commit()
    db.refresh(group)

    # Auto-add creator as member
    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        user_name=current_user.name or current_user.email.split("@")[0],
    )
    db.add(member)
    db.commit()

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "join_code": group.join_code,
        "created_by": group.created_by,
        "created_at": group.created_at.isoformat(),
        "member_count": 1,
    }


@router.post("/join")
def join_group(
    req: JoinGroupRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    code = req.join_code.strip().upper()
    group = db.exec(select(Group).where(Group.join_code == code)).first()
    if not group:
        raise HTTPException(404, f"No group found with code '{code}'")

    # Check if already a member
    already = db.exec(
        select(GroupMember).where(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id,
        )
    ).first()
    if already:
        return {"message": "You are already a member of this group", "group": {
            "id": group.id, "name": group.name, "join_code": group.join_code
        }}

    member = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        user_name=current_user.name or current_user.email.split("@")[0],
    )
    db.add(member)
    db.commit()

    return {
        "message": f"Joined group '{group.name}' successfully!",
        "group": {"id": group.id, "name": group.name, "join_code": group.join_code},
    }


@router.get("")
def list_my_groups(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    memberships = db.exec(
        select(GroupMember).where(GroupMember.user_id == current_user.id)
    ).all()

    result = []
    for m in memberships:
        group = db.get(Group, m.group_id)
        if not group:
            continue
        member_count = len(
            db.exec(select(GroupMember).where(GroupMember.group_id == group.id)).all()
        )
        result.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "join_code": group.join_code,
            "created_by": group.created_by,
            "created_at": group.created_at.isoformat(),
            "member_count": member_count,
        })

    return {"groups": result}


@router.get("/{group_id}/messages")
def get_messages(
    group_id: int,
    limit: int = 50,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Verify membership
    member = db.exec(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
        )
    ).first()
    if not member:
        raise HTTPException(403, "You are not a member of this group")

    messages = db.exec(
        select(GroupMessage)
        .where(GroupMessage.group_id == group_id)
        .order_by(GroupMessage.created_at.asc())
        .limit(limit)
    ).all()

    return {
        "group_id": group_id,
        "messages": [
            {
                "id": msg.id,
                "user_id": msg.user_id,
                "user_name": msg.user_name,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ],
    }


@router.post("/{group_id}/messages")
def send_message(
    group_id: int,
    req: SendMessageRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Verify membership
    member = db.exec(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
        )
    ).first()
    if not member:
        raise HTTPException(403, "You are not a member of this group")

    if not req.content.strip():
        raise HTTPException(400, "Message content cannot be empty")

    msg = GroupMessage(
        group_id=group_id,
        user_id=current_user.id,
        user_name=current_user.name or current_user.email.split("@")[0],
        content=req.content.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "user_id": msg.user_id,
        "user_name": msg.user_name,
        "content": msg.content,
        "created_at": msg.created_at.isoformat(),
    }


@router.get("/{group_id}")
def get_group(
    group_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    group = db.get(Group, group_id)
    if not group:
        raise HTTPException(404, "Group not found")

    member = db.exec(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
        )
    ).first()
    if not member:
        raise HTTPException(403, "You are not a member of this group")

    members = db.exec(
        select(GroupMember).where(GroupMember.group_id == group_id)
    ).all()

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "join_code": group.join_code,
        "created_by": group.created_by,
        "created_at": group.created_at.isoformat(),
        "members": [
            {"user_id": m.user_id, "user_name": m.user_name, "joined_at": m.joined_at.isoformat()}
            for m in members
        ],
    }
