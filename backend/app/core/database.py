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

    from app.models.models import Hackathon, StudyRoom, Review, UserFeedback, UserMemoryChunk, GroupMessage, SavedResume, HackathonBookmark, HackathonApplication
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print(f"⚠️  Failed to create metadata: {e}")
        return

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
