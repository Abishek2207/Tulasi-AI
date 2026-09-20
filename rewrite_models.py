import re

with open('backend/app/models/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

user_pattern = re.compile(r'class User\(SQLModel, table=True\):.*?stripe_customer_id: Optional\[str\] = None', re.DOTALL)
new_user = """class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: Optional[str] = Field(default=None, unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: Optional[str] = None
    name: str = ""
    avatar: Optional[str] = None
    user_type: str = "student"
    provider: str = "email"
    preferred_model: str = "gemini"
    invite_code: Optional[str] = None
    referred_by: Optional[str] = None
    
    # Progress/Account metadata
    streak: int = 0
    longest_streak: int = 0
    xp: int = 0
    level: int = 1
    last_activity_date: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    freeze_used_at: Optional[datetime] = None
    is_active: bool = True
    is_pro: bool = True
    is_private: bool = False
    stripe_customer_id: Optional[str] = None"""

content = user_pattern.sub(new_user, content)

profile_pattern = re.compile(r'class Profile\(SQLModel, table=True\):.*?placement_goal: Optional\[str\] = None', re.DOTALL)
new_profile = """class Profile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    user_id: int = Field(foreign_key="user.id", unique=True, nullable=False)
    
    bio: Optional[str] = None
    current_role: Optional[str] = None
    company: Optional[str] = None
    department: Optional[str] = None
    experience_years: int = 0
    skills: Optional[str] = None # JSON string of skills
    skill_level: Optional[str] = None
    
    # Intelligence Engine fields
    student_year: Optional[str] = None
    placement_goal: Optional[str] = None
    target_role: Optional[str] = None
    target_salary_goal: Optional[str] = None
    target_companies: Optional[str] = None # JSON string
    preferred_locations: Optional[str] = None # JSON string
    
    learning_hours_per_day: int = 2
    available_days: Optional[str] = None
    ai_mentor_name: Optional[str] = None
    
    updated_at: datetime = Field(default_factory=datetime.utcnow)"""

content = profile_pattern.sub(new_profile, content)

with open('backend/app/models/models.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('Consolidated User and Profile models')
