"""
Feature #1 — AI Next Action & Learning Recommendation Engine
Analyses the user's last 7 days of ActivityLogs, detects weak/strong areas,
and returns a personalised list of "what to do next" actions.
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import json

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.models import User, ActivityLog
from app.core.ai_router import get_ai_response

router = APIRouter()

# ── Map action_type → feature area ──────────────────────────────────────────
ACTION_AREA_MAP = {
    "message_sent":        "AI Chat",
    "interview_completed": "Mock Interview",
    "roadmap_step":        "Roadmap",
    "roadmap_completed":   "Roadmap",
    "roadmap_generated":   "Roadmap",
    "code_submitted":      "Coding Practice",
    "resume_created":      "Resume Builder",
    "pdf_qa":              "Document Q&A",
    "hackathon_view":      "Hackathons",
    "user_login":          "Platform",
    "user_register":       "Platform",
}

# ── Year-wise daily plans ────────────────────────────────────────────────────
YEAR_PLANS: Dict[str, List[Dict]] = {
    "1st_year": [
        {"title": "Learn Python Basics", "desc": "Variables, loops, functions, and OOP fundamentals.", "link": "/dashboard/chat", "xp": 20, "icon": "🐍"},
        {"title": "Start a Mini Project", "desc": "Build a simple calculator or to-do app in Python.", "link": "/dashboard/roadmaps", "xp": 50, "icon": "🛠️"},
        {"title": "Learn Git & GitHub", "desc": "Version control is essential for every developer.", "link": "/dashboard/platform-guides", "xp": 30, "icon": "🔧"},
    ],
    "2nd_year": [
        {"title": "Practice DSA", "desc": "Arrays, Linked Lists, Stacks, Queues — master the basics.", "link": "/dashboard/code", "xp": 40, "icon": "📊"},
        {"title": "Build a Web Project", "desc": "Create a full-stack mini project with a database.", "link": "/dashboard/roadmaps", "xp": 60, "icon": "🌐"},
        {"title": "Explore Open Source", "desc": "Contribute to a GitHub project to build your portfolio.", "link": "/dashboard/hackathons", "xp": 40, "icon": "🤝"},
    ],
    "3rd_year": [
        {"title": "Deep DSA + Trees/Graphs", "desc": "BFS, DFS, Dynamic Programming — interview essentials.", "link": "/dashboard/code", "xp": 50, "icon": "🌲"},
        {"title": "Apply for Internships", "desc": "Build your resume and start applying now.", "link": "/dashboard/internships", "xp": 30, "icon": "💼"},
        {"title": "Mock Interview Practice", "desc": "Practice interview questions for your target company.", "link": "/dashboard/interview", "xp": 60, "icon": "🎤"},
    ],
    "4th_year": [
        {"title": "System Design Deep Dive", "desc": "Learn scalability, load balancing, and DB design.", "link": "/dashboard/system-design", "xp": 60, "icon": "🏗️"},
        {"title": "Full Mock Interview", "desc": "Simulate a complete interview at your dream company.", "link": "/dashboard/interview", "xp": 80, "icon": "🎯"},
        {"title": "Optimise Your Resume", "desc": "ATS-proof your resume with strong action verbs.", "link": "/dashboard/resume", "xp": 40, "icon": "📄"},
    ],
    "professional": [
        {"title": "Upskill: AI/ML Fundamentals", "desc": "Add AI skills to your existing profile.", "link": "/dashboard/roadmaps", "xp": 50, "icon": "🤖"},
        {"title": "System Design Practice", "desc": "Prep for senior-level architecture questions.", "link": "/dashboard/system-design", "xp": 60, "icon": "🏗️"},
        {"title": "Prepare for Role Switching", "desc": "Build a 3-month transition plan.", "link": "/dashboard/prep-plan", "xp": 40, "icon": "🔄"},
    ],
    "professor": [
        {"title": "Explore AI Teaching Tools", "desc": "Use Tulasi AI to create course content.", "link": "/dashboard/chat", "xp": 20, "icon": "📚"},
        {"title": "Review Student Roadmaps", "desc": "Guide students through their career paths.", "link": "/dashboard/roadmaps", "xp": 30, "icon": "🗺️"},
        {"title": "Build a Coding Challenge", "desc": "Create practice problems for your students.", "link": "/dashboard/code", "xp": 40, "icon": "💡"},
    ],
    "student": [
        {"title": "Take a Mock Interview", "desc": "Sharpen your skills with an AI-powered mock interview.", "link": "/dashboard/interview", "xp": 60, "icon": "🎤"},
        {"title": "Build Your Roadmap", "desc": "Create a personalised learning path for your goal.", "link": "/dashboard/roadmaps", "xp": 40, "icon": "🗺️"},
        {"title": "Practice DSA Today", "desc": "Solve one problem and maintain your streak.", "link": "/dashboard/code", "xp": 30, "icon": "💻"},
    ],
}


@router.get("")
def get_next_actions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """
    Returns personalised next-action recommendations based on:
    1. User's activity in the past 7 days
    2. Detected weak areas
    3. User type (year / professional)
    """
    since = datetime.utcnow() - timedelta(days=7)
    logs = db.exec(
        select(ActivityLog).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.created_at >= since,
        )
    ).all()

    # Count actions per area
    area_counts: Dict[str, int] = {}
    for log in logs:
        area = ACTION_AREA_MAP.get(log.action_type, "Other")
        area_counts[area] = area_counts.get(area, 0) + 1

    # Detect weak areas (features not used in last 7 days)
    all_features = {"Mock Interview", "Coding Practice", "Roadmap", "Resume Builder"}
    weak_areas = all_features - set(area_counts.keys())

    # Build recommendations based on user type
    user_type = getattr(current_user, "user_type", "student") or "student"
    base_actions = YEAR_PLANS.get(user_type, YEAR_PLANS["student"]).copy()

    # Inject weak-area specific nudges
    if "Mock Interview" in weak_areas:
        base_actions.insert(0, {
            "title": "🔴 Overdue: Mock Interview",
            "desc": "You haven't practised interviews this week. Time to sharpen your skills!",
            "link": "/dashboard/interview",
            "xp": 80,
            "icon": "⚠️",
            "urgent": True,
        })
    if "Coding Practice" in weak_areas:
        base_actions.insert(0, {
            "title": "🔴 Overdue: DSA Practice",
            "desc": "No coding practice this week — solve at least one problem to keep your edge.",
            "link": "/dashboard/code",
            "xp": 40,
            "icon": "⚠️",
            "urgent": True,
        })

    return {
        "user_type": user_type,
        "xp": current_user.xp,
        "streak": current_user.streak,
        "actions": base_actions[:6],
        "weak_areas": list(weak_areas),
        "strong_areas": [k for k, v in area_counts.items() if v >= 3],
        "activity_last_7d": area_counts,
    }


@router.get("/daily-plan")
def get_daily_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Returns a structured daily plan based on user type and XP level."""
    user_type = getattr(current_user, "user_type", "student") or "student"
    actions = YEAR_PLANS.get(user_type, YEAR_PLANS["student"])

    return {
        "date": datetime.utcnow().strftime("%A, %d %B %Y"),
        "user_type": user_type,
        "daily_tasks": actions,
        "total_xp_available": sum(a.get("xp", 0) for a in actions),
    }

