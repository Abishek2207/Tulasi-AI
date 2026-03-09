from fastapi import APIRouter
from pydantic import BaseModel
import os

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
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    
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
    
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-pro")
            prompt = f"""Analyze this resume for ATS compatibility and give a score from 0-100.
            
Resume:
{resume_text}

Respond in JSON format:
{{"score": 82, "feedback": ["✅ Good contact info", "⚠️ Add quantified achievements", "✅ Strong skills section", "⚠️ Include LinkedIn URL"]}}"""
            
            response = model.generate_content(prompt)
            import json, re
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                result = json.loads(match.group())
                return result
        except Exception as e:
            print(f"Gemini error: {e}")
    
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
