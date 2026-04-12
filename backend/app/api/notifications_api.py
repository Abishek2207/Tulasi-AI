"""
Notifications API — real-time trending skills, daily reminders, and industry updates.
Personalized based on user_type and profile.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, UserTypeEnum
import datetime

router = APIRouter()


# ── Notification Content ────────────────────────────────────────────────────

TRENDING_SKILLS = [
    {"id": "ts1", "type": "trending_skill", "priority": "critical",
     "title": "AI Engineering is the #1 demanded skill",
     "body": "LLM integration skills saw 142% YoY growth. Add to your profile now.",
     "cta": "Start AI Roadmap", "cta_url": "/dashboard/roadmaps", "color": "#8B5CF6"},

    {"id": "ts2", "type": "trending_skill", "priority": "high",
     "title": "System Design skills = 40% salary bump",
     "body": "Companies like Google, Amazon require this for Senior+ roles.",
     "cta": "Practice System Design", "cta_url": "/dashboard/system-design", "color": "#F59E0B"},

    {"id": "ts3", "type": "trending_skill", "priority": "high",
     "title": "Kubernetes engineers earn ₹8–20 LPA more",
     "body": "Cloud-native skills are now non-negotiable for backend engineers.",
     "cta": "Explore Cloud Path", "cta_url": "/dashboard/roadmaps", "color": "#06B6D4"},
]

INDUSTRY_UPDATES = [
    {"id": "iu1", "type": "industry_update", "priority": "high",
     "title": "Tech hiring surges 34% in Q1 2026",
     "body": "AI, Cloud, and Full-Stack roles are leading the recovery.",
     "cta": "View Opportunities", "cta_url": "/dashboard/internships", "color": "#10B981"},

    {"id": "iu2", "type": "industry_update", "priority": "medium",
     "title": "35% of software jobs now require AI knowledge",
     "body": "Upskill early — the window to differentiate is closing fast.",
     "cta": "View AI Roadmap", "cta_url": "/dashboard/roadmaps", "color": "#F43F5E"},
]

STUDENT_REMINDERS = [
    {"id": "sr1", "type": "daily_reminder", "priority": "high",
     "title": "Daily DSA Challenge is waiting 🧠",
     "body": "Consistency beats intensity. Solve 2 problems today.",
     "cta": "Start Coding", "cta_url": "/dashboard/daily-challenge", "color": "#4ECDC4"},

    {"id": "sr2", "type": "daily_reminder", "priority": "medium",
     "title": "Your placement readiness is 67% 📊",
     "body": "Complete today's roadmap to push above 80%.",
     "cta": "View Roadmap", "cta_url": "/dashboard/roadmaps", "color": "#8B5CF6"},
]

PROFESSIONAL_REMINDERS = [
    {"id": "pr1", "type": "daily_reminder", "priority": "high",
     "title": "Your upskilling goal: 45 min/day 🎯",
     "body": "Research shows 45 min of focused learning daily leads to 2x career growth in 1 year.",
     "cta": "Continue Learning", "cta_url": "/dashboard/roadmaps", "color": "#F97316"},

    {"id": "pr2", "type": "daily_reminder", "priority": "medium",
     "title": "Weekly reflection: Did you learn something new?",
     "body": "Professionals who track learning are 3x more likely to get promoted.",
     "cta": "Track Skills", "cta_url": "/dashboard/profile", "color": "#10B981"},
]


@router.get("")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns personalized notifications for the current user.
    Mix of trending skills, industry updates, and daily reminders.
    """
    today = datetime.date.today()
    now_ts = datetime.datetime.utcnow().isoformat()

    # Build personalized notification list
    notifications = []

    # Add trending skills (always shown, priority first)
    for n in TRENDING_SKILLS:
        notifications.append({**n, "read": False, "timestamp": now_ts})

    # Role-specific daily reminders
    if current_user.user_type == UserTypeEnum.STUDENT:
        for n in STUDENT_REMINDERS:
            notifications.append({**n, "read": False, "timestamp": now_ts})
    elif current_user.user_type == UserTypeEnum.PROFESSIONAL:
        for n in PROFESSIONAL_REMINDERS:
            notifications.append({**n, "read": False, "timestamp": now_ts})

    # Industry updates (always shown)
    for n in INDUSTRY_UPDATES:
        notifications.append({**n, "read": False, "timestamp": now_ts})

    # Streak reminder if at risk
    streak = getattr(current_user, 'streak', 0)
    last_login = current_user.last_seen
    if last_login:
        days_since = (today - last_login.date()).days
        if days_since >= 1:
            notifications.insert(0, {
                "id": "streak_alert",
                "type": "streak_alert",
                "priority": "critical",
                "title": f"⚠️ Your {streak}-day streak is at risk!",
                "body": "Log in and check in today to keep your streak alive.",
                "cta": "Check In Now",
                "cta_url": "/dashboard",
                "color": "#F43F5E",
                "read": False,
                "timestamp": now_ts
            })

    return {
        "notifications": notifications,
        "unread_count": len([n for n in notifications if not n["read"]]),
        "generated_at": now_ts
    }


@router.get("/trending")
async def get_trending_skills():
    """Public endpoint — trending skills for banner display."""
    return {
        "trending": TRENDING_SKILLS,
        "updated_at": "2026-04-12"
    }
