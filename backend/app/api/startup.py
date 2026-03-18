from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import json

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User, SavedStartupIdea
from app.core.database import get_session
from app.core.rate_limit import limiter
from sqlmodel import Session, select
from app.core.ai_router import get_ai_response

router = APIRouter()


class StartupRequest(BaseModel):
    domain: str
    target_audience: str


class SaveIdeaRequest(BaseModel):
    name: str
    problem: str = ""
    solution: str = ""
    market_opportunity: str = ""
    tech_stack: list = []
    monetization: str = ""
    domain: str = ""


@router.post("/generate")
@limiter.limit("10/minute")
def generate_startup_idea(request: Request, req: StartupRequest, current_user: User = Depends(get_current_user)):
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
        response_text = get_ai_response(prompt, force_model="complex_reasoning")
        import re
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            response_text = match.group()
        
        data = json.loads(response_text)
        return {"status": "success", "idea": data}

    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid format. Try again.")
    except Exception as e:
        raise HTTPException(500, f"Error generating startup idea: {str(e)}")


@router.post("/save")
def save_startup_idea(
    req: SaveIdeaRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    idea = SavedStartupIdea(
        user_id=current_user.id,
        name=req.name,
        problem=req.problem,
        solution=req.solution,
        market_opportunity=req.market_opportunity,
        tech_stack=json.dumps(req.tech_stack),
        monetization=req.monetization,
        domain=req.domain,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return {"message": "Idea saved!", "id": idea.id}


@router.get("/ideas")
def get_saved_ideas(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    ideas = db.exec(
        select(SavedStartupIdea)
        .where(SavedStartupIdea.user_id == current_user.id)
        .order_by(SavedStartupIdea.created_at.desc())
    ).all()
    return {
        "ideas": [
            {
                "id": i.id,
                "name": i.name,
                "problem": i.problem,
                "solution": i.solution,
                "market_opportunity": i.market_opportunity,
                "tech_stack": json.loads(i.tech_stack) if i.tech_stack else [],
                "monetization": i.monetization,
                "domain": i.domain,
                "created_at": i.created_at.isoformat(),
            }
            for i in ideas
        ]
    }


@router.get("-ideas")
def get_startup_ideas_alias(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Alias for /api/startup-ideas to match frontend usage if it exists as such."""
    ideas = db.exec(
        select(SavedStartupIdea)
        .where(SavedStartupIdea.user_id == current_user.id)
        .order_by(SavedStartupIdea.created_at.desc())
    ).all()
    return {
        "ideas": [
            {
                "id": i.id,
                "name": i.name,
                "problem": i.problem,
                "solution": i.solution,
                "market_opportunity": i.market_opportunity,
                "tech_stack": json.loads(i.tech_stack) if i.tech_stack else [],
                "monetization": i.monetization,
                "domain": i.domain,
                "created_at": i.created_at.isoformat(),
            }
            for i in ideas
        ]
    }
