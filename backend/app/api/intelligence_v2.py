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
from app.core.ai_router import get_ai_response

router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────
class CareerGPSRequest(BaseModel):
    year: str          # 1st_year | 2nd_year | 3rd_year | 4th_year | professional
    target_role: str   # AI Engineer | Software Engineer | Data Scientist | etc.
    current_skills: Optional[str] = ""

class SalaryRequest(BaseModel):
    role: str
    location: str
    yoe: int = 0       # Years of experience

class MentorRequest(BaseModel):
    question: str
    mode: str = "career"  # career | technical | interview | motivation

# ── CAREER GPS ─────────────────────────────────────────────────────────────────
@router.post("/career-gps")
@limiter.limit("10/minute")
def get_career_gps(
    request: Request,
    body: CareerGPSRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate 3 personalized career paths with timelines based on year and target role."""

    year_context = {
        "1st_year": "a first-year engineering student (just started college). Focus on fundamentals.",
        "2nd_year": "a second-year student. Introduce DSA, projects, open source.",
        "3rd_year": "a third-year student ready for internships and advanced topics.",
        "4th_year": "a final-year student preparing for campus placements and full-time offers.",
        "professional": "a working professional looking to upskill or switch roles.",
    }.get(body.year, "an engineering student")

    skills_context = f"Current skills: {body.current_skills}" if body.current_skills else "Skills not specified — provide general guidance."

    prompt = f"""You are TulasiAI's Career GPS — a world-class AI career strategist.

STUDENT PROFILE:
- Year: {body.year} ({year_context})
- Target Role: {body.target_role}
- {skills_context}

Generate EXACTLY 3 distinct career paths to become a {body.target_role}, tailored for this student's current year.

Return ONLY valid JSON with this exact structure:
{{
  "paths": [
    {{
      "id": "fast_track",
      "title": "<path name>",
      "tagline": "<1 sentence hook>",
      "color": "#8B5CF6",
      "timeline_months": <integer>,
      "difficulty": "Aggressive|Balanced|Conservative",
      "milestones": [
        {{"month": 1, "goal": "<specific milestone>", "resources": ["<resource 1>", "<resource 2>"]}},
        {{"month": 3, "goal": "<specific milestone>", "resources": ["<resource 1>", "<resource 2>"]}},
        {{"month": 6, "goal": "<specific milestone>", "resources": ["<resource 1>"]}},
        {{"month": <end>, "goal": "<final goal>", "resources": []}}
      ],
      "key_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
      "companies": ["<company 1>", "<company 2>", "<company 3>"],
      "job_readiness_pct": <integer 60-100>
    }},
    ... (repeat for 2 more paths)
  ],
  "recommendation": "fast_track|balanced|conservative",
  "founder_note": "<1-2 sentence personal note from Abishek R (founder of TulasiAI) to this student>"
}}

Make it highly specific to {body.target_role}. Include real resources (LeetCode, Coursera, fast.ai, etc.).
The 3 paths should genuinely differ in timeline and approach — not just reworded versions of each other."""

    try:
        raw = get_ai_response(prompt)
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        result = json.loads(match.group() if match else raw)

        # Log activity
        db.add(ActivityLog(
            user_id=current_user.id,
            action_type="career_gps_generated",
            title=f"Career GPS: {body.target_role} ({body.year})",
            xp_earned=5,
        ))
        current_user.xp = (current_user.xp or 0) + 5
        db.add(current_user)
        db.commit()

        return result
    except Exception as e:
        raise HTTPException(500, f"Career GPS generation failed: {str(e)}")


# ── DAILY PLAN ─────────────────────────────────────────────────────────────────
@router.get("/daily-plan")
@limiter.limit("5/minute")
def get_daily_plan(
    request: Request,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized study plan for today based on user's profile."""

    # Gather user context
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
- Target Role: {current_user.target_role or "Software Engineer"}
- Year Type: {current_user.user_type or "student"}
- Recent Activity: {activity_summary}

Generate a focused, achievable study plan for TODAY. Return ONLY valid JSON:
{{
  "greeting": "<personalized good morning/afternoon message using their name>",
  "focus_theme": "<today's theme e.g. 'DSA Deep Dive' or 'System Design Day'>",
  "tasks": [
    {{"id": 1, "task": "<specific task>", "duration_mins": <int>, "priority": "high|medium|low", "type": "coding|learning|practice|review", "link": "<optional relevant URL or null>"}},
    {{"id": 2, ...}},
    {{"id": 3, ...}},
    {{"id": 4, ...}}
  ],
  "daily_quote": "<motivational quote by a tech leader or researcher>",
  "xp_potential": <integer — XP they could earn today>,
  "streak_note": "<if streak > 0, a motivational note about maintaining the streak>"
}}

Keep tasks achievable in 2-3 hours total. Make them specific and actionable."""

    try:
        raw = get_ai_response(prompt)
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        result = json.loads(match.group() if match else raw)
        return result
    except Exception as e:
        return {
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


# ── NEXT BEST TASK ─────────────────────────────────────────────────────────────
@router.get("/next-task")
def get_next_task(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Single best next action for the user right now."""
    xp = current_user.xp or 0
    streak = current_user.streak or 0
    target = current_user.target_role or "Software Engineer"

    # Priority logic
    if streak == 0:
        task = {"action": "Start your streak!", "href": "/dashboard/daily-challenge", "reason": "Complete the ORBIT DAILY to begin your learning streak.", "xp": 50, "icon": "🔥"}
    elif xp < 200:
        task = {"action": "Solve your first coding problem", "href": "/dashboard/code", "reason": "Code Practice builds the DSA foundation every tech role requires.", "xp": 30, "icon": "💻"}
    elif xp < 500:
        task = {"action": "Run a Mock Interview", "href": "/dashboard/interview", "reason": f"Practice for a {target} role. Real-time AI feedback helps you improve fast.", "xp": 100, "icon": "🎯"}
    else:
        task = {"action": "Design a System", "href": "/dashboard/system-design", "reason": "System Design is the final boss. Start your Socratic Architect session.", "xp": 75, "icon": "🧠"}

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
    "min_lpa": <number>,
    "median_lpa": <number>,
    "max_lpa": <number>,
    "currency": "INR",
    "unit": "LPA"
  }},
  "market_percentiles": {{
    "p25": <number>,
    "p50": <number>,
    "p75": <number>,
    "p90": <number>
  }},
  "top_paying_companies": [
    {{"company": "<name>", "range": "<e.g. 18-35 LPA>", "perks": "<equity/bonus note>"}},
    ...
  ],
  "negotiation_script": {{
    "opening": "<what to say first in negotiation>",
    "counter_offer": "<what to say when they make an offer>",
    "close": "<closing statement to seal the deal>"
  }},
  "key_insights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "skills_that_boost_salary": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "market_trend": "growing|stable|declining",
  "trend_note": "<1 sentence on market trajectory for this role>"
}}

