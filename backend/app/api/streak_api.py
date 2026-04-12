"""
Streak API — daily check-in and streak tracking system.
Extends existing streak_count on the User model (non-destructive).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
import datetime

router = APIRouter()


@router.get("/status")
async def get_streak_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return current streak count and whether the user has checked in today."""
    today = datetime.date.today()

    last_login = current_user.last_login
    last_login_date = last_login.date() if last_login else None

    checked_in_today = (last_login_date == today) if last_login_date else False
    streak_at_risk = False

    if last_login_date:
        days_since_last = (today - last_login_date).days
        if days_since_last > 1:
            streak_at_risk = True  # Streak broken

    streak = current_user.streak_count or 0

    # Build a simple 7-day activity history (visual dots)
    history = []
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        is_active = (last_login_date and day <= last_login_date and
                     (last_login_date - day).days < streak) if last_login_date else False
        history.append({
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "active": is_active or (day == today and checked_in_today)
        })

    return {
        "streak": streak,
        "checked_in_today": checked_in_today,
        "streak_at_risk": streak_at_risk,
        "last_activity": last_login_date.isoformat() if last_login_date else None,
        "history": history,
        "milestone_next": _next_milestone(streak),
        "message": _streak_message(streak, checked_in_today)
    }


@router.post("/checkin")
async def daily_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark today's check-in. Updates streak count.
    - If last activity was yesterday → streak continues (+1)
    - If last activity was today → no change (idempotent)
    - If missed > 1 day → reset streak to 1
    """
    today = datetime.date.today()
    now = datetime.datetime.utcnow()

    last_login = current_user.last_login
    last_date = last_login.date() if last_login else None

    if last_date == today:
        # Already checked in today — idempotent
        return {
            "success": True,
            "streak": current_user.streak_count,
            "already_checked_in": True,
            "message": "Already checked in today! Keep going! 🔥"
        }

    if last_date and (today - last_date).days == 1:
        # Consecutive day → increment streak
        current_user.streak_count = (current_user.streak_count or 0) + 1
        message = f"Streak extended to {current_user.streak_count} days! 🔥"
    elif last_date and (today - last_date).days > 1:
        # Streak broken → reset
        current_user.streak_count = 1
        message = "Streak reset — but you're back! Day 1. 💪"
    else:
        # First ever check-in
        current_user.streak_count = 1
        message = "Day 1 of your learning journey! 🚀"

    current_user.last_login = now
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "streak": current_user.streak_count,
        "already_checked_in": False,
        "message": message,
        "milestone": _check_milestone(current_user.streak_count)
    }


def _next_milestone(streak: int) -> dict:
    milestones = [7, 14, 30, 60, 100, 180, 365]
    for m in milestones:
        if streak < m:
            return {"days": m, "remaining": m - streak, "reward": f"{m}-Day Legend Badge"}
    return {"days": 365, "remaining": 0, "reward": "Annual Champion 🏆"}


def _check_milestone(streak: int) -> dict | None:
    milestones = {7: "Week Warrior 🏅", 14: "Fortnight Fighter ⚡", 30: "Monthly Master 🎯",
                  60: "60-Day Titan 💎", 100: "Century Club 🏆", 180: "Half-Year Hero 🌟", 365: "Annual Legend 👑"}
    return {"badge": milestones[streak], "streak": streak} if streak in milestones else None


def _streak_message(streak: int, checked_in: bool) -> str:
    if not checked_in:
        return "Come back today to keep your streak! ⚡"
    if streak >= 100:
        return f"Legendary! {streak}-day streak — you're unstoppable! 👑"
    elif streak >= 30:
        return f"Incredible! {streak} days of consistency. You're in the top 5%! 🔥"
    elif streak >= 7:
        return f"{streak} days strong! You're building a real habit. 💪"
    else:
        return f"Day {streak} — every day counts. Keep going! 🚀"
