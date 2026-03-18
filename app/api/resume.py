from fastapi import APIRouter
from pydantic import BaseModel
from app.core.ai_router import get_ai_response

router = APIRouter()

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.core.ai_router import get_ai_response

router = APIRouter()

class ImproveRequest(BaseModel):
    resume_text: str
    job_description: str

@router.post("/improve")
def improve_resume(data: ImproveRequest):
    if not data.resume_text.strip() or not data.job_description.strip():
        raise HTTPException(status_code=400, detail="Missing resume text or job description")

    prompt = f"""You are an elite Tech Recruiter and ATS Optimization Expert.
    
Analyze this resume against the target job description. Generate a highly optimized, fully rewritten version of the resume that bypasses ATS filters while remaining truthful. Extract missing keywords, calculate a match score (0-100), and give actionable feedback.

TARGET JOB DESCRIPTION:
{data.job_description}

CURRENT RESUME:
{data.resume_text}

Respond STRICTLY in this JSON format (no markdown code blocks, no other text):
{{
  "ats_score": 85,
  "feedback": ["Use stronger action verbs", "Quantify revenue impact"],
  "missing_keywords": ["Python", "AWS", "Agile"],
  "improved_resume": "YOUR FULLY REWRITTEN AND WELL-FORMATTED RESUME TEXT HERE. Use neat bullet points, strong action verbs, and quantifiable metrics where appropriate."
}}"""

    response_text = get_ai_response(prompt, force_model="gemini-2.5-flash")
    
    # Try to parse JSON from the AI response
    try:
        import json, re
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            result = json.loads(match.group())
            return {
                "ats_score": result.get("ats_score", 50),
                "feedback": result.get("feedback", ["Consider adding more metrics."]),
                "missing_keywords": result.get("missing_keywords", []),
                "improved_resume": result.get("improved_resume", data.resume_text),
            }
    except Exception as e:
        print(f"JSON Parsing error in resume analysis: {e}")
        
    # Fallback response if the AI fails or returns malformed text
    return {
        "ats_score": 55,
        "feedback": ["The AI encountered an error returning feedback. Please try formatting your resume text more clearly.", "Ensure your API key is correctly configured."],
        "missing_keywords": ["Error parsing keywords"],
        "improved_resume": data.resume_text
    }
