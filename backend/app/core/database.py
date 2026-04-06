from sqlmodel import SQLModel, create_engine, Session, select
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
        ("last_intelligence_update", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
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
        ("last_seen", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"),
        ("is_private", "BOOLEAN DEFAULT FALSE"),
    ]
    
    try:
        with engine.begin() as conn:
            for col_name, col_def in new_columns:
                if col_name not in existing_columns:
                    print(f"  - Syncing User Schema: Adding column '{col_name}'...")
                    if "sqlite" in str(engine.url):
                        query = f'ALTER TABLE "user" ADD COLUMN {col_name} {col_def.replace("IF NOT EXISTS ", "")};'
                    else:
                        query = f'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS {col_name} {col_def};'
                    conn.execute(text(query))
            print("✅ User schema synchronized (Auto-Migration)")
    except Exception as e:
        print(f"⚠️  Manual schema sync failed: {e}")

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
