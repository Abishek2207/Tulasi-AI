from sqlmodel import SQLModel, create_engine, Session, select
Base = SQLModel
from sqlalchemy.pool import QueuePool
from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(
        settings.normalized_database_url, 
        connect_args=connect_args,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30
    )
except Exception as e:
    print(f"⚠️  WARNING: Database engine creation failed: {e}")
    engine = None


def sync_user_schema(engine):
    """Safely adds missing columns to the 'user' table on startup."""
    if engine is None:
        return
        
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    existing_columns = [c['name'] for c in inspector.get_columns("user")]
    
    # New columns added in Super Intelligence / Professional upgrades
    new_columns = [
        ("user_type", "VARCHAR DEFAULT 'student'"),
        ("abuse_count", "INTEGER DEFAULT 0"),
        ("is_onboarded", "BOOLEAN DEFAULT FALSE"),
        ("department", "VARCHAR"),
        ("target_role", "VARCHAR"),
        ("target_companies", "VARCHAR"),
        ("interest_areas", "VARCHAR"),
        ("onboarding_step", "INTEGER DEFAULT 0"),
        ("user_intelligence_profile", "TEXT DEFAULT '{}'"),
        ("last_intelligence_update", "TIMESTAMP DEFAULT '2024-01-01 00:00:00'"),
        ("behavioral_patterns", "TEXT DEFAULT '{}'"),
        ("is_pro", "BOOLEAN DEFAULT TRUE"),
        ("stripe_customer_id", "VARCHAR"),
        ("stripe_subscription_id", "VARCHAR"),
        ("chats_today", "INTEGER DEFAULT 0"),
        ("last_reset_date", "VARCHAR"),
        ("pro_expiry_date", "VARCHAR"),
        ("username", "VARCHAR UNIQUE"), 
        ("invite_code", "VARCHAR"),
        ("provider", "VARCHAR DEFAULT 'email'"),
        ("referred_by", "VARCHAR"),
        ("streak", "INTEGER DEFAULT 0"),
        ("longest_streak", "INTEGER DEFAULT 0"),
        ("xp", "INTEGER DEFAULT 0"),
        ("level", "INTEGER DEFAULT 1"),
        ("last_activity_date", "VARCHAR"),
        ("last_seen", "TIMESTAMP DEFAULT '2024-01-01 00:00:00'"),
        ("is_private", "BOOLEAN DEFAULT FALSE"),
    ]
    
    try:
        with engine.begin() as conn:
            for col_name, col_def in new_columns:
                if col_name not in existing_columns:
                    print(f"  - Syncing User Schema: Adding column '{col_name}'...")
                    if "sqlite" in str(engine.url):
                        base_def = col_def.split(" DEFAULT ")[0] if " DEFAULT " in col_def else col_def
                        safe_def = base_def.replace("IF NOT EXISTS ", "").replace(" UNIQUE", "")
                        query = f'ALTER TABLE "user" ADD COLUMN {col_name} {safe_def};'
                    else:
                        query = f'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS {col_name} {col_def};'
                    conn.execute(text(query))
            print("✅ User schema synchronized (Auto-Migration)")
    except Exception as e:
        print(f"⚠️  Manual schema sync failed: {e}")

def sync_profile_schema(engine):
    """Safely adds missing columns to the 'profile' table on startup."""
    if engine is None:
        return
        
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    if not inspector.has_table("profile"):
        return
        
    existing_columns = [c['name'] for c in inspector.get_columns("profile")]
    
    new_columns = [
        ("student_year", "VARCHAR"),
        ("student_goal", "VARCHAR"),
        ("current_salary_range", "VARCHAR"),
        ("target_salary_goal", "VARCHAR")
    ]
    
    try:
        with engine.begin() as conn:
            for col_name, col_def in new_columns:
                if col_name not in existing_columns:
                    print(f"  - Syncing Profile Schema: Adding column '{col_name}'...")
                    if "sqlite" in str(engine.url):
                        query = f'ALTER TABLE profile ADD COLUMN {col_name} {col_def};'
                    else:
                        query = f'ALTER TABLE profile ADD COLUMN IF NOT EXISTS {col_name} {col_def};'
                    conn.execute(text(query))
            print("✅ Profile schema synchronized (Auto-Migration)")
    except Exception as e:
        print(f"⚠️  Manual profile schema sync failed: {e}")

