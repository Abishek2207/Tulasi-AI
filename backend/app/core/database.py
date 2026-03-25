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


def init_db():
    if engine is None:
        print("⚠️  Skipping DB init: No engine available.")
        return

    from app.models.models import Hackathon, StudyRoom, Review  # Local import to avoid circular dependencies
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"⚠️  Failed to create metadata: {e}")
        return
        
    # Seed Hackathons
    # Seed Hackathons
    try:
        with Session(engine) as session:
            if not session.exec(select(Hackathon)).first():
                print("🌱 Seeding hackathons...")
                # Simpler mock seeding to restore file integrity without massive list
                h1 = Hackathon(name="Google Summer of Code 2026", organizer="Google", description="Global open-source program.", prize="$3300", prize_pool="$3300", deadline="March 20", link="https://summerofcode.withgoogle.com", registration_link="https://summerofcode.withgoogle.com", tags="open-source", status="Open", image_url="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&auto=format&fit=crop&q=60", participants_count=18000)
                session.add(h1)
                session.commit()
                print("✅ Seeded hackathons!")
    except Exception as e:
        print(f"⚠️  Skipping Hackathon seeding due to DB error: {e}")

    # Seed Study Rooms
    try:
        with Session(engine) as session:
            if not session.exec(select(StudyRoom)).first():
                # Need a system user ID — use 1 as placeholder (admin)
                from app.models.models import StudyRoom as SR
                default_rooms = [
                    SR(name="DSA & LeetCode Prep", description="Daily coding challenges and algorithm discussions.", tag="Interview", color="#FF6B6B", created_by=1),
                    SR(name="Web3 Builders", description="Smart contracts, DeFi, and Web3 project discussions.", tag="Blockchain", color="#4ECDC4", created_by=1),
                    SR(name="AI/ML Researchers", description="Deep learning, model training, and research papers.", tag="Machine Learning", color="#6C63FF", created_by=1),
                    SR(name="Indie Hackers", description="Startup ideas, side projects, and growth hacking.", tag="Startups", color="#FFD93D", created_by=1),
                ]
                for r in default_rooms:
                    try:
                        session.add(r)
                        session.commit()
                    except Exception:
                        session.rollback()  # Skip if user 1 doesn't exist yet
                print("✅ Study rooms seeded!")
    except Exception as e:
        print(f"⚠️  Skipping Study Room seeding due to DB error: {e}")

def get_session():
    if engine is None:
        yield None
        return
    try:
        with Session(engine) as session:
            yield session
    except Exception as e:
        print(f"DB session error: {e}")
        raise