Use realistic 2025 India market data. Focus on practical, actionable intelligence."""

    try:
        raw = get_ai_response(prompt)
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        result = json.loads(match.group() if match else raw)
        return result
    except Exception as e:
        raise HTTPException(500, f"Salary intelligence generation failed. Please try again.")


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
        "career": f"You are a world-class career strategist and mentor. Give direct, specific, actionable career advice. The user is targeting: {current_user.target_role or 'Software Engineering'}.",
        "technical": f"You are a Senior Engineer at Google/Meta. Give precise technical answers with code examples where relevant. Assume the user has basic programming knowledge.",
        "interview": f"You are an expert interview coach. Give STAR-method answers, key techniques, and help the user prepare for {current_user.target_role or 'software engineering'} interviews.",
        "motivation": f"You are a motivational mentor who combines empathy with technical wisdom. You know the user's journey (XP: {current_user.xp or 0}, Streak: {current_user.streak or 0} days). Inspire them.",
    }

    system_context = mode_prompts.get(body.mode, mode_prompts["career"])

    prompt = f"""{system_context}

User ({current_user.name or 'Student'}) asks: {body.question}

Provide a focused, premium response (200-400 words). Be direct, insightful, and specific. No generic platitudes."""

    try:
        response = get_ai_response(prompt)
        return {
            "response": response,
            "mode": body.mode,
            "mentor_name": "TULASI INTELLIGENCE",
        }
    except Exception as e:
        raise HTTPException(500, "Mentor is unavailable. Try again in a moment.")


# ── USER INTELLIGENCE PROFILE ──────────────────────────────────────────────────
@router.get("/profile")
def get_intelligence_profile(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return the user's AI intelligence profile."""
    try:
        profile = json.loads(current_user.user_intelligence_profile or "{}")
        patterns = json.loads(current_user.behavioral_patterns or "{}")
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
            "target_role": current_user.target_role,
            "user_type": current_user.user_type,
            "department": current_user.department,
        }
    }
