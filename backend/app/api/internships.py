from fastapi import APIRouter, Depends, Query, BackgroundTasks
from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.api.deps import get_current_user
from app.models.models import User, Job, UserJobMatch
from app.core.database import get_session
from app.services.matching_service import MatchingService

router = APIRouter()

@router.get("")
def list_internships(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    type: Optional[str] = Query(None, description="Paid | Unpaid | Free"),
    mode: Optional[str] = Query(None, description="Online | Offline | Hybrid"),
    state: Optional[str] = Query(None, description="India state filter"),
    location: Optional[str] = Query(None, description="City/District filter"),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Retrieve jobs from DB that match the internship criteria or just rely on UserJobMatch
    statement = select(UserJobMatch).where(UserJobMatch.user_id == current_user.id).order_by(UserJobMatch.total_match_score.desc())
    matches = db.exec(statement).all()
    
    results = []
    for m in matches:
        job = db.get(Job, m.job_id)
        if not job: continue
        
        # Only interns
        if "intern" not in job.title.lower() and "intern" not in (job.employment_type or "").lower():
            continue
            
        results.append({
            "title": job.title,
            "company": job.company,
            "domain": job.source,
            "type": "Paid" if job.salary_min else "Unknown",
            "mode": job.remote_type or "Unknown",
            "state": "Unknown",
            "location": job.location or "Remote",
            "stipend": f"{job.salary_min}-{job.salary_max} {job.salary_currency}" if job.salary_min else "Unknown",
            "duration": "Flexible",
            "description": job.description[:200] if job.description else "",
            "apply_link": job.application_url or job.source_url or "",
            "deadline": job.posted_at
        })
        
    return {"internships": results, "total": len(results)}

@router.get("/domains")
def get_domains():
    return {"domains": ["Software/Tech", "Data", "AI", "Design"]}

@router.get("/states")
def get_states():
    return {"states": [], "districts": []}

@router.get("/matches")
def get_matched_internships(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return list_internships(db=db, current_user=current_user)
