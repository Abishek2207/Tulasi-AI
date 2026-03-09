from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()

class StartupRequest(BaseModel):
    domain: str
    target_audience: str

@router.post("/generate")
def generate_startup_idea(req: StartupRequest, current_user: User = Depends(get_current_user)):
    prompt = f"""You are an elite Y Combinator startup advisor. Generate a highly innovative, realistic, and scalable startup idea for a student founder.
    
Domain/Interest: {req.domain}
Target Audience: {req.target_audience}

Output the idea strictly as a valid JSON object with the following keys:
- "name": A catchy name for the startup
- "problem": 1-2 sentences describing the core problem being solved
- "solution": 2-3 sentences describing the product/service and how it solves the problem
- "market_opportunity": A short description of the market size or potential
- "tech_stack": A list of 4-5 recommended technologies to build this (e.g. ["Next.js", "FastAPI", "PostgreSQL", "OpenAI"])
- "monetization": How the startup will make money

Return ONLY the raw JSON object, no markdown, no backticks, no introduction."""

    try:
        # Try Groq first for speed
        if settings.GROQ_API_KEY:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            response_text = completion.choices[0].message.content
            
        # Fallback to Gemini
        elif settings.GEMINI_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
                
        else:
            raise HTTPException(500, "No AI configured. Please set GROQ_API_KEY or GEMINI_API_KEY in backend/.env")

        # Parse and return JSON
        data = json.loads(response_text)
        return {"status": "success", "idea": data}

    except json.JSONDecodeError:
        print("Failed to parse AI response as JSON:", response_text)
        raise HTTPException(500, "AI returned invalid format. Try again.")
    except Exception as e:
        raise HTTPException(500, f"Error generating startup idea: {str(e)}")
