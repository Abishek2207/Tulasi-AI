from fastapi import APIRouter, Depends, UploadFile, File
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User, Certificate

router = APIRouter()

AUTO_CERTIFICATES = [
    {"milestone": "first_chat", "title": "First Steps with AI", "desc": "Completed your first AI conversation"},
    {"milestone": "10_chats", "title": "Active Learner", "desc": "Had 10 AI conversations"},
    {"milestone": "pdf_upload", "title": "Document Master", "desc": "Uploaded and analyzed your first PDF"},
    {"milestone": "interview_1", "title": "Interview Ready", "desc": "Completed your first mock interview"},
    {"milestone": "roadmap_start", "title": "On the Path", "desc": "Started a learning roadmap"},
]


@router.get("/my")
def get_my_certificates(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    certs = db.exec(select(Certificate).where(Certificate.user_id == current_user.id)).all()
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
        "available_to_earn": AUTO_CERTIFICATES,
    }


class CertificateRequest(BaseModel):
    title: str
    issuer: str


@router.post("/upload-meta")
def upload_certificate_meta(req: CertificateRequest, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
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


@router.post("/generate/{milestone}")
def generate_certificate(milestone: str, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    milestone_data = next((m for m in AUTO_CERTIFICATES if m["milestone"] == milestone), None)
    if not milestone_data:
        return {"error": "Milestone not found"}
    
    cert = Certificate(
        user_id=current_user.id,
        title=f"Tulasi AI — {milestone_data['title']}",
        issuer="Tulasi AI Platform",
        cert_type="auto",
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return {"message": "Certificate generated!", "certificate": {"title": cert.title, "id": cert.id}}
