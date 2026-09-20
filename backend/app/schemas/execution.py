from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class RoadmapGenerateRequest(BaseModel):
    role_id: int

class RoadmapMilestoneResponse(BaseModel):
    id: int
    roadmap_id: int
    skill_id: Optional[int]
    title: str
    description: Optional[str]
    order_index: int
    status: str
    created_at: datetime
    updated_at: datetime

class UserRoadmapResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    status: str
    created_at: datetime
    updated_at: datetime

class FullRoadmapResponse(BaseModel):
    roadmap: UserRoadmapResponse
    milestones: List[RoadmapMilestoneResponse]

class ActionTaskResponse(BaseModel):
    id: int
    user_id: int
    milestone_id: Optional[int]
    skill_id: Optional[int]
    title: str
    description: Optional[str]
    difficulty: str
    estimated_minutes: int
    status: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

class TaskStatusUpdateRequest(BaseModel):
    status: str # "completed", "skipped", "in_progress", "pending"

class ProjectCreateRequest(BaseModel):
    title: str
    description: str
    project_url: str
    skill_ids: List[int]

class UserProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    project_url: Optional[str]
    status: str
    completion_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

class CareerReadinessResponse(BaseModel):
    score: float
    role_name: Optional[str] = None
    details: List[Dict[str, Any]]
    message: Optional[str] = None
