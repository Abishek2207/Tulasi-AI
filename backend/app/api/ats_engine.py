from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_session
from app.models.models import User, SavedResume, ATSReport, UsageLog
from app.api.deps import get_current_user, require_quota
from app.core.rate_limit import limiter

router = APIRouter()

class ResumeBuildRequest(BaseModel):
    contact_info: dict
    education: List[dict]
    experience: List[dict]
    skills: List[str]
    projects: List[dict]
    target_role: str

@router.post("/build")
@limiter.limit("5/minute")
def build_resume(request: Request, req: ResumeBuildRequest, current_user: User = Depends(require_quota("resume_build", limit=3)), db: Session = Depends(get_session)):
    # 1. Quota Check (Mock)
    usage = UsageLog(user_id=current_user.id, action_type="resume_build", details=f"Target: {req.target_role}")
    db.add(usage)
    
    # 2. Logic to build resume string (Placeholder)
    resume_content = f"Resume for {req.target_role} - Name: {req.contact_info.get('name')}"
    
    resume = SavedResume(
        user_id=current_user.id,
        original_resume=resume_content,
        job_description=req.target_role,
        improved_resume=resume_content,
        ats_score=85, # placeholder AI score
        readability_score=90
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    return {"message": "Resume built successfully", "resume_id": resume.id, "ats_score": resume.ats_score}

class AnalyzeRequest(BaseModel):
    resume_id: int
    target_job_description: str

@router.post("/analyze")
@limiter.limit("10/minute")
def analyze_resume(request: Request, req: AnalyzeRequest, current_user: User = Depends(require_quota("ats_analyze", limit=5)), db: Session = Depends(get_session)):
    resume = db.exec(select(SavedResume).where(SavedResume.id == req.resume_id, SavedResume.user_id == current_user.id)).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    usage = UsageLog(user_id=current_user.id, action_type="ats_analyze")
    db.add(usage)
    
    # Mock AI Analysis
    report = ATSReport(
        user_id=current_user.id,
        resume_id=resume.id,
        overall_score=88,
        keyword_match_score=85,
        skills_score=90,
        experience_score=80,
        formatting_score=95,
        missing_keywords_json='["Docker", "Kubernetes"]',
        skill_gap_analysis="Needs more cloud experience",
        improvement_suggestions_json='["Quantify impact in project 1"]'
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return {"message": "Analysis complete", "report_id": report.id, "score": report.overall_score}
