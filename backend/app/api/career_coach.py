import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.deps import get_current_user
from app.models.models import User
from app.core.ai_router import resilient_ai_response

router = APIRouter()

class CoachRequest(BaseModel):
    agent_type: str # "system_design", "leadership", "communication", "promotion"
    scenario: str
    user_response: str

@router.post("/evaluate")
async def evaluate_coach(req: CoachRequest, current_user: User = Depends(get_current_user)):
    if req.agent_type == "system_design":
        prompt = f"""
You are an expert Staff/Principal Software Engineer conducting a System Design interview.

The candidate was given this prompt: "{req.scenario}"
Their proposed design/answer:
"{req.user_response}"

Respond ONLY with a valid JSON object in this exact format:
{{
  "architecture": "brief assessment of components and flow",
  "scalability": "brief assessment of bottlenecks and scaling approach",
  "score": <number 0-100>,
  "improvements": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}}
"""
    elif req.agent_type == "leadership":
        prompt = f"""
You are an expert Engineering Manager Coach.

The user was given this management scenario: "{req.scenario}"
Their response/handling is:
"{req.user_response}"

Analyze for empathy, leadership effectiveness, and practical outcome.
Respond ONLY with a valid JSON object in this exact format:
{{
  "empathy": "brief assessment of emotional intelligence and team care",
  "effectiveness": "brief assessment of problem resolution and stakeholder management",
  "score": <number 0-100 representing leadership quality>,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}}
"""
    elif req.agent_type == "communication":
        prompt = f"""
You are an expert Corporate Communications Coach.

The user is dealing with this workplace scenario: "{req.scenario}"
Their draft response/handling is:
"{req.user_response}"

Analyze the draft for tone, clarity, and professionalism.
Respond ONLY with a valid JSON object in this exact format:
{{
  "tone": "brief assessment of emotional tone and perception",
  "clarity": "brief assessment of conciseness and message delivery",
  "score": <number 0-100 representing communication quality>,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}}
"""
    elif req.agent_type == "promotion":
        prompt = f"""
You are an expert Staff Engineer Promotion Strategist.

The user's scenario/achievement: "{req.scenario}"
Their pitch/writeup is:
"{req.user_response}"

Analyze for impact, scope, and leadership signal.
Respond ONLY with a valid JSON object in this exact format:
{{
  "impact": "brief assessment of business/technical impact framing",
  "scope": "brief assessment of cross-team/org scope",
  "score": <number 0-100 representing promotion readiness/strength>,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "verdict": "one sentence overall assessment"
}}
"""
    else:
        raise HTTPException(status_code=400, detail="Invalid agent_type")

    try:
        # Use our secure resilient_ai_response wrapper
        response_data = await resilient_ai_response(
            prompt=prompt,
            system_prompt="You are a strict JSON API. Output only valid JSON.",
            preferred_model="gemini-2.5-flash"
        )
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
