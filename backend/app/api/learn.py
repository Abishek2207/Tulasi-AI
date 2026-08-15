import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User
from app.core.ai_client import ai_client

router = APIRouter()

class LearnRequest(BaseModel):
    topic: str

class LearnResponse(BaseModel):
    topic: str
    what: str
    why: str
    where: str
    how: str
    practice: str
    build: str
    test: str
    next_steps: str

@router.post("/topic", response_model=LearnResponse)
def generate_learning_plan(
    req: LearnRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    prompt = f"""
    You are an expert tutor designing a structured learning sequence for the topic: "{req.topic}".
    
    You MUST provide the response as a valid JSON object matching the following structure:
    {{
      "what": "Explain WHAT {req.topic} is in simple terms (2-3 sentences).",
      "why": "Explain WHY it matters and its core benefits.",
      "where": "Explain WHERE it is used in the real world (industries/use cases).",
      "how": "Provide a step-by-step guide on HOW to learn it (key concepts in order).",
      "practice": "Suggest WHAT to practice (e.g., LeetCode patterns, exercises).",
      "build": "Suggest WHAT project to build to master this.",
      "test": "Explain HOW the user can test their knowledge (self-assessment).",
      "next_steps": "Suggest WHAT comes next after mastering this."
    }}
    
    Do not output any markdown code blocks, just the JSON string directly.
    """
    
    # We respect the user's preferred model
    force_model = current_user.preferred_model if current_user.preferred_model else "gemini"
    
    try:
        res = ai_client.get_response(message=prompt, force_model=force_model)
        
        # Clean potential markdown from AI output
        clean_json = res.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        
        return LearnResponse(
            topic=req.topic,
            what=data.get("what", "N/A"),
            why=data.get("why", "N/A"),
            where=data.get("where", "N/A"),
            how=data.get("how", "N/A"),
            practice=data.get("practice", "N/A"),
            build=data.get("build", "N/A"),
            test=data.get("test", "N/A"),
            next_steps=data.get("next_steps", "N/A")
        )
    except Exception as e:
        print(f"Learn Mode generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate learning plan. Please try again.")
