import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from typing import Optional, List
from app.core.database import get_session
from app.models.models import User, PresentationSession, PresentationAttempt
from app.api.deps import get_current_user
from app.core.ai_client import HybridAIClient
import logging
import re
import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/presentation-analysis/start")
async def start_presentation_session(
    scenario: str = Body(...),
    title: str = Body(default="Presentation Practice"),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    session_id = str(uuid.uuid4())
    new_session = PresentationSession(
        user_id=current_user.id,
        session_id=session_id,
        scenario=scenario,
        title=title,
        completion_status="RECORDING"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"session_id": session_id, "status": "STARTED"}


@router.get("/presentation-analysis/history")
async def get_presentation_history(
    session_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Verify session belongs to user
    stmt = select(PresentationSession).where(
        PresentationSession.session_id == session_id,
        PresentationSession.user_id == current_user.id
    )
    p_session = db.exec(stmt).first()
    if not p_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    attempt_stmt = select(PresentationAttempt).where(PresentationAttempt.session_id == session_id).order_by(PresentationAttempt.attempt_number)
    attempts = db.exec(attempt_stmt).all()
    
    return {
        "session": p_session,
        "attempts": attempts
    }

@router.get("/presentation-analysis/compare")
async def compare_attempts(
    session_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Verify session belongs to user
    stmt = select(PresentationSession).where(
        PresentationSession.session_id == session_id,
        PresentationSession.user_id == current_user.id
    )
    p_session = db.exec(stmt).first()
    if not p_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    attempt_stmt = select(PresentationAttempt).where(PresentationAttempt.session_id == session_id).order_by(PresentationAttempt.attempt_number)
    attempts = db.exec(attempt_stmt).all()
    
    if len(attempts) < 2:
        return {"message": "Not enough attempts to compare", "deltas": None}
        
    latest = attempts[-1]
    previous = attempts[-2]
    
    deltas = {
        "duration_seconds": latest.duration_seconds - previous.duration_seconds,
        "hand_zone_violations": latest.hand_zone_violations - previous.hand_zone_violations,
        "posture_changes": latest.posture_changes - previous.posture_changes,
        "eye_contact_proxy_score": latest.eye_contact_proxy_score - previous.eye_contact_proxy_score,
        "filler_word_count": latest.filler_word_count - previous.filler_word_count,
        "words_per_minute": latest.words_per_minute - previous.words_per_minute,
    }
    
    return {
        "latest_attempt_number": latest.attempt_number,
        "previous_attempt_number": previous.attempt_number,
        "deltas": deltas,
        "improvement_summary": "Improved" if deltas["filler_word_count"] < 0 else "Needs Work"
    }

@router.post("/presentation-analysis")
async def analyze_presentation(
    session_id: str = Body(...),
    presentation_text: str = Body(...),
    duration_seconds: int = Body(...),
    hand_zone_violations: int = Body(default=0),
    posture_changes: int = Body(default=0),
    eye_contact_proxy_score: float = Body(default=0.0),
    filler_word_count: int = Body(default=0),
    words_per_minute: int = Body(default=0),
    pause_count: Optional[int] = Body(default=None),
    raw_visual_metrics: Optional[str] = Body(default=None),
    raw_speech_metrics: Optional[str] = Body(default=None),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Hackathon/General Presentation Coach Analysis Endpoint.
    Uses real client-side metrics and persists to DB.
    """
    ai_client = HybridAIClient()
    
    # Verify session belongs to user
    stmt = select(PresentationSession).where(
        PresentationSession.session_id == session_id,
        PresentationSession.user_id == current_user.id
    )
    p_session = db.exec(stmt).first()
    if not p_session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Get previous attempts to calculate attempt number
    attempt_stmt = select(PresentationAttempt).where(PresentationAttempt.session_id == session_id)
    previous_attempts = db.exec(attempt_stmt).all()
    attempt_number = len(previous_attempts) + 1
    
    # Prepare metrics summary for AI
    metrics_summary = f"""
    Duration: {duration_seconds} seconds
    Hand Zone Violations: {hand_zone_violations}
    Posture Changes: {posture_changes}
    Eye Contact Proxy: {eye_contact_proxy_score}%
    Filler Words: {filler_word_count}
    Words Per Minute: {words_per_minute}
    Pauses: {pause_count if pause_count is not None else 'Unavailable'}
    """

    # 1. Slide/Speech AI Understanding
    slide_prompt = f"""You are a presentation coach evaluating a {p_session.scenario} scenario.
    
Analyze this presentation text/transcript:
{presentation_text}

And these delivery metrics:
{metrics_summary}

Provide actionable advice. For example:
- If filler words are high, advise on pausing.
- If hands leave the zone, suggest keeping gestures between shoulder and waist.
- Evaluate the content structure.

Provide your response in JSON format with exactly these keys:
{{"slide_analysis": "overall content evaluation", "improvement_recommendations": "actionable feedback focused on the metrics"}}
"""

    analysis_data = None
    try:
        raw_analysis = await ai_client.generate(slide_prompt)
        cleaned = re.sub(r"`(?:json)?\s*([\s\S]*?)\s*`", r"\1", raw_analysis).strip()
        analysis_data = json.loads(cleaned)
    except Exception as e:
        logger.error(f"AI Analysis failed: {e}")
        raise HTTPException(status_code=503, detail="AI analysis is currently unavailable. Please try again later.")

    # 2. Generate Anticipated Q&A
    qa_prompt = f"""Based on the following presentation text: {presentation_text}
Generate 2 challenging questions a judge or interviewer might ask regarding this {p_session.scenario}."""
    
    try:
        judge_qa = await ai_client.generate(qa_prompt)
    except Exception as e:
        judge_qa = "Unable to generate Q&A at this time due to AI service unavailability."

    # Persist the attempt
    new_attempt = PresentationAttempt(
        session_id=session_id,
        attempt_number=attempt_number,
        duration_seconds=duration_seconds,
        hand_zone_violations=hand_zone_violations,
        posture_changes=posture_changes,
        eye_contact_proxy_score=eye_contact_proxy_score,
        filler_word_count=filler_word_count,
        words_per_minute=words_per_minute,
        pause_count=pause_count,
        raw_visual_metrics=raw_visual_metrics,
        raw_speech_metrics=raw_speech_metrics,
        slide_analysis=analysis_data.get("slide_analysis", ""),
        judge_qa=judge_qa,
        improvement_recommendations=analysis_data.get("improvement_recommendations", "")
    )
    
    db.add(new_attempt)
    
    # Update Session
    p_session.presentation_text = presentation_text
    p_session.duration_seconds = duration_seconds
    p_session.completion_status = "COMPLETED"
    p_session.ended_at = datetime.datetime.now(datetime.timezone.utc)
    
    db.add(p_session)
    db.commit()
    db.refresh(new_attempt)
        
    return {
        "status": "ANALYZED",
        "attempt_id": new_attempt.id,
        "metrics": metrics_summary,
        "slide_analysis": new_attempt.slide_analysis,
        "improvement_recommendations": new_attempt.improvement_recommendations,
        "judge_qa": new_attempt.judge_qa,
        "comparison_available": attempt_number > 1
    }
