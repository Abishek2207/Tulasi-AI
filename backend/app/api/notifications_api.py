"""
Notifications API — real-time trending skills, daily reminders, and industry updates.
Personalized based on user_type and profile.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List
from pydantic import BaseModel
import datetime

from app.core.database import get_db, get_session
from app.api.deps import get_current_user
from app.models.models import User, UserTypeEnum, Notification

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

def create_notification_if_not_exists(db: Session, user_id: int, title: str, message: str, category: str):
    """Idempotently creates a notification based on title."""
    existing = db.exec(
        select(Notification)
        .where(Notification.user_id == user_id)
        .where(Notification.title == title)
    ).first()
    
    if not existing:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            category=category,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif
    return existing

@router.get("")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Returns DB-backed personalized notifications for the current user.
    """
    now_ts = datetime.datetime.utcnow().isoformat()

    # Query DB notifications
    db_notifs = db.exec(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    ).all()

    # Convert to dict format expected by frontend
    notifications = []
    for n in db_notifs:
        notifications.append({
            "id": str(n.id),
            "type": n.category,
            "priority": "medium", 
            "title": n.title,
            "body": n.message,
            "cta": "View",
            "cta_url": "/dashboard",
            "color": "#8B5CF6",
            "read": n.is_read,
            "timestamp": n.created_at.isoformat()
        })

    # Optional: Streak reminder if at risk (Dynamically computed, not persisted to DB)
    streak = getattr(current_user, 'streak', 0)
    last_login = current_user.last_seen
    if last_login:
        today = datetime.date.today()
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


class ReadRequest(BaseModel):
    id: int

@router.post("/read/{notification_id}")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Mark a specific notification as read."""
    notif = db.get(Notification, notification_id)
    if not notif or notif.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.add(notif)
    db.commit()
    return {"status": "success"}

@router.post("/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Mark all notifications as read for current user."""
    notifs = db.exec(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .where(Notification.is_read == False)
    ).all()
    
    for n in notifs:
        n.is_read = True
        db.add(n)
        
    db.commit()
    return {"status": "success", "marked_count": len(notifs)}


@router.get("/trending")
async def get_trending_skills(db: Session = Depends(get_session)):
    """Public endpoint — trending skills for banner display using real market data."""
    from app.models.models import MarketSnapshot
    
    # Get the latest global snapshot (or we can just query the most recent one overall)
    latest = db.exec(
        select(MarketSnapshot)
        .order_by(MarketSnapshot.created_at.desc())
        .limit(1)
    ).first()
    
    trending = []
    if latest:
        import json
        try:
            top_skills = json.loads(latest.top_skills)[:3]
            for i, skill in enumerate(top_skills):
                trending.append({
                    "id": f"ts{i}", "type": "trending_skill", "priority": "high",
                    "title": f"{skill.title()} is in high demand",
                    "body": f"Found in recent job postings for {latest.role}.",
                    "cta": "Learn More", "cta_url": "/dashboard/roadmaps", "color": "#8B5CF6"
                })
        except:
            pass
            
    if not trending:
        trending = [
            {"id": "ts1", "type": "trending_skill", "priority": "high",
             "title": "Software Engineering Skills in Demand",
             "body": "Real-time market tracking is initializing...",
             "cta": "View Roadmap", "cta_url": "/dashboard/roadmaps", "color": "#8B5CF6"}
        ]
        
    return {
        "trending": trending,
        "updated_at": latest.created_at.isoformat() if latest else datetime.datetime.utcnow().isoformat()
    }
