from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: Optional[str] = None
    name: str = ""
    bio: Optional[str] = None
    skills: Optional[str] = None  # comma-separated
    avatar: Optional[str] = None
    role: str = "student"
    provider: str = "email"
    invite_code: Optional[str] = None
    referred_by: Optional[str] = None
    streak: int = 0
    longest_streak: int = 0
    xp: int = 0
    level: int = 1
    last_activity_date: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_pro: bool = False
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    chats_today: int = 0
    last_reset_date: Optional[str] = None


class ChatSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    session_id: str = Field(index=True)
    title: str = "New Chat"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Certificate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    issuer: str = "Tulasi AI"
    cert_type: str = "upload"
    file_path: Optional[str] = None
    issued_at: datetime = Field(default_factory=datetime.utcnow)


class Hackathon(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    organizer: str
    description: str
    prize: str = ""
    prize_pool: str = ""
    deadline: str
    link: str
    registration_link: str = ""
    tags: str = ""
    image_url: str = ""
    participants_count: int = 0
    status: str = "Open"
    is_active: bool = True


# IMPORTANT FIX
class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", nullable=True)
    role: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DirectMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id", index=True)
    receiver_id: int = Field(foreign_key="user.id", index=True)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ActivityLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    action_type: str
    title: str = ""
    metadata_json: Optional[str] = None
    xp_earned: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    category: str
    total_items: int = 0
    completed_items: int = 0
    progress_pct: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SolvedProblem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    problem_id: str = Field(index=True)
    solved_at: datetime = Field(default_factory=datetime.utcnow)


class Roadmap(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    goal: str
    title: str
    description: str
    estimated_months: int = 6
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RoadmapStep(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    roadmap_id: int = Field(foreign_key="roadmap.id", index=True)
    phase: str
    title: str
    duration: str
    topics_json: str
    project_idea: str
    resources_json: str


class UserBadge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    description: str = ""
    icon: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)


class Reward(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    cost_xp: int
    image_url: Optional[str] = None
    category: str = "customization"


class StudyRoom(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    tag: str = "General"
    color: str = "#6C63FF"
    created_by: int = Field(foreign_key="user.id")
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StudyRoomMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="studyroom.id", index=True)
    user_id: int = Field(foreign_key="user.id")
    user_name: str = ""
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SavedStartupIdea(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    problem: str = ""
    solution: str = ""
    market_opportunity: str = ""
    tech_stack: str = ""
    monetization: str = ""
    domain: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str = ""
    join_code: str = Field(unique=True, index=True)
    created_by: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="group.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    user_name: str = ""
    joined_at: datetime = Field(default_factory=datetime.utcnow)


class GroupMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="group.id", index=True)
    user_id: int = Field(foreign_key="user.id")
    user_name: str = ""
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HackathonBookmark(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    hackathon_id: int = Field(foreign_key="hackathon.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SavedResume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    document_type: str = "Resume"  # Resume or Cover Letter
    mode: str = "ATS-Optimized"
    original_resume: str
    job_description: str
    improved_resume: str
    ats_score: int = 0
    readability_score: int = 0
    keyword_match_percent: int = 0
    feedback_json: str = "[]"
    missing_keywords_json: str = "[]"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    role: str = ""
    company: str = ""
    review: str
    rating: int = 5
    is_approved: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)