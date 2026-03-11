from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from typing import Any

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()

class RoadmapRequest(BaseModel):
    goal: str

def generate_ai_response(prompt: str, is_json: bool = False):
    """Helper to query Groq (preferred) or Gemini."""
    if settings.GROQ_API_KEY:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        req_params: dict[str, Any] = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 2048,
            "temperature": 0.7
        }
        
        if is_json:
            req_params["response_format"] = {"type": "json_object"}
            
        completion = client.chat.completions.create(**req_params)
        return completion.choices[0].message.content
        
    elif settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if is_json:
            if text.startswith("```json"): text = text[7:-3]
            elif text.startswith("```"): text = text[3:-3]
        return text
    else:
        raise HTTPException(500, "No AI API keys configured.")


@router.post("/generate")
def generate_roadmap(req: RoadmapRequest, current_user: User = Depends(get_current_user)):
    
    prompt = f"""You are an elite career technical advisor. A student wants to become a "{req.goal}". 
Create a detailed, step-by-step learning roadmap divided into exactly 5 logical phases/milestones.

Output strictly as a valid JSON object matching this exact schema:
{{
  "title": "Roadmap to {req.goal}",
  "description": "A 2-sentence highly motivating hook.",
  "estimated_months": 6,
  "milestones": [
    {{
      "phase": "1",
      "title": "Name of Phase",
      "duration": "e.g. Weeks 1-4",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "project_idea": "A small project to cement learning for this phase",
      "resources": [
        {{"name": "Course Title", "url": "https://youtube.com/something"}},
        {{"name": "Official Docs", "url": "https://..."}}
      ]
    }}
  ]
}}

Return ONLY raw JSON, nothing else."""

    try:
        response_str = generate_ai_response(prompt, is_json=True)
        # Parse the JSON right here to ensure it's valid before sending to frontend
        roadmap_data = json.loads(response_str)
        # In the future, this is where we would save `roadmap_data` to a Database for the user
        return {"roadmap": roadmap_data}
    except json.JSONDecodeError:
        raise HTTPException(500, "AI failed to generate valid JSON format.")
    except Exception as e:
        raise HTTPException(500, f"Error generating roadmap: {str(e)}")
