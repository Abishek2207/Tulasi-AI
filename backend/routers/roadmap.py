from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/roadmap", tags=["Learning Roadmap"])

class RoadmapRequest(BaseModel):
    goal: str
    timeline: Optional[str] = "3 months"
    experience: Optional[str] = "Beginner"

class RoadmapStep(BaseModel):
    id: int
    title: str
    description: str
    duration: str
    resources: List[str]

@router.post("/generate", response_model=List[RoadmapStep])
async def generate_roadmap(request: RoadmapRequest):
    # Logic to generate a personalized AI roadmap
    return [
        RoadmapStep(id=1, title=f"Fundamentals of {request.goal}", description="Core concepts and setup.", duration="2 weeks", resources=["Official Docs", "Youtube"]),
        RoadmapStep(id=2, title="Advanced Topics", description="Deep dive into the architecture.", duration="4 weeks", resources=["MDN", "Coursera"])
    ]

@router.get("/user/{user_id}")
async def get_user_roadmap(user_id: str):
    return {"status": "active", "progress": 65, "goal": "Full Stack Development"}
