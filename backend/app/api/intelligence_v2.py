"""
Intelligence V2 — Career GPS + Daily Plan + Salary Intel + AGI Mentor
Super-personalized AI routes for TulasiAI's career intelligence layer.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional, List
import json, re

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog, PersistentInterviewSession
from app.core.rate_limit import limiter
from app.core.ai_router import resilient_ai_response


router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────
class CareerGPSRequest(BaseModel):
    year: str          # 1st_year | 2nd_year | 3rd_year | 4th_year
    target_role: str   # AI Engineer | Software Engineer | Data Scientist | etc.
    current_skills: Optional[str] = ""

class SalaryRequest(BaseModel):
    role: str
    location: str
    yoe: int = 0       # Years of experience

class MentorRequest(BaseModel):
    question: str
    mode: str = "career"  # career | technical | interview | motivation

class RAGChatRequest(BaseModel):
    message: str
    media: Optional[str] = None


# ── DAILY PLAN ─────────────────────────────────────────────────────────────────
@router.get("/daily-plan")
@limiter.limit("5/minute")
def get_daily_plan(
    request: Request,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized study plan for today based on user's profile."""
    recent_activity = db.exec(
        select(ActivityLog)
        .where(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
    ).all()

    activity_summary = ", ".join([a.action_type.replace("_", " ") for a in recent_activity]) or "No recent activity"

    prompt = f"""You are TulasiAI's Daily Intelligence Engine.

USER PROFILE:
- Name: {current_user.name or "Student"}
- XP: {current_user.xp or 0}
- Streak: {current_user.streak or 0} days
- Target Role: {(current_user.profile.target_role if getattr(current_user, 'profile', None) else '') or "Software Engineer"}
- Year Type: {current_user.user_type or "student"}
- Recent Activity: {activity_summary}

Generate a focused, achievable study plan for TODAY. Return ONLY valid JSON:
{{
  "greeting": "<personalized greeting>",
  "focus_theme": "<theme>",
  "tasks": [
    {{"id": 1, "task": "<task>", "duration_mins": 30, "priority": "high", "type": "coding", "link": null}}
  ],
  "daily_quote": "<quote>",
  "xp_potential": 150,
  "streak_note": "<note>"
}}"""

    fallback = {
        "greeting": f"Good day, {current_user.name or 'Champion'}! Ready to build something great?",
        "focus_theme": "Consistent Progress",
        "tasks": [
            {"id": 1, "task": "Solve 2 LeetCode Easy problems", "duration_mins": 45, "priority": "high", "type": "coding", "link": "https://leetcode.com"},
            {"id": 2, "task": "Review your system design notes", "duration_mins": 30, "priority": "medium", "type": "review", "link": None},
            {"id": 3, "task": "Complete today's ORBIT DAILY challenge", "duration_mins": 20, "priority": "high", "type": "practice", "link": "/dashboard/daily-challenge"},
            {"id": 4, "task": "Watch one AI/tech YouTube video", "duration_mins": 25, "priority": "low", "type": "learning", "link": "https://youtube.com"},
        ],
        "daily_quote": "\"The best way to predict the future is to invent it.\" — Alan Kay",
        "xp_potential": 150,
        "streak_note": f"You're on a {current_user.streak or 0}-day streak. Keep going!" if current_user.streak else None,
    }
    
    return resilient_ai_response(prompt, fallback=None)


# ── NEXT BEST TASK ─────────────────────────────────────────────────────────────
@router.get("/next-task")
def get_next_task(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Single best next action for the user right now."""
    xp = current_user.xp or 0
    streak = current_user.streak or 0
    target = (current_user.profile.target_role if getattr(current_user, 'profile', None) else '') or "Software Engineer"

    if streak == 0:
        task = {"action": "Start your streak!", "href": "/dashboard/daily-challenge", "reason": "Complete the ORBIT DAILY to begin your learning streak.", "xp": 50, "icon": "\U0001f525"}
    elif xp < 200:
        task = {"action": "Solve your first coding problem", "href": "/dashboard/code", "reason": "Code Practice builds the DSA foundation every tech role requires.", "xp": 30, "icon": "\U0001f4bb"}
    elif xp < 500:
        task = {"action": "Run a Mock Interview", "href": "/dashboard/interview", "reason": f"Practice for a {target} role. Real-time AI feedback helps you improve fast.", "xp": 100, "icon": "\U0001f3af"}
    else:
        task = {"action": "Design a System", "href": "/dashboard/system-design", "reason": "System Design is the final boss. Start your Socratic Architect session.", "xp": 75, "icon": "\U0001f9e0"}

    return {"next_task": task, "current_xp": xp, "current_streak": streak}


# ── SALARY INTELLIGENCE ─────────────────────────────────────────────────────────
@router.post("/salary-intel")
@limiter.limit("10/minute")
def get_salary_intel(
    request: Request,
    body: SalaryRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Market salary intelligence + negotiation playbook for a given role/location/experience."""

    prompt = f"""You are TulasiAI's Salary Intelligence Engine — a compensation expert with deep knowledge of Indian and global tech markets.

QUERY:
- Role: {body.role}
- Location: {body.location}
- Years of Experience: {body.yoe}

Provide a comprehensive salary intelligence report. Return ONLY valid JSON:
{{
  "role": "{body.role}",
  "location": "{body.location}",
  "yoe": {body.yoe},
  "salary_range": {{
    "min_lpa": 8, "median_lpa": 12, "max_lpa": 25, "currency": "INR", "unit": "LPA"
  }},
  "market_percentiles": {{ "p25": 9, "p50": 12, "p75": 18, "p90": 25 }},
  "top_paying_companies": [
    {{"company": "Google", "range": "30-50 LPA", "perks": "Equity"}}
  ],
  "negotiation_script": {{
    "opening": "Script", "counter_offer": "Script", "close": "Script"
  }},
  "key_insights": ["Insight 1"],
  "skills_that_boost_salary": ["Skill 1"],
  "market_trend": "growing",
  "trend_note": "Growing"
}}"""

    return resilient_ai_response(
        prompt, 
        fallback=None
    )


# ── AGI MENTOR ─────────────────────────────────────────────────────────────────
@router.post("/ask-mentor")
@limiter.limit("20/minute")
def ask_mentor(
    request: Request,
    body: MentorRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Personal AI mentor that switches modes: career, technical, interview, motivation."""

    mode_prompts = {
        "career": f"You are a world-class career strategist and mentor. Give direct, specific, actionable career advice. The user is targeting: {(current_user.profile.target_role if getattr(current_user, 'profile', None) else '') or 'Software Engineering'}.",
        "technical": f"You are a Senior Engineer at Google/Meta. Give precise technical answers with code examples where relevant.",
        "interview": f"You are an expert interview coach. Give STAR-method answers.",
        "motivation": f"You are a motivational mentor.",
    }

    system_context = mode_prompts.get(body.mode, mode_prompts["career"])
    prompt = f"{system_context}\n\nUser asks: {body.question}"

    
    
    return resilient_ai_response(prompt, fallback=None, is_json=False)


@router.post("/chat")
@limiter.limit("20/minute")
def rag_chat(
    request: Request,
    body: RAGChatRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """AGI Mentor chat — personalized AI responses for the messages page."""
    system_prompt = (
        f"You are TulasiAI's AGI Mentor — a world-class Neural Career Strategist. "
        f"The user is {current_user.name or 'an engineering student'}, "
        f"targeting: {(current_user.profile.target_role if getattr(current_user, 'profile', None) else '') or 'Software Engineering'}. "
        f"XP: {current_user.xp or 0}, Streak: {current_user.streak or 0} days. "
        f"Give direct, specific, actionable guidance. Be concise and motivating."
    )
    
    full_prompt = f"{system_prompt}\n\nUser: {body.message}"
    
    raw = resilient_ai_response(
        full_prompt,
        fallback=None,
        is_json=False
    )
    
    # Always return {response: string} so frontend can do data?.response
    if isinstance(raw, dict):
        return {"response": raw.get("response", str(raw)), "mode": "mentor"}
    return {"response": str(raw), "mode": "mentor"}
# ── USER INTELLIGENCE PROFILE ──────────────────────────────────────────────────
@router.get("/profile")
def get_intelligence_profile(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return the user's AI intelligence profile."""
    try:
        profile = json.loads((current_user.profile.user_intelligence_profile if getattr(current_user, 'profile', None) else "{}") or "{}")
        patterns = json.loads((current_user.profile.behavioral_patterns if getattr(current_user, 'profile', None) else "{}") or "{}")
    except Exception:
        profile = {}
        patterns = {}

    return {
        "profile": profile,
        "patterns": patterns,
        "user": {
            "name": current_user.name,
            "xp": current_user.xp,
            "streak": current_user.streak,
            "target_role": (current_user.profile.target_role if getattr(current_user, 'profile', None) else ''),
            "user_type": current_user.user_type,
            "department": (current_user.profile.department if getattr(current_user, 'profile', None) else ''),
        }
    }
