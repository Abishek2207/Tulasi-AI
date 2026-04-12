from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime
import enum

class RoleEnum(enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class AuthProviderEnum(enum.Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"
    GITHUB = "GITHUB"

class UserTypeEnum(enum.Enum):
    STUDENT = "STUDENT"
    PROFESSIONAL = "PROFESSIONAL"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=True) # Null if OAuth
    role = Column(Enum(RoleEnum), default=RoleEnum.USER)
    auth_provider = Column(Enum(AuthProviderEnum), default=AuthProviderEnum.LOCAL)
    user_type = Column(Enum(UserTypeEnum), nullable=True) # Student or Professional
    streak_count = Column(Integer, default=0)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    chats = relationship("Chat", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    roadmaps = relationship("Roadmap", back_populates="user")
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
