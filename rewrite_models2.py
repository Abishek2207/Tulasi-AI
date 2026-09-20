import re

with open('backend/app/models/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

user_model_code = """class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: Optional[str] = Field(default=None, unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: Optional[str] = None
    name: str = ""
    avatar: Optional[str] = None
    user_type: str = "student"           # student | professional
    provider: str = "email"
    preferred_model: str = "gemini" # gemini, groq, openrouter, ollama
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
    is_private: bool = False
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    chats_today: int = 0
    last_reset_date: Optional[str] = None
    pro_expiry_date: Optional[str] = None  # Tracks 2-month free pro rewards
    abuse_count: int = 0                 # Safety: incremented on harmful input
    is_onboarded: bool = False           # True after user completes onboarding modal
    onboarding_step: int = 0             # Track multi-step onboarding progress
    
    # Relationships
    resumes: List["SavedResume"] = Relationship(back_populates="user")
    profile: Optional["Profile"] = Relationship(back_populates="user")
    career_intelligence_profile: Optional["CareerIntelligenceProfile"] = Relationship(back_populates="user")"""

profile_model_code = """class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    user_id: int = Field(foreign_key="user.id", unique=True, nullable=False)
    
    # Base
    bio: Optional[str] = None
    ai_mentor_name: Optional[str] = None
    skills: Optional[str] = None # JSON string
    skill_level: Optional[str] = None
    
    # Professional Fields
    current_role: Optional[str] = None
    company: Optional[str] = None
    experience_years: Optional[int] = 0
    industry: Optional[str] = None
    current_salary_range: Optional[str] = None
    current_package_range_prof: Optional[str] = None
    tools_used: Optional[str] = None
    ai_tools_known: Optional[str] = None
    
    # Student / Target Fields
    department: Optional[str] = None
    student_year: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None # JSON string
    preferred_companies: Optional[str] = None
    interest_areas: Optional[str] = None
    student_goal: Optional[str] = None
    placement_goal: Optional[str] = None
    career_goal: Optional[str] = None
    target_salary_goal: Optional[str] = None
    target_package: Optional[str] = None
    weak_areas: Optional[str] = None
    resume_status: Optional[str] = None
    existing_projects: Optional[str] = None
    
    # Availability
    learning_hours_per_day: Optional[int] = 2
    daily_available_hours: Optional[str] = None
    available_days: Optional[str] = None
    
    # Intelligence Engine State
    user_intelligence_profile: Optional[str] = "{}" # JSON
    last_intelligence_update: datetime = Field(default_factory=datetime.utcnow)
    behavioral_patterns: Optional[str] = "{}" # JSON
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="profile")"""

user_pattern = re.compile(r'class User\(SQLModel, table=True\):.*?career_intelligence_profile: Optional\["CareerIntelligenceProfile"\] = Relationship\(back_populates="user"\)', re.DOTALL)
profile_pattern = re.compile(r'class Profile\(SQLModel, table=True\):.*?ai_tools_known: Optional\[str\] = None', re.DOTALL)

content = user_pattern.sub(user_model_code, content)
content = profile_pattern.sub(profile_model_code, content)

with open('backend/app/models/models.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Models updated successfully.')
