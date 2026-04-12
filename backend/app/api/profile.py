from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, UserTypeEnum, Profile
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

from app.services.vector_service import vector_service

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
    
    data = profile_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)

    # Index into RAG Memory for instant Jarvis awareness
    try:
        context_parts = []
        if current_user.user_type:
            context_parts.append(f"User is a {current_user.user_type}.")
        if profile.current_role:
            context_parts.append(f"Current Role: {profile.current_role}.")
        if profile.company:
            context_parts.append(f"Company: {profile.company}.")
        if profile.experience_years:
            context_parts.append(f"Experience: {profile.experience_years} years.")
        if profile.student_year:
            context_parts.append(f"Academic Year: {profile.student_year}.")
        if profile.student_goal:
            context_parts.append(f"Goal: {profile.student_goal}.")
        if profile.current_salary_range:
            context_parts.append(f"Current Salary: {profile.current_salary_range}.")
        if profile.target_salary_goal:
            context_parts.append(f"Target Salary Goal: {profile.target_salary_goal}.")

        if context_parts:
            summary = " ".join(context_parts)
            vector_service.store_embeddings(current_user.id, f"PROFILE CONTEXT: {summary}", db)
            print(f"✅ Indexed profile context for user {current_user.id}")
    except Exception as e:
        print(f"⚠️ Profile indexing failed: {e}")

    return profile

@router.post("/set-user-type", response_model=UserResponse)
async def set_user_type(
    user_type: UserTypeEnum,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.user_type = user_type
    # ── Critical Fix: persist onboarded flag to DB so it survives new sessions ──
    current_user.is_onboarded = True
    
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

