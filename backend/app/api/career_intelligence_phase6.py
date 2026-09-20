from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User
from app.services.intelligence_service import intelligence_service
from app.services.smart_job_match_service import smart_job_match_service
from app.services.placement_service import placement_readiness_service, next_best_action_service

router = APIRouter()

@router.get("/skill-gap")
async def api_skill_gap(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    target_role = (current_user.profile.target_role if getattr(current_user, "profile", None) else "") or "Software Engineer"
    return intelligence_service.get_user_skill_gap(db, current_user.id, target_role)

@router.get("/job-matches")
async def api_job_matches(location: str = "India", db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    target_role = (current_user.profile.target_role if getattr(current_user, "profile", None) else "") or "Software Engineer"
    return smart_job_match_service.get_matched_jobs(db, current_user.id, target_role)

@router.get("/placement-readiness")
async def api_placement_readiness(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await placement_readiness_service.calculate_readiness(db, current_user)

@router.get("/next-best-action")
async def api_next_best_action(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return await next_best_action_service.get_next_action(db, current_user)
