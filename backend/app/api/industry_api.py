from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, IndustryUpdate

router = APIRouter()

@router.get("/feed")
async def get_industry_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Returns the most recent industry intelligence updates from the database.
    Updates are ingested by background tasks (Celery/SerpApi) and stored in the
    IndustryUpdate table. Returns an empty list when no data has been ingested yet.
    This is a global feed shared across all users.
    """
    updates = db.exec(
        select(IndustryUpdate)
        .order_by(IndustryUpdate.created_at.desc())
        .limit(20)
    ).all()

    return {"industry_feed": updates}
