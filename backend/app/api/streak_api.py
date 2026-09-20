"""
Streak API — daily check-in and streak tracking system.
Extends existing streak_count on the User model (non-destructive).
"""
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_db, get_session
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog
from app.api.activity import log_activity_internal
from app.api.notifications_api import create_notification_if_not_exists

router = APIRouter()

FREEZE_XP_COST = 100

@router.get("/status")
async def get_streak_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Return current streak count and whether the user has checked in today."""
    today = datetime.date.today()

    last_login = current_user.last_seen
    last_login_date = last_login.date() if last_login else None

    checked_in_today = (last_login_date == today) if last_login_date else False
    streak_at_risk = False

    if last_login_date:
        days_since_last = (today - last_login_date).days
        if days_since_last > 1:
            streak_at_risk = True  # Streak broken

    streak = current_user.streak or 0

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

    # Freeze entitlement
    can_freeze = current_user.xp >= FREEZE_XP_COST
    if current_user.freeze_used_at:
        days_since_freeze = (datetime.datetime.utcnow() - current_user.freeze_used_at).days
        if days_since_freeze < 7:
            can_freeze = False

    return {
        "streak": streak,
        "checked_in_today": checked_in_today,
        "streak_at_risk": streak_at_risk,
        "last_activity": last_login_date.isoformat() if last_login_date else None,
        "history": history,
        "can_freeze": can_freeze,
        "freeze_cost": FREEZE_XP_COST,
        "milestone_next": _next_milestone(streak),
        "message": _streak_message(streak, checked_in_today)
    }


@router.post("/checkin")
async def daily_checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Mark today's check-in. Updates streak count.
    - If last activity was yesterday → streak continues (+1)
    - If last activity was today → no change (idempotent)
    - If missed > 1 day → reset streak to 1
    """
    today = datetime.date.today()
    now = datetime.datetime.utcnow()

    last_login = current_user.last_seen
    last_date = last_login.date() if last_login else None

    if last_date == today:
        # Already checked in today — idempotent
        return {
            "success": True,
            "streak": current_user.streak,
            "already_checked_in": True,
            "message": "Already checked in today! Keep going! 🔥"
        }

    if last_date and (today - last_date).days == 1:
        # Consecutive day → increment streak
        current_user.streak = (current_user.streak or 0) + 1
        message = f"Streak extended to {current_user.streak} days! 🔥"
    elif last_date and (today - last_date).days > 1:
        # Streak broken → reset
        current_user.streak = 1
        message = "Streak reset — but you're back! Day 1. 💪"
    else:
        # First ever check-in
        current_user.streak = 1
        message = "Day 1 of your learning journey! 🚀"

    current_user.last_seen = now
    
    if current_user.streak > current_user.longest_streak:
        current_user.longest_streak = current_user.streak
        
    db.add(current_user)
    
    log_activity_internal(
        current_user, db, "streak_checkin", 
        f"Daily check-in completed. Streak: {current_user.streak} days.", ""
    )
    
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "streak": current_user.streak,
        "already_checked_in": False,
        "message": message,
        "milestone": _check_milestone(current_user.streak)
    }

@router.post("/freeze")
async def apply_streak_freeze(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Uses XP to freeze and preserve a streak that would otherwise break today."""
    today = datetime.date.today()
    now = datetime.datetime.utcnow()
    
    # Check if already checked in today
    last_login = current_user.last_seen
    last_date = last_login.date() if last_login else None
    
    if last_date == today:
        raise HTTPException(400, "You're already checked in today! No need to freeze.")
        
    # Validation
    if current_user.xp < FREEZE_XP_COST:
        raise HTTPException(400, f"Insufficient XP. You need {FREEZE_XP_COST} XP to buy a freeze.")
        
    if current_user.freeze_used_at:
        days_since_freeze = (now - current_user.freeze_used_at).days
        if days_since_freeze < 7:
            raise HTTPException(400, "You can only use a streak freeze once every 7 days.")
            
    # Apply freeze (counts as check-in but deducts XP)
    current_user.xp -= FREEZE_XP_COST
    current_user.freeze_used_at = now
    
    if last_date and (today - last_date).days > 1:
        # Streak was broken, so we extend it by doing nothing to the counter
        pass
    elif last_date and (today - last_date).days == 1:
        # Extend it normally
        current_user.streak = (current_user.streak or 0) + 1
    else:
        current_user.streak = 1
        
    current_user.last_seen = now
    db.add(current_user)
    
    log_activity_internal(
        current_user, db, "streak_freeze_used", 
        f"Used Streak Freeze. Deducted {FREEZE_XP_COST} XP.", ""
    )
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "success": True,
        "message": f"Streak freeze applied! You spent {FREEZE_XP_COST} XP.",
        "streak": current_user.streak,
        "xp": current_user.xp
    }

@router.get("/history")
async def get_streak_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Returns recent streak activity."""
    logs = db.exec(
        select(ActivityLog)
        .where(ActivityLog.user_id == current_user.id)
        .where(ActivityLog.action_type.in_(["streak_checkin", "streak_freeze_used"]))
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
    ).all()
    return logs


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
