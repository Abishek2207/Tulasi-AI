from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from typing import Any
from functools import lru_cache

from app.core.config import settings
from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, Roadmap, RoadmapStep, ActivityLog, UserProgress
from sqlmodel import Session, select
from app.api.roadmap_data import ROADMAPS
from app.api.activity import log_activity_internal
from app.core.ai_router import get_ai_response

router = APIRouter()

class RoadmapRequest(BaseModel):
    goal: str

class MilestoneProgressRequest(BaseModel):
    roadmap_id: str
    milestone_id: str




@router.post("/generate")
def generate_roadmap(
    req: RoadmapRequest, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    prompt = f"""You are an elite career technical advisor. A student wants to become a "{req.goal}". 
Create a detailed, step-by-step learning roadmap divided into exactly 5 logical phases/milestones.

Output strictly as a valid JSON object matching this exact schema:
{{
  "title": "Roadmap to {req.goal}",
  "description": "A 2-sentence highly motivating hook.",
  "estimated_months": 6,
  "milestones": [
    {{
      "phase": "1",
      "title": "Name of Phase",
      "duration": "e.g. Weeks 1-4",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "project_idea": "A small project to cement learning for this phase",
      "resources": [
        {{"name": "Course Title", "url": "https://youtube.com/something"}},
        {{"name": "Official Docs", "url": "https://..."}}
      ]
    }}
  ]
}}

Return ONLY raw JSON, nothing else."""

    try:
        response_str = get_ai_response(prompt, force_model="complex_reasoning")
        import re
        match = re.search(r'\{.*\}', response_str, re.DOTALL)
        if match:
            response_str = match.group()
        
        roadmap_data = json.loads(response_str)
        
        # Save to DB
        new_roadmap = Roadmap(
            user_id=current_user.id,
            goal=req.goal,
            title=roadmap_data.get("title", f"Roadmap for {req.goal}"),
            description=roadmap_data.get("description", ""),
            estimated_months=roadmap_data.get("estimated_months", 6)
        )
        session.add(new_roadmap)
        session.commit()
        session.refresh(new_roadmap)
        
        # Save steps
        for m in roadmap_data.get("milestones", []):
            step = RoadmapStep(
                roadmap_id=new_roadmap.id,
                phase=str(m.get("phase", "")),
                title=m.get("title", ""),
                duration=m.get("duration", ""),
                topics_json=json.dumps(m.get("topics", [])),
                project_idea=m.get("project_idea", ""),
                resources_json=json.dumps(m.get("resources", []))
            )
            session.add(step)
        
        session.commit()
        
        return {"roadmap": roadmap_data, "id": new_roadmap.id}
    except json.JSONDecodeError:
        raise HTTPException(500, "AI failed to generate valid JSON format.")
    except Exception as e:
        session.rollback()
        raise HTTPException(500, f"Error generating roadmap: {str(e)}")

@router.get("/")
def get_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    # Fetch user's completed milestones
    completed_logs = db.exec(
        select(ActivityLog).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action_type == "roadmap_step"
        )
    ).all()
    completed = [log.metadata_json for log in completed_logs if log.metadata_json]

    return {
        "roadmaps": ROADMAPS,
        "completed_milestones": completed
    }

@lru_cache(maxsize=32)
def _get_static_roadmap(id: str):
    return next((r for r in ROADMAPS if r["id"] == id), None)

@router.get("/{id}")
def get_roadmap(id: str, current_user: User = Depends(get_current_user)):
    roadmap = _get_static_roadmap(id)
    if not roadmap:
        raise HTTPException(404, "Roadmap not found")
    return roadmap

@router.post("/progress")
def log_progress(
    req: MilestoneProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    roadmap = next((r for r in ROADMAPS if r["id"] == req.roadmap_id), None)
    if not roadmap:
        raise HTTPException(404, "Roadmap not found")
    
    milestone = next((m for m in roadmap["milestones"] if m["id"] == req.milestone_id), None)
    if not milestone:
        raise HTTPException(404, "Milestone not found")

    # Check if already logged
    query = select(ActivityLog).where(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action_type == "roadmap_step",
        ActivityLog.metadata_json == req.milestone_id
    )
    result = db.exec(query)
    existing_log = result.first()

    if existing_log:
        return {"message": "Milestone already completed"}

    # Use centralized activity logging
    log_activity_internal(
        current_user, db, "roadmap_step", 
        f"Completed {roadmap['title']} milestone: {milestone['name']}",
        req.milestone_id
    )

    # Check if roadmap is fully completed (count existing logs + this new one)
    existing_milestones = db.exec(
        select(ActivityLog).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action_type == "roadmap_step",
            ActivityLog.title.like(f"%{roadmap['title']}%")
        )
    ).all()
    
    if len(existing_milestones) >= len(roadmap["milestones"]):
        log_activity_internal(
            current_user, db, "roadmap_completed",
            f"Completed Roadmap: {roadmap['title']}",
            req.roadmap_id
        )
    
    db.commit()

    return {"message": "Progress saved", "xp_earned": 30}
