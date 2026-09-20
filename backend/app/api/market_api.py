from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User
from app.services.serpapi_service import serpapi_service
import json

router = APIRouter()

@router.get("/intelligence")
async def get_market_intelligence(
    role: str = None, 
    location: str = "India",
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Returns live market intelligence, adhering to strict LIVE/STALE/UNAVAILABLE status."""
    
    # Use canonical profile data if no explicit role provided
    target_role = role
    if not target_role:
        if current_user.profile and current_user.profile.target_role:
            target_role = current_user.profile.target_role
        else:
            target_role = getattr(current_user, "target_role", None) or "Software Engineer"
            
    snapshot = await serpapi_service.generate_market_snapshot(db, target_role, location)
    
    return {
        "status": snapshot.demand_signals, # LIVE | STALE | UNAVAILABLE
        "role": snapshot.role,
        "jobs_analyzed": snapshot.jobs_analyzed,
        "top_skills": json.loads(snapshot.top_skills),
        "companies": json.loads(snapshot.companies),
        "salary_signals": json.loads(snapshot.salary_signals),
        "metadata": snapshot.source_metadata
    }
