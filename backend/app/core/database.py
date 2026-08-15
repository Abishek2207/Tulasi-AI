from sqlmodel import SQLModel, create_engine, Session, select
from app.core.logger import logger
Base = SQLModel
from sqlalchemy.pool import QueuePool
from app.core.config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

try:
    engine_kwargs = {
        "connect_args": connect_args
    }
    if not is_sqlite:
        engine_kwargs.update({
            "poolclass": QueuePool,
            "pool_size": 10,
            "max_overflow": 20,
            "pool_timeout": 30
        })

    engine = create_engine(
        settings.normalized_database_url, 
        **engine_kwargs
    )
except Exception as e:
    logger.critical(f"Database engine creation failed: {e}")
    raise RuntimeError(f"Database engine creation failed: {e}")


# Alembic now handles migrations.


def init_db():
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
        DailyChallengeSubmission, MentorInsight,
        SubscriptionPlan, UserSubscription, Payment, Coupon, CouponRedemption,
        ATSReport, UsageLog, AdminLog
    )
    
    max_retries = 3
    retry_delay = 15

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Database Init: Attempt {attempt}/{max_retries}...")
            
            # 1. Confirm connectivity
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established.")

            # 2. Create tables if they don't exist (Validates users, sessions, etc.)
            SQLModel.metadata.create_all(engine)
            logger.info("Required tables validated/created.")
            
            # Alembic is now handling schema sync and migrations.
            # 3. Seed essential data (Groups, Hackathons, Reviews)
            seed_essential_data(engine)
            
            # Success, exit the retry loop
            logger.info("Database is fully ready for incoming requests.")
            break
            
        except (OperationalError, SQLAlchemyError) as e:
            logger.error(f"Database connection/creation failed: {e}")
            if attempt < max_retries:
                logger.warning(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                logger.critical("Final Database Init Failure - Backend may reject logins.")
                return
        except Exception as e:
            logger.error(f"Unexpected Database Init Warning: {e}")
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
                logger.info("Seeding: Baseline Idea Feed...")
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

        logger.info("Essential data seeded.")

def get_session():
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
        logger.error(f"Backend Error Context: {type(e).__name__} - {e}", exc_info=True)
        
        # If it's a known DB error, return 503
        if isinstance(e, SQLAlchemyError):
            raise HTTPException(status_code=503, detail="Database connection error.")
            
        # Otherwise, let it propagate so our global handlers in main.py can deal with it properly (e.g. 400 for validation)
        raise e
get_db = get_session
