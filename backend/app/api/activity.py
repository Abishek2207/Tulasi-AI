from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User, ActivityLog, UserProgress

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
    if last and (date.today() - date.fromisoformat(last)).days == 1:
        user.streak = (user.streak or 0) + 1
    elif not last or (date.today() - date.fromisoformat(last)).days > 1:
        user.streak = 1  # reset or start

    user.last_activity_date = today
    db.add(user)


def _update_progress(user_id: int, category: str, db: Session, total: int):
    """Recalculate progress_pct for a category based on solved count."""
    prog = db.exec(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.category == category
        )
    ).first()

    # Count completed items for this category
    from app.models.models import SolvedProblem, ActivityLog as AL
    if category == "coding":
        from sqlmodel import func
        count = db.exec(
            select(SolvedProblem).where(SolvedProblem.user_id == user_id)
        ).all()
        completed = len(count)
    elif category == "interview":
        completed = len(db.exec(
            select(AL).where(AL.user_id == user_id, AL.action_type == "interview_completed")
        ).all())
    elif category == "videos":
        completed = len(db.exec(
            select(AL).where(AL.user_id == user_id, AL.action_type == "video_watched")
        ).all())
    else:
        completed = len(db.exec(
            select(AL).where(AL.user_id == user_id, AL.action_type == "roadmap_step")
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


@router.post("/log")
def log_activity(
    req: LogActivityRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if req.action_type not in XP_TABLE:
        raise HTTPException(400, f"Unknown action_type: {req.action_type}")

    xp = XP_TABLE[req.action_type]

    log_entry = ActivityLog(
        user_id=current_user.id,
        action_type=req.action_type,
        title=req.title,
        metadata_json=req.metadata_json,
        xp_earned=xp,
    )
    db.add(log_entry)

    # Update XP on user
    current_user.xp = (current_user.xp or 0) + xp

    # Level up every 500 XP
    current_user.level = max(1, (current_user.xp or 0) // 500 + 1)

    # Update streak
    _update_streak(current_user, db)

    db.commit()
    db.refresh(log_entry)

    return {
        "success": True,
        "xp_earned": xp,
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


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.models import SolvedProblem
    from sqlmodel import func

    logs = db.exec(
        select(ActivityLog).where(ActivityLog.user_id == current_user.id)
    ).all()

    problems_solved = db.exec(
        select(SolvedProblem).where(SolvedProblem.user_id == current_user.id)
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
    }
