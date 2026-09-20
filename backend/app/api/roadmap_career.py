from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Profile, Goal, LearningPlan, DailyTask
from app.schemas.user import StudentRoadmapRequest
from app.agents.roadmap_generator import generate_personalized_roadmap
import json
from datetime import datetime, timezone, timedelta

router = APIRouter()

@router.post("/generate")
async def generate_career_roadmap(
    req: StudentRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates a REAL personalized learning roadmap using the Model Gateway."""
    try:
        profile = db.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
        if not profile:
            raise HTTPException(status_code=400, detail="Profile is required to generate a roadmap.")

        # Ensure Goal exists or create one based on Profile
        goal = db.exec(select(Goal).where(Goal.user_id == current_user.id, Goal.status == "active")).first()
        if not goal:
            goal = Goal(
                user_id=current_user.id,
                goal=profile.student_goal or "Upskill",
                target_role=(profile.profile.target_role if getattr(profile, "profile", None) else '') or req.focus or "Software Engineer",
                daily_minutes=req.hours_per_day * 60,
                target_companies=req.target_company
            )
            db.add(goal)
            db.commit()
            db.refresh(goal)

        # Call the AI generator
        roadmap_data = generate_personalized_roadmap(db, current_user.id, goal, profile)

        # Store the roadmap into LearningPlan and DailyTasks
        plan = LearningPlan(
            user_id=current_user.id,
            title=f"Roadmap to {(goal.profile.target_role if getattr(goal, 'profile', None) else '')}",
            target_role=(goal.profile.target_role if getattr(goal, 'profile', None) else ''),
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        base_date = datetime.now(timezone.utc)
        for t in roadmap_data.daily_tasks:
            task = DailyTask(
                user_id=current_user.id,
                learning_plan_id=plan.id,
                date_assigned=(base_date + timedelta(days=t.day)).strftime("%Y-%m-%d"),
                title=t.title,
                description=t.description,
                task_type=t.task_type,
                estimated_minutes=t.estimated_minutes
            )
            db.add(task)
        
        db.commit()

        return {
            "success": True,
            "roadmap_id": plan.id,
            "goal": roadmap_data.goal,
            "current_level": roadmap_data.current_level,
            "priority_skills": roadmap_data.priority_skills,
            "ai_note": "Real Roadmap generated successfully.",
            "tasks": [t.dict() for t in roadmap_data.daily_tasks]
        }
    except Exception as e:
        print(f"Roadmap Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending-skills")
async def get_trending_skills():
    """Return trending industry skills."""
    return {
        "skills": [
            {"name": "Generative AI / LLMs", "growth": "+142%", "demand": "critical", "color": "#8B5CF6"},
            {"name": "Kubernetes & DevOps", "growth": "+68%", "demand": "high", "color": "#06B6D4"},
            {"name": "System Design", "growth": "+55%", "demand": "high", "color": "#F59E0B"},
            {"name": "Cloud Security", "growth": "+45%", "demand": "high", "color": "#EF4444"},
            {"name": "Data Engineering", "growth": "+42%", "demand": "medium", "color": "#10B981"}
        ]
    }

@router.get("/")
async def get_my_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.exec(select(LearningPlan).where(LearningPlan.user_id == current_user.id).order_by(LearningPlan.id.desc())).first()
    if not plan:
        return {"roadmaps": [], "completed_milestones": []}
    
    tasks = db.exec(select(DailyTask).where(DailyTask.learning_plan_id == plan.id).order_by(DailyTask.date_assigned)).all()
    
    # We will map DailyTask to the frontend Roadmap/Milestone structure
    milestones = []
    for t in tasks:
        milestones.append({
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "type": t.task_type,
            "status": t.status,
            "estimated_minutes": t.estimated_minutes
        })
    
    roadmap = {
        "id": str(plan.id),
        "title": plan.title,
        "target_role": (plan.profile.target_role if getattr(plan, "profile", None) else ''),
        "milestones": milestones
    }
    
    return {
        "roadmaps": [roadmap],
        "completed_milestones": [str(t.id) for t in tasks if t.status == "completed"]
    }

@router.get("/{id}")
async def get_single_roadmap(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.exec(select(LearningPlan).where(LearningPlan.id == id, LearningPlan.user_id == current_user.id)).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Roadmap not found")
        
    tasks = db.exec(select(DailyTask).where(DailyTask.learning_plan_id == plan.id).order_by(DailyTask.date_assigned)).all()
    milestones = []
    for t in tasks:
        milestones.append({
            "id": str(t.id),
            "title": t.title,
            "description": t.description,
            "type": t.task_type,
            "status": t.status,
            "estimated_minutes": t.estimated_minutes
        })
        
    return {
        "id": str(plan.id),
        "title": plan.title,
        "target_role": (plan.profile.target_role if getattr(plan, "profile", None) else ''),
        "milestones": milestones
    }

from pydantic import BaseModel

class ProgressRequest(BaseModel):
    roadmap_id: str
    milestone_id: str

@router.post("/progress")
async def log_progress(
    req: ProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.exec(select(DailyTask).where(DailyTask.id == int(req.milestone_id), DailyTask.user_id == current_user.id)).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.status = "completed"
    
    completion = TaskCompletion(
        task_id=task.id,
        user_id=current_user.id,
        time_spent_minutes=task.estimated_minutes
    )
    db.add(completion)
    db.add(task)
    db.commit()
    
    return {"message": "Progress logged successfully", "xp_earned": 50}

