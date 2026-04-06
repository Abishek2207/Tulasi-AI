import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, UserFollow
from app.websockets.manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

class UserSearchResult(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    role: str
    follow_status: str # "none", "pending", "accepted", "self"

@router.get("/search", response_model=List[UserSearchResult])
async def search_users(q: str, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Search for users by name and get follow status."""
    if not q or len(q) < 2:
        return []
    
    # Case-insensitive search
    statement = select(User).where(User.name.ilike(f"%{q}%")).limit(20)
    users = db.exec(statement).all()
    
    results = []
    for u in users:
        if u.id == current_user.id:
            status = "self"
        else:
            # Check follow status
            follow_stmt = select(UserFollow).where(
                UserFollow.follower_id == current_user.id,
                UserFollow.following_id == u.id
            )
            follow = db.exec(follow_stmt).first()
            if follow:
                status = follow.status
            else:
                status = "none"
                
        results.append(UserSearchResult(
            id=u.id,
            name=u.name,
            avatar=u.avatar,
            role=u.role,
            follow_status=status
        ))
        
    # User requested: "Do not return 'No one found' if user exists."
    # The frontend will map [] to empty state, but here we return all matches.
    return results

@router.post("/follow/{target_id}")
async def follow_user(target_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Send a follow request."""
    if target_id == current_user.id:
        raise HTTPException(400, "Cannot follow yourself")
        
    target_user = db.get(User, target_id)
    if not target_user:
        raise HTTPException(404, "User not found")
        
    # Check if already requested/following
    existing = db.exec(select(UserFollow).where(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == target_id
    )).first()
    
    if existing:
        return {"status": existing.status}
        
    new_follow = UserFollow(follower_id=current_user.id, following_id=target_id, status="pending")
    db.add(new_follow)
    db.commit()
    db.refresh(new_follow)
    
    # Notify target user via websocket
    import asyncio
    asyncio.create_task(manager.broadcast({
        "type": "follow_request_received",
        "follower_id": current_user.id,
        "follower_name": current_user.name
    }, room_id=f"user_{target_id}"))
    
    # Trigger AI Mentor hook asynchronously
    from app.api.mentor import trigger_mentor_insight
    asyncio.create_task(trigger_mentor_insight(current_user.id, "follow", f"Followed {target_user.name}"))
    
    return {"status": "pending"}

@router.post("/follow/requests/{follower_id}/accept")
async def accept_follow(follower_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    follow = db.exec(select(UserFollow).where(
        UserFollow.follower_id == follower_id,
        UserFollow.following_id == current_user.id,
        UserFollow.status == "pending"
    )).first()
    
    if not follow:
        raise HTTPException(404, "Follow request not found")
        
    follow.status = "accepted"
    db.add(follow)
    
    # Automatically establish ChatRequest connection as requested
    from app.models.models import ChatRequest
    from sqlalchemy import or_, and_
    existing_chat = db.exec(select(ChatRequest).where(
        or_(
            and_(ChatRequest.sender_id == follower_id, ChatRequest.receiver_id == current_user.id),
            and_(ChatRequest.sender_id == current_user.id, ChatRequest.receiver_id == follower_id)
        )
    )).first()
    
    if existing_chat:
        existing_chat.status = "accepted"
        db.add(existing_chat)
    else:
        new_chat = ChatRequest(sender_id=follower_id, receiver_id=current_user.id, status="accepted")
        db.add(new_chat)

    db.commit()
    
    import asyncio
    asyncio.create_task(manager.broadcast({
        "type": "follow_request_accepted",
        "following_id": current_user.id,
        "following_name": current_user.name
    }, room_id=f"user_{follower_id}"))
    
    return {"status": "accepted"}

@router.post("/follow/requests/{follower_id}/reject")
async def reject_follow(follower_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    follow = db.exec(select(UserFollow).where(
        UserFollow.follower_id == follower_id,
        UserFollow.following_id == current_user.id,
        UserFollow.status == "pending"
    )).first()
    
    if not follow:
        raise HTTPException(404, "Follow request not found")
        
    # Cleanly remove the request as required
    db.delete(follow)
    db.commit()
    
    return {"status": "rejected"}
