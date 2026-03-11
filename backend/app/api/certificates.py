from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User, Certificate, UserProgress

router = APIRouter()

# Milestones that can generate certificates — each requires 100% progress in a category
MILESTONE_CERTS = [
    {
        "id": "coding_complete",
        "title": "Coding Arena Master",
        "desc": "Solved 100+ coding problems across all DSA categories",
        "category": "coding",
        "required_pct": 100,
        "icon": "💻",
    },
    {
        "id": "interview_master",
        "title": "Interview Champion",
        "desc": "Completed 10+ AI mock interviews with strong performance",
        "category": "interview",
        "required_pct": 100,
        "icon": "🎯",
    },
    {
        "id": "roadmap_complete",
        "title": "Career Roadmap Achiever",
        "desc": "Completed all steps in a career learning roadmap",
        "category": "roadmap",
        "required_pct": 100,
        "icon": "🗺️",
    },
    {
        "id": "video_learner",
        "title": "YouTube Learning Pro",
        "desc": "Watched 50+ curated learning videos",
        "category": "videos",
        "required_pct": 100,
        "icon": "▶️",
    },
]


@router.get("/my")
def get_my_certificates(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    certs = db.exec(select(Certificate).where(Certificate.user_id == current_user.id)).all()

    # Get current progress for all categories
    progress_records = db.exec(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    ).all()
    progress_map = {p.category: p.progress_pct for p in progress_records}

    earned_ids = {c.title for c in certs}

    milestones_status = []
    for m in MILESTONE_CERTS:
        pct = progress_map.get(m["category"], 0)
        milestones_status.append({
            **m,
            "current_pct": pct,
            "can_generate": pct >= m["required_pct"],
            "already_earned": m["title"] in earned_ids,
        })

    return {
        "certificates": [
            {
                "id": c.id,
                "title": c.title,
                "issuer": c.issuer,
                "type": c.cert_type,
                "issued_at": c.issued_at.isoformat(),
            }
            for c in certs
        ],
        "milestones": milestones_status,
    }


class CertificateRequest(BaseModel):
    title: str
    issuer: str


@router.post("/upload-meta")
def upload_certificate_meta(
    req: CertificateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    cert = Certificate(
        user_id=current_user.id,
        title=req.title,
        issuer=req.issuer,
        cert_type="upload",
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return {"message": "Certificate recorded", "id": cert.id}


@router.post("/generate/{milestone_id}")
def generate_certificate(
    milestone_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """STRICT: Only generates certificate if user has 100% progress in required category."""
    milestone = next((m for m in MILESTONE_CERTS if m["id"] == milestone_id), None)
    if not milestone:
        raise HTTPException(404, "Milestone not found")

    # === STRICT PROGRESS CHECK ===
    prog = db.exec(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.category == milestone["category"]
        )
    ).first()

    current_pct = prog.progress_pct if prog else 0

    if current_pct < milestone["required_pct"]:
        raise HTTPException(
            403,
            f"Certificate locked! You need {milestone['required_pct']}% progress in {milestone['category']} "
            f"but you&apos;re at {current_pct}%. Keep going! 🚀"
        )

    # Check if already earned
    existing = db.exec(
        select(Certificate).where(
            Certificate.user_id == current_user.id,
            Certificate.title == milestone["title"]
        )
    ).first()
    if existing:
        return {"message": "Certificate already earned!", "id": existing.id}

    cert = Certificate(
        user_id=current_user.id,
        title=milestone["title"],
        issuer="Tulasi AI Platform",
        cert_type="earned",
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return {
        "message": "🎉 Certificate unlocked and generated!",
        "certificate": {
            "id": cert.id,
            "title": cert.title,
            "issued_at": cert.issued_at.isoformat(),
        }
    }
