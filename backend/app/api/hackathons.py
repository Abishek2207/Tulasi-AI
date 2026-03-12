import app.api.auth
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List, Optional

from app.core.database import get_session
from app.models.models import Hackathon

router = APIRouter()

@router.get("")
def get_hackathons(tag: Optional[str] = None, session: Session = Depends(get_session)):
    statement = select(Hackathon).where(Hackathon.is_active == True)
    
    if tag and tag.lower() != "all":
        # Simplified tag filtering for SQLite
        statement = statement.where(Hackathon.tags.contains(tag.lower()))
    
    results = session.exec(statement).all()
    return {"hackathons": results, "total": len(results)}


@router.get("/{hackathon_id}")
def get_hackathon(hackathon_id: int, session: Session = Depends(get_session)):
    h = session.get(Hackathon, hackathon_id)
    if not h:
        return {"error": "Not found"}
    return h
