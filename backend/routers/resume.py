# backend/routers/resume.py
from fastapi import APIRouter
from services.langchain_service import llm
from pydantic import BaseModel

router = APIRouter()

class ResumeData(BaseModel):
    name: str
    email: str
    phone: str
    skills: list
    experience: list
    education: list
    projects: list
    target_role: str

@router.post("/generate")
async def generate_resume(data: ResumeData):
    resume_content = llm.invoke(f"""
    Create a professional ATS-friendly resume for:
    Name: {data.name}
    Target Role: {data.target_role}
    Skills: {', '.join(data.skills)}
    
    Experience: {data.experience}
    Education: {data.education}
    Projects: {data.projects}
    
    Return a complete, formatted resume in HTML format.
    Make it ATS-friendly with proper keywords for {data.target_role}.
    Use clean, professional formatting.
    """)
    return {"resume_html": resume_content.content}

@router.post("/ats-check")
async def check_ats_score(resume_text: str, job_description: str):
    analysis = llm.invoke(f"""
    Analyze this resume against the job description for ATS compatibility:
    
    Resume: {resume_text}
    Job Description: {job_description}
    
    Provide JSON:
    {{
      "ats_score": 0-100,
      "matched_keywords": [],
      "missing_keywords": [],
      "improvements": [],
      "strengths": [],
      "overall_feedback": "..."
    }}
    """)
    return {"analysis": analysis.content}
