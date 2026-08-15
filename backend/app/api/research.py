import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User
from app.core.ai_client import ai_client

router = APIRouter()

# --- Models for Deep Research ---

class DeepResearchRequest(BaseModel):
    question: str

class Source(BaseModel):
    title: str
    url: str
    date: str
    key_finding: str

class DeepResearchResponse(BaseModel):
    sources: List[Source]
    confidence_score: int
    synthesis: str
    summary: str

# --- Models for Career Research ---

class CareerResearchRequest(BaseModel):
    target_role: str
    target_package: str

class CareerResearchResponse(BaseModel):
    current_gap: str
    priority_skills: List[str]
    projects: List[str]
    certifications: List[str]
    interview_areas: List[str]
    weekly_plan: str

# --- Endpoints ---

@router.post("/deep", response_model=DeepResearchResponse)
def run_deep_research(
    req: DeepResearchRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    prompt = f"""
    You are an elite deep research engine. The user has asked: "{req.question}"
    
    You must simulate a full research pipeline: planning -> discovery -> evaluation -> synthesis.
    
    Return your response strictly as a JSON object matching this structure:
    {{
      "sources": [
        {{
          "title": "Name of the source or article",
          "url": "https://example.com/actual-or-highly-plausible-link",
          "date": "Month Year",
          "key_finding": "What this source contributes"
        }}
      ],
      "confidence_score": 85, // 0-100 based on data availability
      "synthesis": "The detailed, cited answer to the user's question, referencing [Source 1] etc.",
      "summary": "A 1-2 sentence TLDR."
    }}
    
    Ensure you provide at least 3 distinct, highly reliable sources. Do NOT hallucinate absurd URLs.
    Do not output markdown code blocks. Just output the JSON directly.
    """
    force_model = current_user.preferred_model if current_user.preferred_model else "gemini"
    
    try:
        res = ai_client.get_response(message=prompt, force_model=force_model)
        clean_json = res.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        return DeepResearchResponse(**data)
    except Exception as e:
        print(f"Deep Research failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to synthesize research.")


@router.post("/career", response_model=CareerResearchResponse)
def run_career_research(
    req: CareerResearchRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Prepare current context
    current_exp = current_user.current_experience or "Fresher / No experience defined"
    current_skills = current_user.skills or "No skills defined"
    
    prompt = f"""
    You are a Career GPS expert. The user wants to reach:
    - Target Role: {req.target_role}
    - Target Package: {req.target_package}
    
    Their current profile is:
    - Experience: {current_exp}
    - Skills: {current_skills}
    
    Provide a realistic, advisory gap analysis and action plan. Never guarantee salary or job outcomes.
    
    Return your response strictly as a JSON object matching this structure:
    {{
      "current_gap": "A paragraph explaining the delta between their current profile and the target role/package.",
      "priority_skills": ["Skill 1", "Skill 2"],
      "projects": ["Project 1 Idea", "Project 2 Idea"],
      "certifications": ["Cert 1", "Cert 2"],
      "interview_areas": ["System Design", "DSA", "Behavioral"],
      "weekly_plan": "A paragraph describing what their weekly routine should look like."
    }}
    
    Do not output markdown code blocks. Just output the JSON directly.
    """
    force_model = current_user.preferred_model if current_user.preferred_model else "gemini"
    
    try:
        res = ai_client.get_response(message=prompt, force_model=force_model)
        clean_json = res.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        
        # Update user's DB state to match their new goal
        current_user.target_role = req.target_role
        current_user.target_package = req.target_package
        session.add(current_user)
        session.commit()
        
        return CareerResearchResponse(**data)
    except Exception as e:
        print(f"Career Research failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate career plan.")
