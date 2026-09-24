from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from typing import Any, Optional, List

from app.core.config import settings
from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User
from sqlmodel import Session
from app.core.ai_router import resilient_ai_response

router = APIRouter()

class ProjectBlueprintRequest(BaseModel):
    role: str
    level: str

@router.post("/generate")
def generate_project_blueprint(
    req: ProjectBlueprintRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    prompt = f"""You are an elite Staff Engineer architecting a complex, portfolio-worthy project.
The user wants to build a project for a "{req.role}" role at a "{req.level}" skill level.
The project should be unique and highly technical, avoiding cliché ideas.

Output strictly as a valid JSON object matching this exact schema:
{{
  "title": "Project Name: Subtitle",
  "problem": "The complex engineering problem this project solves.",
  "pitch": "A 30-second elevator pitch describing the project and its value.",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "stack": [
    {{ "category": "Category Name", "tools": ["Tool 1", "Tool 2"] }}
  ],
  "architecture": "A brief description of the architecture and data flow.",
  "schema": [
    {{ "table": "Table Name", "fields": ["field1 (Type)", "field2 (Type)"] }}
  ],
  "github": "A simple text representation of the expected GitHub repository structure.",
  "buildPlan": [
    {{ "phase": "Phase Name", "tasks": ["Task 1", "Task 2"] }}
  ],
  "resumeTips": [
    "A strong resume bullet point highlighting the technical achievement."
  ]
}}

Return ONLY raw JSON, nothing else."""

        
    project_data = resilient_ai_response(prompt)
    
    return {"success": True, "blueprint": project_data}
