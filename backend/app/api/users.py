from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.models import User, Profile
import os
import io
import re
from pydantic import BaseModel, constr
from typing import Optional

class SetUsernameRequest(BaseModel):
    username: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    # Profile specific
    bio: Optional[str] = None
    skills: Optional[str] = None
    department: Optional[str] = None
    target_role: Optional[str] = None
    interest_areas: Optional[str] = None

router = APIRouter()

@router.get("/me")
def get_my_profile(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    profile = current_user.profile
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "name": current_user.name,
        "avatar": current_user.avatar,
        "role": current_user.role,
        "is_pro": current_user.is_pro,
        "xp": current_user.xp,
        "level": current_user.level,
        "bio": profile.career_goal if profile else None,
        "skills": profile.current_skills if profile else None,
        "department": profile.department if profile else None,
        "target_role": profile.target_role if profile else None,
        "interest_areas": profile.preferred_companies if profile else None,
    }


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if data.name is not None: current_user.name = data.name
    if data.avatar is not None: current_user.avatar = data.avatar
    db.add(current_user)
    
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    if data.bio is not None: profile.career_goal = data.bio
    if data.skills is not None: profile.current_skills = data.skills
    if data.department is not None: profile.department = data.department
    if data.target_role is not None: profile.target_role = data.target_role
    if data.interest_areas is not None: profile.preferred_companies = data.interest_areas
    
    db.add(profile)
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "user": {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "avatar": current_user.avatar,
        "email": current_user.email
    }}


@router.post("/set-username")
def set_username(
    data: SetUsernameRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    username = data.username.lower().strip()
    
    if not re.match(r"^[a-z0-9_]{3,20}$", username):
        raise HTTPException(status_code=400, detail="Username must be 3-20 characters")
    
    existing = db.exec(select(User).where(User.username == username)).first()
    if existing and existing.id != current_user.id:
        raise HTTPException(status_code=400, detail="Username is already taken. Try another!")
    
    current_user.username = username
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "username": current_user.username}

@router.get("/search")
def search_users(q: str, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Search for users by username or name."""
    if not q or len(q.strip()) < 1:
        statement = select(User).where(User.id != current_user.id).limit(50)
    else:
        statement = select(User).where(
            (User.id != current_user.id) &
            ((User.username.ilike(f"%{q}%")) | (User.name.ilike(f"%{q}%")))
        ).limit(50)
        
    users = db.exec(statement).all()
    
    return [{"id": u.id, "username": u.username, "name": u.name, "avatar": u.avatar} for u in users]
