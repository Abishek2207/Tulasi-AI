from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    current_role = Column(String, nullable=True)
    company = Column(String, nullable=True)
    experience_years = Column(Integer, nullable=True, default=0)
    skill_level = Column(String, nullable=True)

    # New: AI Mentor personalization
    ai_mentor_name = Column(String, nullable=True, default=None)

    # New: Skill tracking — stored as JSON string: [{"name":"DSA","progress":40,"category":"placement"}]
    skills = Column(Text, nullable=True, default=None)

    # New: Daily learning time preference (hours)
    learning_hours_per_day = Column(Integer, nullable=True, default=2)

    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="profile")
