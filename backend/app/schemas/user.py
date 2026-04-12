from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from app.models.user import UserTypeEnum


class SkillItem(BaseModel):
    name: str
    progress: int = 0          # 0-100%
    category: str = "general"  # placement / upskilling / ai / cloud etc.


class ProfileBase(BaseModel):
    current_role: Optional[str] = None
    company: Optional[str] = None
    experience_years: Optional[int] = 0
    skill_level: Optional[str] = None
    ai_mentor_name: Optional[str] = None
    skills: Optional[str] = None             # JSON string of SkillItem[]
    learning_hours_per_day: Optional[int] = 2


class ProfileCreate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    user_type: Optional[UserTypeEnum] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    role: str
    streak_count: int = 0
    created_at: datetime
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# --------------- Roadmap Schemas ---------------
class StudentRoadmapRequest(BaseModel):
    days: int = 7
    hours_per_day: int = 2
    focus: Optional[str] = None       # e.g. "DSA", "Projects", "Aptitude"
    target_company: Optional[str] = None


class ProfessionalRoadmapRequest(BaseModel):
    role: Optional[str] = None
    experience_years: Optional[int] = None
    company: Optional[str] = None
    target_skill: Optional[str] = None   # e.g. "AI", "Cloud", "System Design"


# --------------- Skill Update Schema ---------------
class SkillUpdateRequest(BaseModel):
    skills: List[SkillItem]


# --------------- Mentor Name Schema ---------------
class MentorNameRequest(BaseModel):
    mentor_name: str

