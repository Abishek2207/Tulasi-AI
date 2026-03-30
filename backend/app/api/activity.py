from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
import sqlmodel
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import time

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog, UserProgress, SolvedProblem, UserBadge, Reward

router = APIRouter()

XP_TABLE = {
    "code_solved": 50,
    "video_watched": 20,
    "reel_watched": 10,
    "interview_completed": 100,
    "roadmap_step": 30,
    "hackathon_joined": 80,
    "roadmap_completed": 200,
    "course_completed": 150,
}

ACTION_ICONS = {
    "code_solved": "💻",
    "video_watched": "▶️",
    "reel_watched": "📱",
    "interview_completed": "🎯",
    "roadmap_step": "🗺️",
    "hackathon_joined": "🏆",
    "roadmap_completed": "🎉",
    "course_completed": "📜",
    "user_login": "🔑",
    "user_register": "👋",
    "profile_update": "👤",
    "message_sent": "💬",
    "resume_generated": "📄",
    "startup_saved": "💡",
    "roadmap_generated": "🗺️",
    "hackathon_bookmarked": "🔖",
}


class LogActivityRequest(BaseModel):
    action_type: str  # code_solved | video_watched | reel_watched | interview_completed | roadmap_step | hackathon_joined | roadmap_completed | course_completed
    title: str
    metadata_json: Optional[str] = None


def _update_streak(user: User, db: Session):
    """Increment streak if first activity of today; reset if gap > 1 day."""
    today = date.today().isoformat()
    last = user.last_activity_date

    if last == today:
        return  # already active today

    yesterday = (date.fromisoformat(last) if last else None)
    from datetime import timedelta
    try:
        if last and (date.today() - date.fromisoformat(last)).days == 1:
            user.streak = (user.streak or 0) + 1
        elif not last or (date.today() - date.fromisoformat(last)).days > 1:
            user.streak = 1  # reset or start
    except ValueError:
        user.streak = 1 # reset streak if date parsing fails

    user.last_activity_date = today
    db.add(user)


def _update_progress(user_id: int, category: str, db: Session):
    """Recalculate progress_pct for a category based on solved count."""
    # Target totals based on Certificate requirements
    TOTALS = {
        "coding": 100,
        "interview": 10,
        "videos": 50,
        "roadmap": 20
    }
    total = TOTALS.get(category, 20)

    prog = db.exec(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.category == category
        )
    ).first()

    # Count completed items for this category
    if category == "coding":
        completed = len(db.exec(
            select(SolvedProblem).where(SolvedProblem.user_id == user_id)
        ).all())
    elif category == "interview":
        completed = len(db.exec(
            select(ActivityLog).where(ActivityLog.user_id == user_id, ActivityLog.action_type == "interview_completed")
        ).all())
    elif category == "videos":
        completed = len(db.exec(
            select(ActivityLog).where(ActivityLog.user_id == user_id, ActivityLog.action_type == "video_watched")
        ).all())
    else:
        # Default for roadmaps or other
        completed = len(db.exec(
            select(ActivityLog).where(ActivityLog.user_id == user_id, ActivityLog.action_type == "roadmap_step")
        ).all())

    pct = min(100, int((completed / total) * 100)) if total > 0 else 0

    if prog:
        prog.completed_items = completed
        prog.total_items = total
        prog.progress_pct = pct
        prog.updated_at = datetime.utcnow()
        db.add(prog)
    else:
        new_prog = UserProgress(
            user_id=user_id,
            category=category,
            total_items=total,
            completed_items=completed,
            progress_pct=pct
        )
        db.add(new_prog)


