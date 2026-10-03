import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.api.deps import get_current_user
from app.models.models import User
from app.core.ai_router import resilient_ai_response

router = APIRouter()

class PresentationMetrics(BaseModel):
    duration_seconds: float
    eye_contact_percentage: float
    posture_score: float
    gesture_activity: float
    speaking_percentage: float
    pause_frequency: float

class PresentationCoachRequest(BaseModel):
    transcript: str
    metrics: PresentationMetrics

@router.post("/evaluate")
async def evaluate_presentation(req: PresentationCoachRequest, current_user: User = Depends(get_current_user)):
    prompt = f"""
You are an expert Presentation & Public Speaking Coach.

The user has just completed a presentation.

Their spoken transcript:
"{req.transcript if req.transcript else '[No speech detected]'}"

Their physical delivery metrics based on real-time computer vision and audio analysis:
- Presentation Duration: {req.metrics.duration_seconds:.1f} seconds
- Eye Contact (looking at camera): {req.metrics.eye_contact_percentage:.1f}%
- Posture Score (0-100): {req.metrics.posture_score:.1f}
- Gesture Activity (0-100): {req.metrics.gesture_activity:.1f}
- Speaking Time Percentage: {req.metrics.speaking_percentage:.1f}%
- Pause/Silence Frequency: {req.metrics.pause_frequency:.1f} pauses per minute

Analyze their content delivery and physical presence.
Respond ONLY with a valid JSON object in this exact format:
{{
  "eye_contact_feedback": "Specific feedback on their eye contact.",
  "posture_feedback": "Specific feedback on their posture.",
  "gesture_feedback": "Specific feedback on their hand movements.",
  "vocal_feedback": "Specific feedback on their speaking pace and pauses.",
  "content_feedback": "Brief assessment of what they actually said.",
  "overall_score": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "areas_for_improvement": ["improvement 1", "improvement 2"]
}}
"""

    try:
        response_data = await resilient_ai_response(
            prompt=prompt,
            system_prompt="You are a strict JSON API. Output only valid JSON.",
            preferred_model="gemini-2.5-flash"
        )
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
