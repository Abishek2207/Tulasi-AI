import json
import re
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, UserCertification, CareerIntelligenceProfile
from app.core.ai_router import get_ai_response, resilient_ai_response
from app.api.activity import log_activity_internal

router = APIRouter()

class CertificationStartRequest(BaseModel):
    title: str
    provider: str
    difficulty: str = "Beginner"
    external_url: str = ""

@router.get("/")
def get_active_certifications(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all active/completed certifications for the user."""
    certs = db.exec(
        select(UserCertification).where(UserCertification.user_id == current_user.id)
    ).all()
    return certs

@router.get("/recommend")
def recommend_certifications(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Uses AI to recommend 3-5 real-world certifications based on user's target role and skills."""
    profile = db.exec(
        select(CareerIntelligenceProfile).where(CareerIntelligenceProfile.user_id == current_user.id)
    ).first()
    
    target_role = profile.target_role if profile else "Software Engineer"
    skills = profile.skills_json if profile else "[]"
    
    prompt = f"""You are a senior tech career coach.
The user is aiming for the role of '{target_role}'.
Their current skills: {skills}.

Recommend 3-5 REAL-WORLD, official certifications that would greatly improve their chances.
Do NOT invent certifications. Use real ones like 'AWS Certified Solutions Architect', 'Google Cloud Professional Data Engineer', 'CKA', etc.

Return ONLY a strict JSON array of objects with these keys:
- title: (str) Name of the certification
- provider: (str) e.g., 'AWS', 'Google', 'Microsoft', 'Linux Foundation'
- skill_category: (str) e.g., 'Cloud Computing', 'AI/ML'
- difficulty: (str) 'Beginner', 'Intermediate', 'Advanced'
- estimated_time: (str) e.g., '4 weeks', '2 months'
- external_url: (str) The official URL (or a highly likely official url structure)
- reason: (str) 1-sentence reason why this is good for '{target_role}'.

Example output format:
[
  {{
    "title": "AWS Certified Solutions Architect - Associate",
    "provider": "AWS",
    "skill_category": "Cloud Architecture",
    "difficulty": "Intermediate",
    "estimated_time": "6 weeks",
    "external_url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    "reason": "Essential for designing distributed systems on AWS."
  }}
]
"""
    fallback_certs = [
        {
            "title": "AWS Certified Cloud Practitioner",
            "provider": "AWS",
            "skill_category": "Cloud Computing",
            "difficulty": "Beginner",
            "estimated_time": "3 weeks",
            "external_url": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
            "reason": "Great starting point for cloud fundamentals."
        },
        {
            "title": "Microsoft Certified: Azure Fundamentals",
            "provider": "Microsoft",
            "skill_category": "Cloud Computing",
            "difficulty": "Beginner",
            "estimated_time": "2 weeks",
            "external_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
            "reason": "Covers core cloud concepts on the Azure platform."
        }
    ]
    
    return resilient_ai_response(prompt, fallback=fallback_certs, is_json=True)

@router.post("/start")
def start_certification(
    req: CertificationStartRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Commits to a certification and generates a study path."""
    
    prompt = f"""You are a master technical instructor.
The user wants to study for this real-world certification:
Title: {req.title}
Provider: {req.provider}

Generate a week-by-week study plan to pass this certification.
Return ONLY strict JSON with this exact structure:
{{
  "weeks": [
    {{
      "week": 1,
      "focus": "Core concepts...",
      "tasks": [
        "Study concept X",
        "Do hands-on lab Y"
      ]
    }}
  ],
  "tips": ["Tip 1", "Tip 2"]
}}
"""
    fallback_study = {
        "weeks": [{"week": 1, "focus": "Fundamentals", "tasks": ["Read official guide", "Take a practice test"]}],
        "tips": ["Consistency is key."]
    }
    
    # We want a string returned for study_path_json
    study_dict = resilient_ai_response(prompt, fallback=fallback_study, is_json=True)
    study_path = json.dumps(study_dict)

    cert = UserCertification(
        user_id=current_user.id,
        title=req.title,
        provider=req.provider,
        skill_category="Certification Prep",
        difficulty=req.difficulty,
        estimated_time="4 weeks",
        external_url=req.external_url,
        status="Started",
        study_path_json=study_path
    )
    db.add(cert)
    
    log_activity_internal(
        current_user, db, "certification_started", 
        f"Started preparing for {req.title}", ""
    )
    
    db.commit()
    db.refresh(cert)
    
    return cert
