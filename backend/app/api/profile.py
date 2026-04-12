from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserTypeEnum
from app.models.profile import Profile
from app.schemas.user import UserResponse, ProfileResponse, ProfileCreate, MentorNameRequest, SkillUpdateRequest, SkillItem
from typing import Optional
import json

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    profile_data: ProfileCreate,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    for key, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/set-user-type", response_model=UserResponse)
async def set_user_type(
    user_type: UserTypeEnum,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.user_type = user_type
    
    # Auto-create profile if doesn't exist
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        if user_type == UserTypeEnum.STUDENT:
            profile.current_role = "Student"
        elif user_type == UserTypeEnum.PROFESSIONAL:
            profile.current_role = "Professional"
        db.add(profile)
        
    db.commit()
    db.refresh(current_user)
    return current_user


# ── NEW: AI Mentor Name ──────────────────────────────────────────────────────

@router.post("/set-mentor-name")
async def set_mentor_name(
    body: MentorNameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save user's custom AI mentor name to their profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    profile.ai_mentor_name = body.mentor_name.strip()
    db.commit()
    db.refresh(profile)
    return {"success": True, "ai_mentor_name": profile.ai_mentor_name}


# ── NEW: Skill Tracking ──────────────────────────────────────────────────────

@router.get("/skills")
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the user's tracked skills with progress percentages."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.skills:
        # Return default skills based on user_type
        if current_user.user_type == UserTypeEnum.STUDENT:
            default_skills = [
                {"name": "Data Structures & Algorithms", "progress": 0, "category": "placement"},
                {"name": "Problem Solving", "progress": 0, "category": "placement"},
                {"name": "Aptitude & Reasoning", "progress": 0, "category": "placement"},
                {"name": "Web Development", "progress": 0, "category": "projects"},
                {"name": "System Design Basics", "progress": 0, "category": "core"},
            ]
        else:
            default_skills = [
                {"name": "AI / Machine Learning", "progress": 0, "category": "ai"},
                {"name": "Cloud Computing", "progress": 0, "category": "cloud"},
                {"name": "System Design", "progress": 0, "category": "architecture"},
                {"name": "Leadership", "progress": 0, "category": "soft-skills"},
                {"name": "DevOps / CI-CD", "progress": 0, "category": "devops"},
            ]
        return {"skills": default_skills, "is_default": True}

    try:
        skills = json.loads(profile.skills)
    except (json.JSONDecodeError, TypeError):
        skills = []

    return {"skills": skills, "is_default": False}


@router.post("/skills")
async def update_my_skills(
    body: SkillUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's skills tracking data."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    # Validate progress values 0-100
    skills_data = []
    for skill in body.skills:
        skills_data.append({
            "name": skill.name,
            "progress": max(0, min(100, skill.progress)),
            "category": skill.category
        })
    
    profile.skills = json.dumps(skills_data)
    db.commit()
    
    return {"success": True, "skills": skills_data, "total": len(skills_data)}

