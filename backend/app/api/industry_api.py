from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from pydantic import BaseModel
import datetime

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, IndustryUpdate, Notification

router = APIRouter()

@router.get("/feed")
async def get_industry_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Returns AI-generated industry intelligence tailored to the user's career.
    In a full production scenario, this triggers a background Celery task to scrape the web.
    For this prototype, it dynamically provisions realistic updates if none exist.
    """
    role = "AI Engineer" if current_user.user_type == "professional" else "Software Engineering Student"
    
    # Check if we have recent updates
    updates = db.exec(
        select(IndustryUpdate)
        .where(IndustryUpdate.user_id == current_user.id)
        .order_by(IndustryUpdate.created_at.desc())
        .limit(10)
    ).all()
    
    if not updates:
        # Generate dynamic prototype updates
        new_updates = [
            IndustryUpdate(
                user_id=current_user.id,
                role_context=role,
                title="React Compiler finalized in 19.0",
                summary="React 19 introduces an optimizing compiler, eliminating the need for useMemo and useCallback. This is a massive shift for frontend developers.",
                impact_level="High",
                source_tech="React / Web"
            ),
            IndustryUpdate(
                user_id=current_user.id,
                role_context=role,
                title="LLM API Costs drop by 40%",
                summary="Leading providers have reduced token costs, making agentic architectures more viable for production startups.",
                impact_level="Medium",
                source_tech="AI / LLM"
            ),
            IndustryUpdate(
                user_id=current_user.id,
                role_context=role,
                title="System Design interviews heavily focusing on event-driven architectures",
                summary="FAANG companies are prioritizing Kafka, RabbitMQ, and distributed tracing in senior interviews this quarter.",
                impact_level="High",
                source_tech="Backend / System Design"
            )
        ]
        
        for u in new_updates:
            db.add(u)
            
        # Also generate a critical notification for the user
        critical_notif = Notification(
            user_id=current_user.id,
            title="Critical Tech Update: React 19",
            message="React 19 compiler is out. We've added a new module to your roadmap to help you transition away from manual memoization.",
            category="New technology update",
            is_read=False
        )
        db.add(critical_notif)
        
        db.commit()
        
        updates = new_updates

    return {"industry_feed": updates}
