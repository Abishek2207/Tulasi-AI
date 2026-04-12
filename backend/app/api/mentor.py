import logging
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime, timezone
import json

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, MentorInsight
from app.websockets.manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple mock for LangChain evaluation in background (instantaneous for UX)
async def generate_mentor_insight(user_id: int, context_type: str, action_desc: str) -> str:
    """Mock LLM insight generation."""
    # In a real setup, this triggers LangChain chain or Groq API.
    # To keep latency minimal, we might pre-compute or use simple rules for now.
    import asyncio
    await asyncio.sleep(0.5) # simulate minor latency
    
    if context_type == "idea":
        return f"Great idea! The AI market is growing. Have you considered adding a monetization plan?"
    elif context_type == "follow":
        return f"Networking is key. Remember to send a quick introductory message to establish rapport."
    elif context_type == "chat":
        return f"Your communication is clear. Don't forget to ask open-ended questions."
    
    return "Keep up the great work! Your activity is helping your career profile grow."


async def trigger_mentor_insight(user_id: int, context_type: str, action_desc: str):
    """Triggered asynchronously when a user performs a key action."""
    try:
        insight_text = await generate_mentor_insight(user_id, context_type, action_desc)
        
        # Save to DB
        from app.core.database import engine
        from sqlmodel import Session
        with Session(engine) as db:
            insight = MentorInsight(
                user_id=user_id,
                context_type=context_type,
                insight_text=insight_text,
                created_at=datetime.now(timezone.utc)
            )
            db.add(insight)
            db.commit()
            db.refresh(insight)
            
            # Fire to frontend instantly via modern Socket.io
            from app.core.socket_server import sio, user_to_sid
            sid = user_to_sid.get(user_id)
            if sid:
                import asyncio
                asyncio.create_task(sio.emit('mentor_insight', {
                    "id": insight.id,
                    "context_type": insight.context_type,
                    "insight_text": insight.insight_text,
                    "created_at": insight.created_at.isoformat()
                }, to=sid))
    except Exception as e:
        logger.error(f"Error generating mentor insight: {e}")

@router.get("/insights")
async def get_insights(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(MentorInsight).where(MentorInsight.user_id == current_user.id).order_by(MentorInsight.created_at.desc()).limit(10)
    return db.exec(statement).all()

"""
Note: In app.main, remember to mount this router.
"""
