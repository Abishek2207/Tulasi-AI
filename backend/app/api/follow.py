from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, and_, or_
from typing import List, Dict, Optional
from datetime import datetime, timezone

from app.models.models import User, UserFollow
from app.api.deps import get_current_user
from app.core.database import get_session

router = APIRouter()

@router.post("/{user_id}")
async def follow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Initiate a follow request to another user."""
    if user_id == current_user.id:
        raise HTTPException(400, "Cannot follow yourself")
        
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
        
    # Check existing Follow
    existing = db.exec(select(UserFollow).where(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == user_id
    )).first()
    
    if existing:
        return {"status": "success", "follow_status": existing.status}
        
    status = "pending" if target.is_private else "accepted"
        
    new_follow = UserFollow(
        follower_id=current_user.id,
        following_id=user_id,
        status=status,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_follow)
    db.commit()
    db.refresh(new_follow)
    
    # Emit socket event for follow request
    from app.core.socket_server import sio, user_to_sid
    sid = user_to_sid.get(user_id)
    if sid:
        if status == "pending":
            await sio.emit("follow_request", {
                "follower_id": current_user.id,
                "follower_username": current_user.username
            }, to=sid)
        else:
            await sio.emit("follow_accepted", {
                "follower_id": current_user.id,
                "follower_username": current_user.username
            }, to=sid)
            
    return {"status": "success", "follow_status": status}


@router.patch("/{user_id}/accept")
async def accept_follow(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Accept a pending follow request from user_id."""
    pending_follow = db.exec(select(UserFollow).where(
        UserFollow.follower_id == user_id,
        UserFollow.following_id == current_user.id,
        UserFollow.status == "pending"
    )).first()
    
    if not pending_follow:
        raise HTTPException(404, "No pending follow request from this user found.")
        
    pending_follow.status = "accepted"
    db.add(pending_follow)
    db.commit()
    
    # Emit socket event for accept
    from app.core.socket_server import sio, user_to_sid
    sid = user_to_sid.get(user_id)
    if sid:
        await sio.emit("follow_accepted", {
            "following_id": current_user.id,
            "following_username": current_user.username
        }, to=sid)
        
    return {"status": "success", "follow_status": "accepted"}

@router.delete("/{user_id}")
async def unfollow_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    """Unfollow or cancel request."""
    existing = db.exec(select(UserFollow).where(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == user_id
    )).first()
    
    if existing:
        db.delete(existing)
        db.commit()
        
    return {"status": "success"}
