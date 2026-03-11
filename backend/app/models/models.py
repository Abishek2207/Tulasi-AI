from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: Optional[str] = None
    name: str = ""
    avatar: Optional[str] = None
    role: str = "student"  # "student" | "admin"
    provider: str = "email"  # "email" | "google" | "github"
    invite_code: Optional[str] = None
    referred_by: Optional[str] = None
    streak: int = 0
    xp: int = 0
    level: int = 1
    last_activity_date: Optional[str] = None  # ISO date string YYYY-MM-DD
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


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
    cert_type: str = "upload"  # "upload" | "auto"
    file_path: Optional[str] = None
    issued_at: datetime = Field(default_factory=datetime.utcnow)


class Hackathon(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    organizer: str
    description: str
    prize: str = ""
    deadline: str
    link: str
    tags: str = ""  # comma-separated
    is_active: bool = True

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    user_id: int = Field(foreign_key="user.id")
    role: str  # "user" or "model"
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
    # action_type: code_solved | video_watched | reel_watched | interview_completed | roadmap_step | hackathon_joined | roadmap_completed | course_completed
    action_type: str
    title: str = ""  # human readable label, e.g. "Solved: Two Sum"
    metadata_json: Optional[str] = None  # JSON string for extra data
    xp_earned: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserProgress(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    category: str  # "coding" | "interview" | "roadmap" | "videos"
    total_items: int = 0
    completed_items: int = 0
    progress_pct: int = 0   # 0–100
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SolvedProblem(SQLModel, table=True):
    """Tracks which coding problems a user has solved."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    problem_id: str = Field(index=True)  # e.g. "ARR-001"
    solved_at: datetime = Field(default_factory=datetime.utcnow)

