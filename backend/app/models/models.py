from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String
from typing import Optional, List
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
    is_pro: bool = True
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    chats_today: int = 0
    last_reset_date: Optional[str] = None
    pro_expiry_date: Optional[str] = None  # Tracks 2-month free pro rewards
    # ── Platform Upgrade Fields ──
    user_type: str = "student"           # 1st_year | 2nd_year | 3rd_year | 4th_year | professional | professor
    abuse_count: int = 0                 # Safety: incremented on harmful input
    is_onboarded: bool = False           # True after user completes onboarding modal
    
    # ── Career Intelligence Metadata ──
    department: Optional[str] = None     # e.g. "Computer Science", "Information Technology"
    target_role: Optional[str] = None    # e.g. "AI Engineer", "Frontend Developer"
    target_companies: Optional[str] = None # comma-separated
    interest_areas: Optional[str] = None # comma-separated (e.g. "Web3, LLMs, DevOps")
    onboarding_step: int = 0             # Track multi-step onboarding progress
    
    # ── [NEW] Super Intelligence Profile ──
    user_intelligence_profile: Optional[str] = "{}" # JSON: {facts: [], strengths: [], gaps: [], career_velocity: 50, technical_depth: 30}
    last_intelligence_update: datetime = Field(default_factory=datetime.utcnow)
    behavioral_patterns: Optional[str] = "{}" # JSON: {learning_style: "visual", responsiveness: "high", focus_areas: []}
    
    # Relationships
    resumes: List["SavedResume"] = Relationship(back_populates="user")



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
    deadline: str  # Kept for backward compatibility but ISO format preferred
    link: str
    registration_link: str = ""
    tags: str = ""
    image_url: str = ""
    participants_count: int = 0
    status: str = "Active"
    is_active: bool = True
    
    # [NEW] Discovery Metadata
    event_mode: str = Field(default="Online", sa_column=Column("event_mode", String), alias="mode")
    difficulty: str = "Beginner"  # Beginner, Intermediate, Advanced
    team_size: str = "1-4 builders"
    start_date: Optional[str] = None  # ISO Date
    end_date: Optional[str] = None    # ISO Date
    registration_deadline: Optional[str] = None # ISO Date
    domains: str = "" # Comma-separated domains
    currency: str = "USD"
    location: Optional[str] = None


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
    is_encrypted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserFeedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    message_id: str
    rating: int = Field(ge=1, le=5)  # e.g., 1 for bad, 5 for good
    context: str = ""
    expected_better: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserMemoryChunk(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    content: str
    embedding_json: str  # Storing as stringified JSON representation of array for simple compat
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HackathonBookmark(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    hackathon_id: int = Field(foreign_key="hackathon.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HackathonApplication(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    hackathon_id: int = Field(foreign_key="hackathon.id", index=True)
    status: str = "Applied"  # Applied, Ongoing, Completed
    applied_at: datetime = Field(default_factory=datetime.utcnow)


class SavedResume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False
    resume_mode: str = Field(default="ATS-Optimized", sa_column=Column("resume_mode", String), alias="mode")
    
    user: Optional["User"] = Relationship(back_populates="resumes")
    document_type: str = "Resume"  # Resume or Cover Letter
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
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True)
    name: str = Field(index=True)
    email: Optional[str] = Field(None, index=True)
    role: Optional[str] = None
    review: str
    rating: int = Field(ge=1, le=5)
    is_featured: bool = False
    is_approved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PersistentInterviewSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: str
    company: str
    interview_type: str
    num_questions: int
    questions_asked: int = 0
    history_json: str = "[]"
    status: str = "in_progress" # in_progress, completed
    feedback_json: Optional[str] = None
    scores_json: str = "{}"
    current_difficulty: int = 5
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Feature #7: Internship Discovery ─────────────────────────────────────────
class Internship(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    company: str
    domain: str                  # AI, Web Dev, DevOps, Data Science, etc.
    type: str = "Paid"           # Paid | Unpaid
    mode: str = "Online"         # Online | Offline | Hybrid
    location: Optional[str] = None
    stipend: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    apply_link: str = ""
    deadline: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ── Feature #6: Prep Plan ─────────────────────────────────────────────────────
class PrepPlan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: str                    # Software Engineer | AI/ML Engineer | Data Analyst
    duration: str                # 1-month | 3-month | 6-month
    plan_json: str = "[]"        # Serialised JSON of the week-by-week plan
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Announcement(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)  # Using string ID (UUID or slug)
    message: str
    type: str = "info"  # info, warning, success, pink
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    created_by: str = "admin"
    is_active: bool = True


class InviteCode(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(unique=True, index=True)
    usage_count: int = 0
    usage_limit: int = 100
    grants_pro: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None