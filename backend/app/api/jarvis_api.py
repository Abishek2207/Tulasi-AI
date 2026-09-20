from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Dict, Any, List
from pydantic import BaseModel
import datetime

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, FocusSession, ActivityLog
from app.core.ai_router import get_ai_response

router = APIRouter()

class JarvisCommandRequest(BaseModel):
    command: str

from app.services.placement_service import placement_readiness_service
import asyncio

async def get_verified_context(current_user: User, db: Session) -> str:
    """Gathers true, verified facts about the user's progress for Jarvis to use."""
    today = datetime.date.today()
    last_login = current_user.last_seen
    last_login_date = last_login.date() if last_login else None
    checked_in_today = (last_login_date == today) if last_login_date else False
    
    streak = current_user.streak or 0
    longest_streak = current_user.longest_streak or 0
    
    # Get today's focus stats
    now = datetime.datetime.utcnow()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    focus_sessions = db.exec(
        select(FocusSession)
        .where(FocusSession.user_id == current_user.id)
        .where(FocusSession.created_at >= start_of_day)
        .where(FocusSession.status == "completed")
    ).all()
    focus_minutes_today = sum(s.duration_minutes for s in focus_sessions)
    
    # Get Phase 6 Intelligence Data
    try:
        placement_data = await placement_readiness_service.calculate_readiness(db, current_user)
        readiness_score = placement_data.get("overall_score", 0)
        missing_skills = placement_data.get("evidence", [])
        intelligence_str = f"- Placement Readiness: {readiness_score}/100\n- Intelligence Evidence: {'; '.join(missing_skills)}"
    except Exception as e:
        intelligence_str = "- Placement Readiness: Data Unavailable"

    return f"""
Verified User Context:
- Role: {current_user.role} ({current_user.user_type})
- Streak: {streak} days (Checked in today: {checked_in_today})
- Longest Streak: {longest_streak} days
- XP: {current_user.xp}
- Level: {current_user.level}
- Focus Today: {focus_minutes_today} minutes completed across {len(focus_sessions)} sessions.
{intelligence_str}
"""

@router.get("/daily-nudge")
async def get_daily_nudge(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Generates a personalized daily nudge based purely on verified data."""
    context = await get_verified_context(current_user, db)
    
    prompt = f"""You are Jarvis, the user's accountability assistant.
Based ONLY on the following verified data, generate a single short, motivating daily nudge sentence (max 15 words).
Do not fabricate statistics or facts.

{context}
"""
    try:
        nudge = get_ai_response(prompt).strip(' \n"')
        return {"nudge": nudge}
    except Exception as e:
        return {"nudge": "Ready to build something great today? Let's go! 🚀"}

@router.get("/focus-suggestion")
async def get_focus_suggestion(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Suggests a focus topic based on their role and activity."""
    context = await get_verified_context(current_user, db)
    
    prompt = f"""You are Jarvis. Suggest a specific, actionable focus session topic for this user based on their context.
Return ONLY a short topic (max 5 words). Do not include any chat formatting.
{context}
"""
    try:
        suggestion = get_ai_response(prompt).strip(' \n"')
        return {"suggestion": suggestion}
    except Exception as e:
        return {"suggestion": "Deep Work Block"}

@router.get("/accountability-summary")
async def get_accountability_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Provides a brutal, objective summary of their recent progress."""
    context = await get_verified_context(current_user, db)
    
    prompt = f"""You are Jarvis, an objective accountability assistant.
Write a 2-3 sentence summary of the user's current progress. 
If they have a good streak or focus time, praise them. If not, give them tough love.
Rely ONLY on these facts. Do not make up metrics.
{context}
"""
    try:
        summary = get_ai_response(prompt).strip(' \n"')
        return {"summary": summary}
    except Exception as e:
        return {"summary": "Your tracking is active. Stay consistent to see results."}

@router.post("/command")
def parse_jarvis_command(
    req: JarvisCommandRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Parses a natural language command into an actionable intent.
    Intents: START_FOCUS, FREEZE_STREAK, SHOW_STATS, UNKNOWN
    """
    prompt = f"""You are a command parser for an app.
User command: "{req.command}"

Determine the intent of the user. Choose EXACTLY ONE from: 
START_FOCUS, FREEZE_STREAK, SHOW_STATS, UNKNOWN

Return ONLY the intent string. Do not chat.
"""
    try:
        intent = get_ai_response(prompt).strip(' \n"')
        if intent not in ["START_FOCUS", "FREEZE_STREAK", "SHOW_STATS"]:
            intent = "UNKNOWN"
        return {"intent": intent, "original_command": req.command}
    except Exception as e:
        return {"intent": "UNKNOWN", "original_command": req.command}