def init_db():
    if engine is None:
        print("⚠️  Skipping DB init: No engine available.")
        return

    import time
    from sqlalchemy import text
    from sqlalchemy.exc import OperationalError, SQLAlchemyError

    # IMPORT ALL MODELS here so metadata knows about them for create_all
    from app.models.models import (
        User, Hackathon, StudyRoom, Review, UserFeedback, UserMemoryChunk, 
        GroupMessage, SavedResume, HackathonBookmark, HackathonApplication,
        DirectMessage, ChatRequest, UserFollow, Idea, IdeaLike, IdeaComment,
        ActivityLog, UserProgress, SolvedProblem, Roadmap, RoadmapStep, 
        UserBadge, Reward, StudyRoomMessage, SavedStartupIdea, Group, GroupMember,
        ChatMessage, ChatSession, Certificate, PersistentInterviewSession,
        Internship, PrepPlan, Announcement, InviteCode, DailyChallenge,
        DailyChallengeSubmission, MentorInsight
    )
    
    max_retries = 3
    retry_delay = 15

    for attempt in range(1, max_retries + 1):
        try:
            print(f"🔄 Database Init: Attempt {attempt}/{max_retries}...")
            
            # 1. Confirm connectivity
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database connection established.")

            # 2. Create tables if they don't exist (Validates users, sessions, etc.)
            SQLModel.metadata.create_all(engine)
            print("✅ Required tables validated/created.")
            
            # 3. Sync existing tables with new columns (Safe Migration Layer)
            sync_user_schema(engine)
            sync_profile_schema(engine)
            
            # Simple column migrations for other tables
            migration_queries = [
                'ALTER TABLE review ADD COLUMN email VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN event_mode VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN difficulty VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN team_size VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN start_date VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN end_date VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN registration_deadline VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN domains VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN currency VARCHAR;',
                'ALTER TABLE hackathon ADD COLUMN location VARCHAR;'
            ]
            for query in migration_queries:
                try:
                    with engine.begin() as conn:
                        conn.execute(text(query))
                except Exception:
                    pass
            
            # 4. Seed essential data (Groups, Hackathons, Reviews)
            seed_essential_data(engine)
            
            # Success, exit the retry loop
            print("🚀 Database is fully ready for incoming requests.")
            break
            
        except (OperationalError, SQLAlchemyError) as e:
            print(f"⚠️  Database connection/creation failed: {e}")
            if attempt < max_retries:
                print(f"⏳ Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print("❌ Final Database Init Failure - Backend may reject logins.")
                return
        except Exception as e:
            print(f"⚠️  Unexpected Database Init Warning: {e}")
            break

def seed_essential_data(engine):
    """Ensures the platform has a baseline of data on startup."""
    from sqlmodel import Session, select
    from app.models.models import Group, GroupMember, Hackathon, Review, User
    from datetime import datetime

    with Session(engine) as db:
        # 1. Promote default admins (Safe sync)
        admin_emails = ["abishekramamoorthy22@gmail.com", "abishek.ramamoorthy.dev@gmail.com"]
        for email in admin_emails:
            u = db.exec(select(User).where(User.email == email)).first()
            if u and u.role != "admin":
                u.role = "admin"
                db.add(u)
                print(f"✅ Promoted {email} to admin.")

        # 2. Global Community Group
        existing_group = db.exec(select(Group).where(Group.name == "Global Community")).first()
        if not existing_group:
            print("🌱 Seeding: Global Community Group...")
            new_group = Group(
                name="Global Community",
                description="The official Tulasi AI global headquarters. Network, collaborate, and build the future of AGI together.",
                join_code="TULASI100",
                created_by=1 # System/Placeholder
            )
            db.add(new_group)
            db.commit()
            db.refresh(new_group)
        else:
            new_group = existing_group

        # 3. Baseline Hackathons (if empty)
        if not db.exec(select(Hackathon)).first():
            from app.core.constants import REAL_HACKATHONS
            print(f"🌱 Seeding: {len(REAL_HACKATHONS)} Global Hackathons...")
            for h_data in REAL_HACKATHONS:
                h = Hackathon(
                    name=h_data["name"],
                    organizer=h_data["organizer"],
                    description=h_data["description"],
                    prize=h_data["prize"],
                    prize_pool=h_data["prize"],
                    deadline=h_data["deadline"],
                    link=h_data["link"],
                    registration_link=h_data["link"],
                    tags=h_data["tags"],
                    status=h_data["status"],
                    is_active=True,
                    mode="Online",
                    difficulty="Beginner",
                    image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=60",
                    participants_count=0
                )
                db.add(h)
            db.commit()

        # 4. Professional Reviews (if empty)
        if not db.exec(select(Review)).first():
            from app.core.constants import REAL_REVIEWS
            print(f"🌱 Seeding: {len(REAL_REVIEWS)} Professional Reviews...")
            for r in REAL_REVIEWS:
                new_review = Review(
                    name=r["name"],
                    role=r["role"],
                    review=r["review"],
                    rating=r["rating"],
                    created_at=datetime.utcnow(),
                    is_approved=True,
                    is_featured=True
                )
                db.add(new_review)
            db.commit()

        # 5. Baseline Idea Feed (if empty)
        from app.models.models import Idea
        if not db.exec(select(Idea)).first():
            system_user = db.exec(select(User).order_by(User.id.asc())).first()
            if system_user:
                print("🌱 Seeding: Baseline Idea Feed...")
                welcome_ideas = [
                    "Welcome to Tulasi AI! The mission is to build a decentralized AGI social layer. Join the Global Community to get started. 🚀",
                    "Tulasi AI is now live on tulasiai.in! Build, Collaborate, and Conquer. #TulasiAI #AGI",
                    "New to the platform? Check out the Careers tab to find your dream internship or the Hackathons tab to build something new! 💻",
                ]
                for content in welcome_ideas:
                    idea = Idea(
                        user_id=system_user.id,
                        content=content,
                        tags="welcome,tulasi,agi",
                    )
                    db.add(idea)
                db.commit()

        print("✅ Essential data seeded.")

def get_session():
    if engine is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database engine initialization failed. Check connection.")
    try:
        with Session(engine) as session:
            yield session
    except Exception as e:
        # If it's already an HTTPException (like a 401 or 400 from downstream), let it propagate.
        # This prevents masking 401 Unauthorized with a 503 Backend Error.
        from fastapi import HTTPException
        from sqlalchemy.exc import SQLAlchemyError
        
        if isinstance(e, HTTPException):
            raise e
            
        # Log the real error for internal visibility
        print(f"📡 Backend Error Context: {type(e).__name__} - {e}")
        
        # If it's a known DB error, return 503
        if isinstance(e, SQLAlchemyError):
            raise HTTPException(status_code=503, detail="Database connection error.")
            
        # Otherwise, let it propagate so our global handlers in main.py can deal with it properly (e.g. 400 for validation)
        raise e
get_db = get_session