@router.get("/weekly-plan")
def get_weekly_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Returns a structured weekly plan expanding daily tasks."""
    user_type = getattr(current_user, "user_type", "student") or "student"
    actions = YEAR_PLANS.get(user_type, YEAR_PLANS["student"])
    
    weekly_schedule = [
        {"day": "Monday", "focus": "Core Principles", "tasks": actions[:2]},
        {"day": "Tuesday", "focus": "Deep Dive", "tasks": actions[1:3]},
        {"day": "Wednesday", "focus": "Problem Solving", "tasks": actions[0:1]},
        {"day": "Thursday", "focus": "Building", "tasks": actions[2:3]},
        {"day": "Friday", "focus": "Review & Iterate", "tasks": actions[:1]},
        {"day": "Saturday", "focus": "Mock Test", "tasks": actions},
        {"day": "Sunday", "focus": "Rest & Light Reading", "tasks": []},
    ]

    return {
        "user_type": user_type,
        "weekly_schedule": weekly_schedule
    }


class OnboardRequest:
    pass


from pydantic import BaseModel

class OnboardPayload(BaseModel):
    user_type: str  # 1st_year | 2nd_year | 3rd_year | 4th_year | professional | professor
    department: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[List[str]] = []
    interest_areas: Optional[List[str]] = []

VALID_USER_TYPES = {"1st_year", "2nd_year", "3rd_year", "4th_year", "professional", "professor", "student"}


@router.post("/onboard")
def complete_onboarding(
    payload: OnboardPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Sets user_type and marks onboarding complete with career metadata."""
    if payload.user_type not in VALID_USER_TYPES:
        from fastapi import HTTPException
        raise HTTPException(400, f"Invalid user_type. Valid: {VALID_USER_TYPES}")

    current_user.user_type = payload.user_type
    current_user.department = payload.department
    current_user.target_role = payload.target_role
    if payload.target_companies:
        current_user.target_companies = ",".join(payload.target_companies)
    if payload.interest_areas:
        current_user.interest_areas = ",".join(payload.interest_areas)
        
    current_user.is_onboarded = True
    
    # ── Grant Signing Bonus ─────────────────────────────────────────
    from app.api.activity import log_activity_internal
    log_activity_internal(current_user, db, "onboarding_completed", "Completed Career Setup", xp_override=200)
    # ─────────────────────────────────────────────────────────────────

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Onboarding complete! +200 XP Granted.",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role,
            "is_pro": current_user.is_pro,
            "xp": current_user.xp,
            "level": current_user.level,
            "streak": current_user.streak,
            "is_onboarded": current_user.is_onboarded,
            "user_type": current_user.user_type,
            "department": current_user.department,
            "target_role": current_user.target_role
        }
    }
