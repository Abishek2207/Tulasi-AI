from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import UserTypeEnum


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
    student_year: Optional[str] = None
    student_goal: Optional[str] = None
    current_salary_range: Optional[str] = None
    target_salary_goal: Optional[str] = None
    
    # ── TulasiAI Career Shield Expansion ──
    daily_available_hours: Optional[str] = None
    available_days: Optional[str] = None
    placement_goal: Optional[str] = None
    preferred_companies: Optional[str] = None
    weak_areas: Optional[str] = None
    resume_status: Optional[str] = None
    existing_projects: Optional[str] = None
    current_package_range_prof: Optional[str] = None
    target_package: Optional[str] = None
    industry: Optional[str] = None
    career_goal: Optional[str] = None
    tools_used: Optional[str] = None
    ai_tools_known: Optional[str] = None
    college_name: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    target_role: Optional[str] = None
    current_skills: Optional[str] = None


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

