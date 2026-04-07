import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, Idea, IdeaLike, IdeaComment, UserFollow
from app.core.socket_server import sio

logger = logging.getLogger(__name__)

router = APIRouter()

class IdeaCreate(BaseModel):
    content: str
    tags: Optional[str] = ""

class IdeaResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_username: Optional[str] = None
    user_avatar: Optional[str] = None
    content: str
    tags: Optional[str] = ""
    likes_count: int
    comments_count: int
    is_liked_by_me: bool
    is_following_creator: bool = False
    created_at: datetime

@router.post("/idea", response_model=IdeaResponse)
async def create_idea(idea_in: IdeaCreate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_idea = Idea(
        user_id=current_user.id,
        content=idea_in.content or "",
        tags=idea_in.tags or "",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_idea)
    db.commit()
    db.refresh(new_idea)
    
    resp = IdeaResponse(
        id=new_idea.id,
        user_id=current_user.id,
        user_name=current_user.name or "User",
        user_username=current_user.username,
        user_avatar=current_user.avatar,
        content=new_idea.content or "",
        tags=new_idea.tags or "",
        likes_count=0,
        comments_count=0,
        is_liked_by_me=False,
        is_following_creator=False,
        created_at=new_idea.created_at
    )
    
    # Trigger AI Mentor hook
    try:
        import asyncio
        from app.api.mentor import trigger_mentor_insight
        asyncio.create_task(trigger_mentor_insight(current_user.id, "idea", f"Posted idea: {new_idea.content[:50]}..."))
    except Exception as e:
        logger.error(f"Mentor insight trigger failed: {e}")
        
    # Broadcast to realtime feed
    try:
        import asyncio
        import json
        asyncio.create_task(sio.emit("new_idea", json.loads(resp.model_dump_json()), room="feed"))
    except Exception as e:
        logger.error(f"Realtime Feed Broadcast failed: {e}")
    
    return resp

@router.get("", response_model=List[IdeaResponse])
async def get_feed(
    tab: str = "global", 
    db: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    # 1. Build the base query for IDs based on tab
    if tab == "personal" or tab == "network":
        # Get ideas from users I follow (accepted state)
        following_ids_stmt = select(UserFollow.following_id).where(
            UserFollow.follower_id == current_user.id,
            UserFollow.status == "accepted"
        )
        following_ids = db.exec(following_ids_stmt).all()
        # Also include my own ideas
        following_ids.append(current_user.id)
        
        id_statement = select(Idea.id).where(Idea.user_id.in_(following_ids)).order_by(Idea.created_at.desc()).limit(50)
    else:
        id_statement = select(Idea.id).order_by(Idea.created_at.desc()).limit(50)
    
    target_ids = db.exec(id_statement).all()
    if not target_ids:
        return []

    # 2. Join with User to avoid N+1 overhead for the selected IDs
    ideas_with_users = db.exec(
        select(Idea, User)
        .join(User, Idea.user_id == User.id)
        .where(Idea.id.in_(target_ids))
        .order_by(Idea.created_at.desc())
    ).all()
    
    # 3. Get following map for current user to quickly check status
    follows = db.exec(select(UserFollow).where(UserFollow.follower_id == current_user.id)).all()
    follow_map = {f.following_id: f.status for f in follows}
    
    # 4. Get likes for these ideas in one go
    my_likes = db.exec(
        select(IdeaLike.idea_id)
        .where(IdeaLike.idea_id.in_(target_ids), IdeaLike.user_id == current_user.id)
    ).all()
    liked_set = set(my_likes)

    results = []
    for idea, creator in ideas_with_users:
        results.append(IdeaResponse(
            id=idea.id,
            user_id=creator.id,
            user_name=creator.name or "User",
            user_username=creator.username,
            user_avatar=creator.avatar,
            content=idea.content or "",
            tags=idea.tags or "",
            likes_count=idea.likes_count or 0,
            comments_count=idea.comments_count or 0,
            is_liked_by_me=idea.id in liked_set,
            is_following_creator=follow_map.get(creator.id) == "accepted",
            created_at=idea.created_at
        ))
    return results

@router.post("/{idea_id}/like")
async def toggle_like(idea_id: int, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    idea = db.get(Idea, idea_id)
    if not idea:
        raise HTTPException(404, "Idea not found")
        
    existing = db.exec(select(IdeaLike).where(
        IdeaLike.idea_id == idea_id, IdeaLike.user_id == current_user.id
    )).first()
    
    if existing:
        db.delete(existing)
        idea.likes_count = max(0, idea.likes_count - 1)
        action = "unliked"
    else:
        new_like = IdeaLike(user_id=current_user.id, idea_id=idea_id)
        db.add(new_like)
        idea.likes_count += 1
        action = "liked"
        
    db.add(idea)
    db.commit()
    
    # Broadcast update to feed room
    try:
        import asyncio
        asyncio.create_task(sio.emit("idea_like_update", {
            "idea_id": idea_id,
            "likes_count": idea.likes_count
        }, room="feed"))
    except Exception as e:
        logger.error(f"Socket emit failed: {e}")
    
    return {"status": action, "likes_count": idea.likes_count}
