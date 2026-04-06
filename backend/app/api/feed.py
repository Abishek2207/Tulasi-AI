import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import json

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, Idea, IdeaLike, IdeaComment
from app.websockets.manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

class IdeaCreate(BaseModel):
    content: str
    tags: Optional[str] = ""

class IdeaResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    tags: str
    likes_count: int
    comments_count: int
    is_liked_by_me: bool
    created_at: datetime

@router.post("/idea", response_model=IdeaResponse)
async def create_idea(idea_in: IdeaCreate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    new_idea = Idea(
        user_id=current_user.id,
        content=idea_in.content,
        tags=idea_in.tags or "",
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_idea)
    db.commit()
    db.refresh(new_idea)
    
    # Broadcast to feed room immediately
    resp = IdeaResponse(
        id=new_idea.id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_avatar=current_user.avatar,
        content=new_idea.content,
        tags=new_idea.tags,
        likes_count=0,
        comments_count=0,
        is_liked_by_me=False,
        created_at=new_idea.created_at
    )
    
    import asyncio
    asyncio.create_task(manager.broadcast({
        "type": "new_idea",
        "idea": resp.dict()
    }, room_id="feed"))
    
    # Trigger AI Mentor hook
    from app.api.mentor import trigger_mentor_insight
    asyncio.create_task(trigger_mentor_insight(current_user.id, "idea", f"Posted idea: {new_idea.content[:50]}..."))
    
    return resp

@router.get("", response_model=List[IdeaResponse])
async def get_feed(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(Idea).order_by(Idea.created_at.desc()).limit(50)
    ideas = db.exec(statement).all()
    
    results = []
    for idea in ideas:
        creator = db.get(User, idea.user_id)
        if not creator: continue
            
        liked = db.exec(select(IdeaLike).where(
            IdeaLike.idea_id == idea.id, IdeaLike.user_id == current_user.id
        )).first() is not None
        
        results.append(IdeaResponse(
            id=idea.id,
            user_id=creator.id,
            user_name=creator.name,
            user_avatar=creator.avatar,
            content=idea.content,
            tags=idea.tags,
            likes_count=idea.likes_count,
            comments_count=idea.comments_count,
            is_liked_by_me=liked,
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
    
    import asyncio
    asyncio.create_task(manager.broadcast({
        "type": "idea_like_update",
        "idea_id": idea_id,
        "likes_count": idea.likes_count
    }, room_id="feed"))
    
    return {"status": action, "likes_count": idea.likes_count}
