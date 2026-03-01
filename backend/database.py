import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Database Switcher: Local SQLite vs Production Supabase (Postgres)
# To use Supabase, set DATABASE_URL=postgresql://user:password@host:port/db
# Otherwise, it defaults to a local SQLite file (fully free)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tulasi_local.db")

# SQLAlchemy setup differences between SQLite and Postgres
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Fix for newer SQLAlchemy postgres dialect strings
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Core Schema Definitions ---

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True) # Matches Firebase/Supabase Auth ID
    email = Column(String, unique=True, index=True)
    name = Column(String)
    streak = Column(Integer, default=0)
    points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    message = Column(String)
    role = Column(String) # 'user' or 'ai'
    timestamp = Column(DateTime, default=datetime.utcnow)

# Ensure tables are created
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Utility Functions (Refactored from Supabase-only to SQLAlchemy) ---

def create_user(db_session, email: str, user_id: str, name: str):
    try:
        if not db_session.query(User).filter(User.id == user_id).first():
            new_user = User(id=user_id, email=email, name=name, streak=0)
            db_session.add(new_user)
            db_session.commit()
            db_session.refresh(new_user)
            return new_user
    except Exception as e:
        print(f"Error creating user: {e}")
        db_session.rollback()
    return None

def save_chat_history(db_session, user_id: str, message: str, role: str):
    try:
        chat = ChatHistory(user_id=user_id, message=message, role=role)
        db_session.add(chat)
        db_session.commit()
    except Exception as e:
        print(f"Error saving chat: {e}")
        db_session.rollback()
