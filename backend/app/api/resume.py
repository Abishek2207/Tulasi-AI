from fastapi import APIRouter
from pydantic import BaseModel
from app.core.ai_router import get_ai_response

router = APIRouter()

class ResumeData(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    skills: str = ""
    experience: str = ""
    education: str = ""

@router.post("/analyze-ats")
def analyze_ats(data: ResumeData):
    resume_text = f"""
Name: {data.name}
Email: {data.email}
Phone: {data.phone}
Location: {data.location}
Summary: {data.summary}
Skills: {data.skills}
Experience: {data.experience}
Education: {data.education}
""".strip()
    
    prompt = f"""Analyze this resume for ATS compatibility and give a score from 0-100.
            
Resume:
{resume_text}

Respond STRICTLY in JSON format:
{{"score": 82, "feedback": ["✅ Good contact info", "⚠️ Add quantified achievements", "✅ Strong skills section", "⚠️ Include LinkedIn URL"]}}"""
    
    response_text = get_ai_response(prompt, force_model="complex_reasoning")
    
    if "API key" not in response_text:
        try:
            import json, re
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                result = json.loads(match.group())
                return result
        except Exception as e:
            print(f"JSON Parsing error in resume analysis: {e}")
    
    # Fallback scoring
    score = 50
    feedback = []
    
    if data.name: score += 5; feedback.append("✅ Name included")
    if data.email: score += 5; feedback.append("✅ Email included")
    if data.phone: score += 3; feedback.append("✅ Phone included")
    if data.summary and len(data.summary) > 50: score += 10; feedback.append("✅ Professional summary present")
    else: feedback.append("⚠️ Add a strong professional summary")
    if data.skills: score += 10; feedback.append("✅ Skills section present")
    if data.experience: score += 12; feedback.append("✅ Work experience included")
    if data.education: score += 5; feedback.append("✅ Education included")
    if not data.phone: feedback.append("⚠️ Add phone number")
    feedback.append("⚠️ Consider adding LinkedIn/GitHub URLs")
    feedback.append("💡 Use action verbs: 'Developed', 'Led', 'Improved'")
    
    return {"score": min(score, 95), "feedback": feedback}
