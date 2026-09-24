from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.ai_router import resilient_ai_response
from app.api.deps import get_current_user
from app.models.models import User
import json

router = APIRouter()

class NegotiatorRequest(BaseModel):
    scenario: str
    draft: str

@router.post("/evaluate")
def evaluate_negotiation(
    data: NegotiatorRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    if not data.draft or not data.draft.strip():
        raise HTTPException(status_code=400, detail="Missing negotiation draft")

    prompt = f"""You are an expert Tech Salary Negotiator.

The user is dealing with this negotiation scenario: "{data.scenario}"

Their draft response to the recruiter/hiring manager is:
"{data.draft}"

Analyze the draft for leverage utilization, professionalism, and likelihood of success.
Respond ONLY with a valid JSON object in this exact format:
{{
  "leverage": "brief assessment of how well they used their leverage/position",
  "professionalism": "brief assessment of tone (collaborative vs combative)",
  "score": 85,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}}"""

    fallback = {
        "leverage": "Pending Analysis",
        "professionalism": "Pending Analysis",
        "score": 50,
        "suggestions": ["AI Engine is currently in safe-mode.", "Please try again later."],
        "verdict": "Could not fully evaluate this draft."
    }

    result = resilient_ai_response(prompt)
    
    return result
