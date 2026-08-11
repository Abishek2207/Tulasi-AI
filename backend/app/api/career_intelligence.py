from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from app.core.database import get_session
from app.models.models import User, CareerIntelligenceProfile
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/career-intelligence", tags=["career_intelligence"])

class CareerIntelProfileCreateUpdate(BaseModel):
    career_stage: str
    full_name: str
    institution: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    field: Optional[str] = None
    current_role: Optional[str] = None
    target_role: Optional[str] = None
    company: Optional[str] = None
    experience_years: Optional[int] = None
    experience_level: Optional[str] = None
    current_skills: Optional[str] = None
    current_salary: Optional[str] = None
    target_salary: Optional[str] = None
    career_goal: Optional[str] = None
    daily_time_minutes: int
    learning_days: str

@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    profile = db.exec(
        select(CareerIntelligenceProfile).where(CareerIntelligenceProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return profile

@router.post("/profile")
def create_profile(
    data: CareerIntelProfileCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    existing = db.exec(
        select(CareerIntelligenceProfile).where(CareerIntelligenceProfile.user_id == current_user.id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
        
    new_profile = CareerIntelligenceProfile(
        user_id=current_user.id,
        onboarding_completed=True,
        **data.dict()
    )
    
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    return new_profile

@router.put("/profile")
def update_profile(
    data: CareerIntelProfileCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    profile = db.exec(
        select(CareerIntelligenceProfile).where(CareerIntelligenceProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    profile.updated_at = datetime.utcnow()
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return profile
