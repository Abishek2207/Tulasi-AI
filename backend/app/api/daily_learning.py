from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import json

from app.core.database import get_session
from app.models.models import User, CareerIntelligenceProfile, CareerIntelligenceRoadmap, LearningPlan, DailyTask, TaskCompletion, LearningSession
from app.api.deps import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/daily-learning", tags=["daily_learning"])

class TaskCompleteRequest(BaseModel):
    difficulty_rating: int = 3
    notes: Optional[str] = None
    time_spent_minutes: int = 0
    was_adapted: bool = False

@router.get("/today")
def get_daily_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    profile = db.exec(
        select(CareerIntelligenceProfile).where(CareerIntelligenceProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Career Intelligence Profile not found")
        
    roadmap = db.exec(
        select(CareerIntelligenceRoadmap).where(CareerIntelligenceRoadmap.user_id == current_user.id)
    ).first()
    
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if there are any incomplete tasks from the past that were not adapted
    past_incomplete = db.exec(
        select(DailyTask).where(
            DailyTask.user_id == current_user.id,
            DailyTask.status == "pending",
            DailyTask.date_assigned < today_str
        )
    ).all()

    adaptation_prompt = None
    if past_incomplete:
        # We need to adapt
        adaptation_prompt = f"You missed {len(past_incomplete)} tasks previously. Would you like to carry them over or reschedule?"
        for task in past_incomplete:
            task.status = "incomplete"
            db.add(task)
        db.commit()

    # Get today's tasks
    today_tasks = db.exec(
        select(DailyTask).where(
            DailyTask.user_id == current_user.id,
            DailyTask.date_assigned == today_str
        )
    ).all()
    
    # If no tasks for today, generate them based on the roadmap
    if not today_tasks and roadmap and roadmap.roadmap_data:
        try:
            roadmap_json = json.loads(roadmap.roadmap_data)
            task = DailyTask(
                user_id=current_user.id,
                date_assigned=today_str,
                title="Continue Roadmap Plan",
                description="Follow the next steps in your personalized AI roadmap.",
                task_type="learn",
                estimated_minutes=profile.daily_time_minutes,
                status="pending"
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            today_tasks = [task]
        except Exception as e:
            print("Error generating daily task:", e)
    
    return {
        "success": True,
        "date": today_str,
        "daily_time_minutes": profile.daily_time_minutes,
        "adaptation_prompt": adaptation_prompt,
        "tasks": today_tasks
    }

@router.post("/task/{task_id}/complete")
def complete_task(
    task_id: int,
    req: TaskCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    task = db.exec(
        select(DailyTask).where(DailyTask.id == task_id, DailyTask.user_id == current_user.id)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.status = "completed"
    
    completion = TaskCompletion(
        task_id=task.id,
        user_id=current_user.id,
        time_spent_minutes=req.time_spent_minutes,
        difficulty_rating=req.difficulty_rating,
        notes=req.notes,
        was_adapted=req.was_adapted
    )
    
    db.add(task)
    db.add(completion)
    db.commit()
    
    return {"success": True, "message": "Task completed"}

@router.post("/session/start")
def start_session(
    task_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    session = LearningSession(
        user_id=current_user.id,
        task_id=task_id,
        status="active"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"success": True, "session_id": session.id}
