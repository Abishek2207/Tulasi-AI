import os
import requests
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from datetime import datetime, timezone

from app.api.deps import get_current_user
from app.models.models import User
from app.core.database import get_session
from sqlmodel import Session

router = APIRouter()

@router.get("/github")
def get_github_portfolio(username: str, current_user: User = Depends(get_current_user)):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "TulasiAI-Agent"
    }
    
    # Optional token if the user happens to have one
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(f"https://api.github.com/users/{username}/repos?per_page=10&sort=updated", headers=headers, timeout=10)
        
        if response.status_code == 403 or response.status_code == 429:
            raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded. Please try again later.")
        elif response.status_code == 404:
            return {"success": True, "data": []}
            
        response.raise_for_status()
        repos = response.json()
        
        formatted_repos = []
        for repo in repos:
            formatted_repos.append({
                "name": repo.get("name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count"),
                "url": repo.get("html_url"),
                "source_name": "GitHub Public API",
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "verified_status": True
            })
            
        return {"success": True, "data": formatted_repos}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch GitHub data: {str(e)}")

from pydantic import BaseModel
from typing import Optional, List

class PortfolioInput(BaseModel):
    name: str
    title: str
    tagline: str
    email: str
    github: str
    linkedin: str
    location: str
    bio: str

@router.post("/generate")
async def generate_portfolio(data: PortfolioInput, current_user: User = Depends(get_current_user)):
    from app.core.ai_client import HybridAIClient
    ai = HybridAIClient()
    
    prompt = f"""
    You are an expert technical recruiter and portfolio copywriter.
    I have provided some basic details for a candidate. Your job is to transform this into a highly professional, compelling, and ATS-friendly portfolio dataset.
    
    Candidate Details:
    Name: {data.name}
    Title: {data.title}
    Tagline: {data.tagline}
    Bio: {data.bio}
    
    Please generate a robust portfolio including:
    1. A polished, professional version of their bio.
    2. A list of exactly 6 relevant technical skills based on their title and bio.
    3. Exactly 2 highly impressive, realistic projects related to their field (include tech stack, description, and an achievement).
    4. Exactly 1 realistic professional experience entry that makes them look good.
    5. Exactly 1 relevant achievement/certification.
    
    Return the result EXCLUSIVELY as a JSON object matching this schema exactly (do NOT wrap in markdown):
    {{
      "name": "{data.name}",
      "title": "{data.title}",
      "tagline": "...",
      "email": "{data.email}",
      "phone": "",
      "location": "{data.location}",
      "github": "{data.github}",
      "linkedin": "{data.linkedin}",
      "website": "",
      "bio": "...",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
      "projects": [
         {{ "id": "p1", "name": "...", "description": "...", "tech": ["t1", "t2"], "github": "", "live": "", "achievement": "..." }},
         {{ "id": "p2", "name": "...", "description": "...", "tech": ["t1", "t2"], "github": "", "live": "", "achievement": "..." }}
      ],
      "experience": [
         {{ "id": "e1", "company": "...", "role": "...", "duration": "...", "points": ["...", "..."] }}
      ],
      "achievements": [
         {{ "id": "a1", "title": "...", "issuer": "...", "year": "..." }}
      ]
    }}
    """
    
    response_text = await ai.get_response(
        prompt, 
        system_prompt="You are a strict JSON API. Output only valid JSON.",
        preferred_model="gemini-2.5-flash"
    )
    
    import json
    try:
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned.split("```json")[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        result = json.loads(cleaned.strip())
        return {"portfolio": result}
    except Exception as e:
        # Fallback if AI fails to return strict JSON
        raise HTTPException(status_code=500, detail="Failed to parse AI response into JSON format.")


@router.post("/generate-from-file")
async def generate_portfolio_from_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    from app.core.ai_client import HybridAIClient
    import io
    
    text = ""
    try:
        content = await file.read()
        filename = file.filename.lower()
        if filename.endswith(".pdf"):
            import pypdf
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            # Fallback to plain text decoding
            text = content.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the provided file.")

    ai = HybridAIClient()
    
    prompt = f"""
    You are an expert technical recruiter and portfolio copywriter.
    I have provided a candidate's resume text below. Your job is to transform this into a highly professional, compelling, and ATS-friendly portfolio dataset.
    
    Resume Text:
    {text}
    
    Please generate a robust portfolio including:
    1. Their full name, a strong professional title, and a short catchy tagline.
    2. A polished, professional version of their bio.
    3. Exactly 6 relevant technical skills based on their resume.
    4. Exactly 2 highly impressive, realistic projects extracted from or inspired by their resume (include tech stack, description, and an achievement).
    5. Exactly 1-2 realistic professional experience entries extracted from the resume.
    6. Exactly 1 relevant achievement/certification.
    7. Any contact information you can find (email, location, linkedin, github, phone). Leave as empty string if not found.
    
    Return the result EXCLUSIVELY as a JSON object matching this schema exactly (do NOT wrap in markdown):
    {{
      "name": "...",
      "title": "...",
      "tagline": "...",
      "email": "...",
      "phone": "...",
      "location": "...",
      "github": "...",
      "linkedin": "...",
      "website": "",
      "bio": "...",
      "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
      "projects": [
         {{ "id": "p1", "name": "...", "description": "...", "tech": ["t1", "t2"], "github": "", "live": "", "achievement": "..." }}
      ],
      "experience": [
         {{ "id": "e1", "company": "...", "role": "...", "duration": "...", "points": ["...", "..."] }}
      ],
      "achievements": [
         {{ "id": "a1", "title": "...", "issuer": "...", "year": "..." }}
      ]
    }}
    """
    
    response_text = await ai.get_response(
        prompt, 
        system_prompt="You are a strict JSON API. Output only valid JSON.",
        preferred_model="gemini-2.5-flash"
    )
    
    import json
    try:
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned.split("```json")[1]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        result = json.loads(cleaned.strip())
        return {"portfolio": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response into JSON format.")