def log_activity_internal(user: User, db: Session, action_type: str, title: str, metadata_json: Optional[str] = None):
    """Centralized logic to log activity, update XP, streak, and progress."""
    xp = XP_TABLE.get(action_type, 0)

    log_entry = ActivityLog(
        user_id=user.id,
        action_type=action_type,
        title=title,
        metadata_json=metadata_json,
        xp_earned=xp,
    )
    db.add(log_entry)

    if xp > 0:
        # Update XP on user
        user.xp = (user.xp or 0) + xp
        # Level up every 500 XP
        user.level = max(1, (user.xp or 0) // 500 + 1)

    # Update streak for any activity
    _update_streak(user, db)

    # Automatic Progress Update
    CATEGORY_MAPPING = {
        "code_solved": "coding",
        "interview_completed": "interview",
        "video_watched": "videos",
        "roadmap_step": "roadmap",
        "roadmap_completed": "roadmap"
    }
    category = CATEGORY_MAPPING.get(action_type)
    if category:
        _update_progress(user.id, category, db)

    return log_entry


@router.post("/log")
def log_activity(
    req: LogActivityRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    log_entry = log_activity_internal(
        current_user, db, req.action_type, req.title, req.metadata_json
    )
    if not log_entry:
        raise HTTPException(400, f"Unknown action_type: {req.action_type}")

    db.commit()
    db.refresh(log_entry)

    return {
        "success": True,
        "xp_earned": log_entry.xp_earned,
        "total_xp": current_user.xp,
        "streak": current_user.streak,
        "level": current_user.level,
        "action": req.action_type,
    }


@router.get("/history")
def get_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    action_type: Optional[str] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(ActivityLog).where(ActivityLog.user_id == current_user.id)
    if action_type and action_type != "all":
        query = query.where(ActivityLog.action_type == action_type)

    query = query.order_by(ActivityLog.created_at.desc())

    all_items = db.exec(query).all()
    total = len(all_items)
    offset = (page - 1) * limit
    items = all_items[offset : offset + limit]

    return {
        "history": [
            {
                "id": item.id,
                "action_type": item.action_type,
                "icon": ACTION_ICONS.get(item.action_type, "📌"),
                "title": item.title,
                "xp_earned": item.xp_earned,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ],
        "total": total,
        "page": page,
        "pages": max(1, -(-total // limit)),  # ceiling division
    }


@router.get("/achievements")
def get_achievements(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.models import UserBadge
    badges = db.exec(select(UserBadge).where(UserBadge.user_id == current_user.id)).all()
    return {"badges": badges}


@router.get("/rewards")
def get_rewards(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.models import Reward
    rewards = db.exec(select(Reward)).all()
    # If empty, seed some default rewards
    if not rewards:
        default_rewards = [
            Reward(name="Neon Profile Theme", description="Glow up your dashboard with a neon theme.", cost_xp=500, category="customization"),
            Reward(name="AI Resume Builder Pro", description="Unlock advanced AI templates for your resume.", cost_xp=1000, category="feature"),
            Reward(name="Interview Pass", description="Get 5 extra high-intensity mock interviews.", cost_xp=1500, category="perk"),
        ]
        for r in default_rewards:
            db.add(r)
        db.commit()
        rewards = db.exec(select(Reward)).all()
    
    return {"rewards": rewards}


class RedeemRewardRequest(BaseModel):
    reward_id: int

@router.post("/rewards/redeem")
def redeem_reward(
    req: RedeemRewardRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.models import Reward, UserBadge
    reward = db.exec(select(Reward).where(Reward.id == req.reward_id)).first()
    if not reward:
        raise HTTPException(404, "Reward not found")
        
    if (current_user.xp or 0) < reward.cost_xp:
        raise HTTPException(400, "Not enough XP to redeem this reward")
        
    # Check if already owned
    existing = db.exec(select(UserBadge).where(UserBadge.user_id == current_user.id, UserBadge.name == reward.name)).first()
    if existing:
        raise HTTPException(400, "You already own this reward")
        
    current_user.xp -= reward.cost_xp
    
    # Save as UserBadge or ActivityLog depending on mapping
    badge = UserBadge(user_id=current_user.id, name=reward.name, description=reward.description, icon="✨")
    db.add(badge)
    
    db.commit()
    return {"message": "Reward redeemed successfully!", "remaining_xp": current_user.xp}


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Return time-series data for the last 30 days of activity."""
    from datetime import datetime, timedelta
    
    # Get logs from the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    logs = db.exec(
        select(ActivityLog).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.created_at >= thirty_days_ago
        )
    ).all()
    
    # Aggregate by day
    daily_stats = {}
    
    # Pre-fill last 30 days with 0s to ensure a continuous chart
    for i in range(29, -1, -1):
        day = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_stats[day] = {"date": day, "xp": 0, "problems": 0, "interviews": 0, "videos": 0}
        
    for log in logs:
        if not log.created_at: 
            continue
        try:
            if isinstance(log.created_at, str):
                from datetime import datetime
                # Handle possible SQLite string dates gracefully
                dt = datetime.fromisoformat(log.created_at.replace("Z", "+00:00"))
                day = dt.strftime("%Y-%m-%d")
            else:
                day = log.created_at.strftime("%Y-%m-%d")
        except Exception:
            continue # Skip invalid dates gracefully
            
        if day in daily_stats:
            daily_stats[day]["xp"] = int(daily_stats[day]["xp"]) + (log.xp_earned or 0)
            if log.action_type == "code_solved":
                daily_stats[day]["problems"] = int(daily_stats[day]["problems"]) + 1
            elif log.action_type == "interview_completed":
                daily_stats[day]["interviews"] = int(daily_stats[day]["interviews"]) + 1
            elif log.action_type == "video_watched":
                daily_stats[day]["videos"] = int(daily_stats[day]["videos"]) + 1
                
    time_series = [daily_stats[k] for k in sorted(daily_stats.keys())]
    
    return {
        "time_series": time_series,
        "total_period_xp": sum(d["xp"] for d in time_series),
        "total_period_problems": sum(d["problems"] for d in time_series),
        "total_period_interviews": sum(d["interviews"] for d in time_series),
        "total_period_videos": sum(d["videos"] for d in time_series),
    }


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.models import SolvedProblem, UserBadge
    from sqlmodel import func

    logs = db.exec(
        select(ActivityLog).where(ActivityLog.user_id == current_user.id)
    ).all()

    problems_solved = db.exec(
        select(SolvedProblem).where(SolvedProblem.user_id == current_user.id)
    ).all()

    badges = db.exec(
        select(UserBadge).where(UserBadge.user_id == current_user.id)
    ).all()

    videos_watched = sum(1 for l in logs if l.action_type == "video_watched")
    reels_watched = sum(1 for l in logs if l.action_type == "reel_watched")
    interviews_done = sum(1 for l in logs if l.action_type == "interview_completed")
    hackathons_joined = sum(1 for l in logs if l.action_type == "hackathon_joined")
    roadmap_steps = sum(1 for l in logs if l.action_type in ("roadmap_step", "roadmap_completed"))

    # Get progress records
    progress_records = db.exec(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    ).all()
    progress_map = {p.category: p.progress_pct for p in progress_records}

    return {
        "streak": current_user.streak or 0,
        "xp": current_user.xp or 0,
        "level": current_user.level or 1,
        "last_activity_date": current_user.last_activity_date,
        "problems_solved": len(problems_solved),
        "videos_watched": videos_watched,
        "reels_watched": reels_watched,
        "interviews_completed": interviews_done,
        "hackathons_joined": hackathons_joined,
        "roadmap_steps": roadmap_steps,
        "progress": progress_map,
        "badges": badges,
    }


import time

_LEADERBOARD_CACHE = None
_LEADERBOARD_CACHE_TIME = 0

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_session),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Returns the top 50 players globally sorted by XP. (Cached 60s)"""
    global _LEADERBOARD_CACHE, _LEADERBOARD_CACHE_TIME
    
    if _LEADERBOARD_CACHE and (time.time() - _LEADERBOARD_CACHE_TIME) < 60:
        data = _LEADERBOARD_CACHE.copy()
        if current_user:
            data["user_context"] = _get_user_leaderboard_context(current_user, db)
        return data

    # Get top 10
    top_users = db.exec(
        select(User).order_by(User.xp.desc()).limit(10)
    ).all()
    
    leaderboard_data = []
    for idx, u in enumerate(top_users):
        # Count solved problems efficiently
        solved_count = db.exec(
            select(func.count(SolvedProblem.id)).where(SolvedProblem.user_id == u.id)
        ).first() or 0
        
        leaderboard_data.append({
            "id": u.id,
            "rank": idx + 1,
            "name": u.name,
            "xp": u.xp or 0,
            "level": u.level or 1,
            "avatar": u.avatar,
            "streak": u.streak or 0,
            "problems_solved": solved_count,
            "is_pro": getattr(u, 'is_pro', False)
        })
    
    _LEADERBOARD_CACHE = { "leaderboard": leaderboard_data }
    _LEADERBOARD_CACHE_TIME = time.time()
    
    data = _LEADERBOARD_CACHE.copy()
    if current_user:
        data["user_context"] = _get_user_leaderboard_context(current_user, db)
    return data


def _get_user_leaderboard_context(user: User, db: Session):
    """Helper to find a specific user's rank/stats in the global leaderboard."""
    from app.models.models import SolvedProblem
    # Count how many users have more XP than this user
    rank = db.exec(
        select(func.count(User.id)).where(User.xp > user.xp)
    ).first() or 0
    
    solved_count = db.exec(
        select(func.count(SolvedProblem.id)).where(SolvedProblem.user_id == user.id)
    ).first() or 0
    
    return {
        "rank": rank + 1,
        "xp": user.xp or 0,
        "streak": user.streak or 0,
        "problems_solved": solved_count,
        "is_pro": getattr(user, 'is_pro', False)
    }

@router.get("/public-feed")
def get_public_feed(
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_session)
):
    """Returns the most recent activities across the whole platform for the live feed."""
    import sqlmodel
    query = select(ActivityLog, User.name).join(User, ActivityLog.user_id == User.id).order_by(ActivityLog.created_at.desc()).limit(limit)
    results = db.exec(query).all()
    
    feed = []
    for log, name in results:
        action_map = {
            "code_solved": "solved a challenge in",
            "video_watched": "watched a masterclass on",
            "interview_completed": "completed an interview for",
            "roadmap_step": "reached a milestone in",
            "hackathon_joined": "registered for",
            "roadmap_completed": "graduated from",
            "course_completed": "earned a certificate in",
            "user_register": "joined the ecosystem",
            "startup_saved": "architected a new startup:",
            "resume_generated": "engineered a new resume",
        }
        
        icon_map = {
            "code_solved": "code",
            "video_watched": "yt",
            "interview_completed": "interview",
            "roadmap_step": "roadmap",
            "hackathon_joined": "hackathon",
            "roadmap_completed": "level",
            "course_completed": "certs",
            "user_register": "startup",
            "startup_saved": "startup",
            "resume_generated": "resume",
        }
        
        feed.append({
            "id": log.id,
            "user": name.split(" ")[0] if name else "Student",
            "action": action_map.get(log.action_type, "is active in"),
            "target": log.title,
            "type": icon_map.get(log.action_type, "default"),
            "time": "Just now" 
        })
        
    return {"feed": feed}
