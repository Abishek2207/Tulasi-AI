import os
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from typing import Optional, List
from datetime import datetime, timezone
import requests

from app.api.deps import get_current_user
from app.models.models import User, Job, UserJobMatch
from app.core.database import get_session
from app.services.matching_service import MatchingService
from app.services.job_ingestion_service import JobIngestionService
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

router = APIRouter()

def background_ingest_and_match(user_id: int):
    from app.core.database import engine
    with Session(engine) as db:
        raw_jobs = []
        try:
            resp = requests.get("https://remotive.com/api/remote-jobs?limit=30", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("jobs", []):
                    raw_jobs.append({
                        "title": item.get("title", ""),
                        "company": item.get("company_name", "Unknown"),
                        "location": item.get("candidate_required_location", "Remote"),
                        "source": "Remotive",
                        "application_url": item.get("url", ""),
                        "description": item.get("description", "")[:5000] # truncate
                    })
        except Exception:
            pass
            
        if raw_jobs:
            JobIngestionService.process_jobs(db, raw_jobs)
        
        MatchingService.calculate_matches_for_user(db, user_id)

@router.get("/jobs")
def get_jobs(
    skills: Optional[str] = None, 
    location: Optional[str] = None, 
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    if background_tasks:
        background_tasks.add_task(background_ingest_and_match, current_user.id)
        
    matches_exist = db.exec(select(UserJobMatch).where(UserJobMatch.user_id == current_user.id).limit(1)).first()
    if not matches_exist:
        MatchingService.calculate_matches_for_user(db, current_user.id)
        
    statement = select(UserJobMatch).where(UserJobMatch.user_id == current_user.id).order_by(UserJobMatch.total_match_score.desc()).limit(20)
    matches = db.exec(statement).all()
    
    results = []
    for m in matches:
        job = db.get(Job, m.job_id)
        if not job: continue
        
        if skills and skills.lower() not in job.title.lower() and skills.lower() not in (job.description or "").lower():
            continue
        if location and location.lower() not in (job.location or "").lower():
            continue
            
        results.append({
            "id": str(job.id),
            "title": job.title,
            "company": job.company,
            "location": job.location or "Remote",
            "source": job.source,
            "source_name": job.source,
            "apply_link": job.application_url or job.source_url or "",
            "posted_date": job.posted_at or job.fetched_at.isoformat(),
            "fetched_at": job.fetched_at.isoformat(),
            "verified_status": True,
            "match_score": round(m.total_match_score * 100, 1),
            "semantic_score": round(m.semantic_score * 100, 1),
            "skill_gap_score": round(m.skill_gap_score * 100, 1)
        })
        
    if not results:
        return {"success": True, "data": []}

    return {"success": True, "data": results}


@router.get("/hackathons")
def get_hackathons(db: Session = Depends(get_session)):
    hackathons = []
    
    from app.models.models import Hackathon
    from sqlmodel import select
    db_hackathons = db.exec(select(Hackathon).where(Hackathon.is_active == True)).all()
    
    for h in db_hackathons:
        hackathons.append({
            "id": str(h.id),
            "title": h.name,
            "organizer": h.organizer,
            "mode": h.event_mode or "Online",
            "source": "TulasiAI Partners",
            "source_name": h.organizer,
            "source_url": h.link,
            "registration_url": h.link,
            "prize": h.prize,
            "deadline": h.deadline,
            "description": h.description,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "verified_status": True
        })
        
    try:
        resp = requests.get("https://hackathons.hackclub.com/api/events/all", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            for item in data[:15]:
                hackathons.append({
                    "id": str(item.get("id", item.get("name"))),
                    "title": item.get("name", "Hackathon"),
                    "organizer": "HackClub Network",
                    "mode": item.get("mode", "In-Person"),
                    "location": f"{item.get('city', '')}, {item.get('state', '')}".strip(", "),
                    "source_name": "HackClub",
                    "source_url": item.get("website", ""),
                    "registration_url": item.get("website", ""),
                    "deadline": item.get("end", ""),
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                    "verified_status": True
                })
    except Exception as e:
        print(f"HackClub API fetch failed: {e}")
        
    return {"success": True, "data": hackathons}
