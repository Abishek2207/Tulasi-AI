import logging
import asyncio
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, MentorInsight
from app.core.ai_router import get_ai_response

logger = logging.getLogger(__name__)

router = APIRouter()

async def generate_mentor_insight(user_id: int, context_type: str, action_desc: str) -> str:
    """Real LLM insight generation (runs sync AI call in thread pool)."""
    try:
        prompt = (
            f"User performed action: {action_desc} (Context: {context_type}). "
            "Generate a short, motivating 1-sentence career tip (max 120 chars)."
        )
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, get_ai_response, prompt)
        return response.strip()
    except Exception as e:
        logger.error(f"AI Provider failed for mentor insight: {e}")
        return ""


async def trigger_mentor_insight(user_id: int, context_type: str, action_desc: str):
    """Triggered asynchronously when a user performs a key action."""
    try:
        insight_text = await generate_mentor_insight(user_id, context_type, action_desc)
        if not insight_text:
            return

        from app.core.database import engine
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

            from app.core.socket_server import sio, user_to_sid
            sid = user_to_sid.get(user_id)
            if sid:
                asyncio.create_task(sio.emit("mentor_insight", {
                    "id": insight.id,
                    "context_type": insight.context_type,
                    "insight_text": insight.insight_text,
                    "created_at": insight.created_at.isoformat()
                }, to=sid))
    except Exception as e:
        logger.error(f"Error generating mentor insight: {e}")


@router.get("/insights")
async def get_insights(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = (
        select(MentorInsight)
        .where(MentorInsight.user_id == current_user.id)
        .order_by(MentorInsight.created_at.desc())
        .limit(10)
    )
    return db.exec(statement).all()
