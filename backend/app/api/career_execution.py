from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.execution import (
    RoadmapGenerateRequest,
    FullRoadmapResponse,
    ActionTaskResponse,
    TaskStatusUpdateRequest,
    ProjectCreateRequest,
    UserProjectResponse,
    CareerReadinessResponse
)
from app.services.execution_service import ExecutionService
from app.services.project_service import ProjectService
from app.services.career_readiness_service import CareerReadinessService

router = APIRouter()

# ── Roadmaps ─────────────────────────────────────────────────────────────

@router.post("/roadmap", response_model=FullRoadmapResponse, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    req: RoadmapGenerateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        ExecutionService.generate_roadmap(db, current_user.id, req.role_id)
        data = ExecutionService.get_roadmap(db, current_user.id)
        if not data:
            raise HTTPException(status_code=404, detail="Failed to generate roadmap")
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/roadmap", response_model=FullRoadmapResponse)
def get_roadmap(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    data = ExecutionService.get_roadmap(db, current_user.id)
    if not data:
        raise HTTPException(status_code=404, detail="No active roadmap found")
    return data


# ── Action Tasks ─────────────────────────────────────────────────────────

@router.get("/tasks", response_model=List[ActionTaskResponse])
def get_tasks(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tasks = ExecutionService.generate_daily_tasks(db, current_user.id)
    return tasks

@router.patch("/tasks/{task_id}", response_model=ActionTaskResponse)
def update_task_status(
    task_id: int,
    req: TaskStatusUpdateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if req.status == 'completed':
        try:
            return ExecutionService.complete_task(db, current_user.id, task_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    else:
        # For other statuses like 'skipped' or 'in_progress'
        from app.models.models import ActionTask
        from sqlmodel import select
        task = db.exec(select(ActionTask).where(ActionTask.id == task_id, ActionTask.user_id == current_user.id)).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        task.status = req.status
        db.commit()
        db.refresh(task)
        return task


# ── Projects ─────────────────────────────────────────────────────────────

@router.post("/projects", response_model=UserProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProjectCreateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return ProjectService.create_project(
        db, 
        current_user.id, 
        req.title, 
        req.description, 
        req.project_url, 
        req.skill_ids
    )

@router.get("/projects", response_model=List[UserProjectResponse])
def get_projects(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return ProjectService.get_user_projects(db, current_user.id)

@router.patch("/projects/{project_id}/complete", response_model=UserProjectResponse)
def complete_project(
    project_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        return ProjectService.complete_project(db, current_user.id, project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Career Readiness ─────────────────────────────────────────────────────

@router.get("/readiness/{role_id}", response_model=CareerReadinessResponse)
def get_readiness(
    role_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    try:
        return CareerReadinessService.calculate_readiness(db, current_user.id, role_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
