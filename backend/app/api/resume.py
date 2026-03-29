from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.core.ai_router import get_ai_response
from app.core.database import get_session
from sqlmodel import Session, select
from app.models.models import SavedResume, User
from app.api.deps import get_current_user
from app.api.activity import log_activity_internal
import json
import re

router = APIRouter()

class ImproveRequest(BaseModel):
    resume_text: str
    job_description: str
    mode: str = "ATS-Optimized"
    document_type: str = "Resume"

@router.post("/improve")
def improve_resume(
    data: ImproveRequest, 
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not data.resume_text.strip() or not data.job_description.strip():
        raise HTTPException(status_code=400, detail="Missing resume text or job description")

    # Map the requested mode to specific persona instructions
    mode_instructions = {
        "Professional": "Focus on highly professional, corporate language. Emphasize polished execution, robust leadership, and executive presence. Make it sound formal and confident.",
        "Creative": "Use a dynamic, modern, and creative tone. Emphasize out-of-the-box thinking, design aesthetics, and innovative problem-solving suitable for marketing or design roles.",
        "ATS-Optimized": "Prioritize strict keyword matching against the job description. Use standard conventional formatting, direct action verbs, and ensure zero fluff so that robotic ATS parsers rank it exactly 100/100."
    }
    
    selected_instruction = mode_instructions.get(data.mode, mode_instructions["ATS-Optimized"])

    if data.document_type == "Cover Letter":
        prompt = f"""You are an elite Tech Recruiter and Expert Copywriter.
    
Analyze this resume against the target job description. Generate a highly personalized, compelling COVER LETTER that aligns with the following stylistic tone:
[TONE RULE]: {selected_instruction}

[STRICT QUALITY RULES]:
1. Format properly as a standard Cover Letter with narrative paragraphs.
2. Introduce the candidate compellingly, explicitly connect their past experience to the target Job Description, and close strongly.
3. EXPLICITLY BAN generic buzzwords such as "hardworking", "team player", "detail-oriented", or "synergy".
4. Ensure zero fluff. Every sentence must justify candidate value.

Extract missing keywords that the candidate should add, calculate a match score (0-100) of how well their experience fits the JD, evaluate readability and keyword match percentage, and give actionable feedback.

TARGET JOB DESCRIPTION:
{data.job_description}

CURRENT RESUME:
{data.resume_text}

Respond STRICTLY in this JSON format (no markdown code blocks, no other text):
{{
  "ats_score": 85,
  "readability_score": 90,
  "keyword_match_percent": 75,
  "feedback": ["Great match for leadership", "Highlighted AWS perfectly"],
  "missing_keywords": ["Python", "Agile"],
  "improved_resume": "YOUR GENERATED COVER LETTER TEXT HERE"
}}"""
    else:
        prompt = f"""You are an elite Tech Recruiter and ATS Optimization Expert.
    
Analyze this resume against the target job description. Generate a highly optimized, fully rewritten version of the resume that aligns with the following stylistic tone:
[TONE RULE]: {selected_instruction}

[STRICT QUALITY RULES]:
1. Structure the rewritten resume explicitly into four sections: SUMMARY, EXPERIENCE, SKILLS, and PROJECTS.
2. Use strong action verbs and enforce measurable, quantifiable impact (numbers, metrics, percentages).
3. EXPLICITLY BAN generic buzzwords such as "hardworking", "team player", "detail-oriented", or "synergy".
4. Ensure zero fluff. Every word must justify candidate value.

Extract missing keywords, calculate a match score (0-100), evaluate readability and keyword match percentage, and give actionable feedback.

TARGET JOB DESCRIPTION:
{data.job_description}

CURRENT RESUME:
{data.resume_text}

Respond STRICTLY in this JSON format (no markdown code blocks, no other text):
{{
  "ats_score": 85,
  "readability_score": 90,
  "keyword_match_percent": 75,
  "feedback": ["Use stronger action verbs", "Quantify revenue impact by adding exact percentages", "Removed generic phrase 'team player'"],
  "missing_keywords": ["Python", "AWS", "Agile"],
  "improved_resume": "YOUR FULLY REWRITTEN AND STRUCTURED RESUME TEXT HERE... (with SUMMARY, EXPERIENCE, SKILLS, PROJECTS)"
}}"""

    response_text = get_ai_response(prompt)
    
    # Try to parse JSON from the AI response
    try:
        import json, re
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            result = json.loads(match.group())
            # ── 💾 Auto-Save to Database ──
            try:
                saved = SavedResume(
                    user_id=current_user.id,
                    document_type=data.document_type,
                    mode=data.mode,
                    original_resume=data.resume_text,
                    job_description=data.job_description,
                    improved_resume=result.get("improved_resume", ""),
                    ats_score=result.get("ats_score", 0),
                    readability_score=result.get("readability_score", 0),
                    keyword_match_percent=result.get("keyword_match_percent", 0),
                    feedback_json=json.dumps(result.get("feedback", [])),
                    missing_keywords_json=json.dumps(result.get("missing_keywords", []))
                )
                db.add(saved)
                db.commit()

                log_activity_internal(current_user, db, "resume_generated", f"Generated {data.document_type} (score: {result.get('ats_score', 0)})")
                db.commit()
            except Exception as e:
                print(f"Failed to save resume to history: {e}")

            return {
                "ats_score": result.get("ats_score", 50),
                "readability_score": result.get("readability_score", 0),
                "keyword_match_percent": result.get("keyword_match_percent", 0),
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

@router.get("/history")
def get_resume_history(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(SavedResume).where(SavedResume.user_id == current_user.id).order_by(SavedResume.created_at.desc())
    results = db.exec(statement).all()
    
    # Convert JSON strings back to lists
    history = []
    for r in results:
        history.append({
            "id": r.id,
            "document_type": r.document_type,
            "mode": r.mode,
            "original_resume": r.original_resume,
            "job_description": r.job_description,
            "improved_resume": r.improved_resume,
            "ats_score": r.ats_score,
            "readability_score": r.readability_score,
            "keyword_match_percent": r.keyword_match_percent,
            "feedback": json.loads(r.feedback_json),
            "missing_keywords": json.loads(r.missing_keywords_json),
            "created_at": r.created_at.isoformat()
        })
    return history

