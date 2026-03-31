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

    from app.models.models import Hackathon, StudyRoom, Review, UserFeedback, UserMemoryChunk, GroupMessage, SavedResume, HackathonBookmark
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"⚠️  Failed to create metadata: {e}")
        return

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
