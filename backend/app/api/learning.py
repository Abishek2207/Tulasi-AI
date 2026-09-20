from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, SkillEvidence
from app.services.learning_engine import learning_engine

router = APIRouter(prefix="/learning", tags=["learning"])

@router.get("/today")
def get_daily_learning(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    try:
        res = learning_engine.get_next_best_learning_action(db, current_user.id, current_user.id)
        if res.get("error"):
            return res
        return {"success": True, "data": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources/{resource_id}/start")
def start_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    try:
        prog = learning_engine.start_resource(db, current_user.id, resource_id)
        return {"success": True, "progress": prog.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources/{resource_id}/complete")
def complete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    try:
        prog = learning_engine.complete_resource(db, current_user.id, resource_id)
        return {"success": True, "progress": prog.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# We can put practice and assessment here or in separate routers.
practice_router = APIRouter(prefix="/practice", tags=["practice"])

class PracticeSubmit(BaseModel):
    submission: str

@practice_router.post("/{task_id}/submit")
def submit_practice(
    task_id: int,
    req: PracticeSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    try:
        attempt = learning_engine.evaluate_practice(db, current_user.id, task_id, req.submission)
        return {"success": True, "score": attempt.score, "feedback": attempt.feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

assessment_router = APIRouter(prefix="/assessment", tags=["assessment"])

class AssessmentSubmit(BaseModel):
    answers: Dict[int, str]

@assessment_router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: int,
    req: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    try:
        attempt = learning_engine.evaluate_assessment(db, current_user.id, assessment_id, req.answers)
        return {"success": True, "score": attempt.score, "passed": attempt.passed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

skills_router = APIRouter(prefix="/skills", tags=["skills"])

@skills_router.get("/{skill_id}/evidence")
def get_skill_evidence(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    evidences = db.exec(
        select(SkillEvidence).where(
            SkillEvidence.user_id == current_user.id,
            SkillEvidence.skill_id == skill_id
        ).order_by(SkillEvidence.timestamp.desc())
    ).all()
    return {"success": True, "evidence": [e.model_dump() for e in evidences]}
