from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import json

from app.core.config import settings
from app.api.deps import get_current_user
from app.models.models import User, SavedStartupIdea
from app.api.activity import log_activity_internal
from app.core.database import get_session
from app.core.rate_limit import limiter
from sqlmodel import Session, select
from app.core.ai_router import get_ai_response, resilient_ai_response

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
def generate_startup_idea(request: Request, req: StartupRequest, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
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

    fallback = {
        "name": "Neural Ledger",
        "problem": "Traditional accounting is slow, manual, and prone to human error.",
        "solution": "An AI-powered automated ledger that syncs with bank APIs and categorizes transactions in real-time.",
        "market_opportunity": "SME sector in India and SE Asia is rapidly digitizing.",
        "tech_stack": ["Next.js", "FastAPI", "PostgreSQL", "Tailwind CSS"],
        "monetization": "SaaS Subscription (Tiered)"
    }

    try:
        data = resilient_ai_response(prompt, fallback=fallback, force_model="complex_reasoning")
        
        # ── 💡 Log Activity ──────────────────────────────────────────
        log_activity_internal(current_user, db, "startup_saved", f"Generated idea: {data.get('name', 'New Startup')}")
        db.commit()
        # ─────────────────────────────────────────────────────────────

        return {"status": "success", "idea": data}

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

    # ── 💡 Log Activity ──────────────────────────────────────────
    log_activity_internal(current_user, db, "startup_saved", f"Saved idea: {idea.name}")
    db.commit()
    # ─────────────────────────────────────────────────────────────
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


class PitchDeckRequest(BaseModel):
    name: str
    problem: str
    solution: str
    market_opportunity: str
    monetization: str


@router.post("/pitch-deck")
@limiter.limit("5/minute")
def generate_pitch_deck(request: Request, req: PitchDeckRequest, current_user: User = Depends(get_current_user)):
    """Generate a 10-slide investor pitch deck in Markdown format."""
    prompt = f"""Create an elite 10-slide startup pitch deck based on this idea:
    
Startup: {req.name}
Problem: {req.problem}
Solution: {req.solution}
Market: {req.market_opportunity}
Business Model: {req.monetization}

Output a professional Markdown document. Use ## for slide titles.
Include: Hook, Problem, Solution, Market, Product, Revenue, Competition, GTM Strategy, Team, and The Ask.
Be extremely persuasive and professional."""

    try:
        # Using the system_instruction feature we just implemented
        system_instruction = "You are an Elite Silicon Valley VC and Pitch Deck Architect. Provide exhaustive, professional, and visually structured Markdown drafts."
        response_text = get_ai_response(prompt, system_instruction=system_instruction)
        return {"status": "success", "pitch_deck": response_text}
    except Exception as e:
        raise HTTPException(500, f"Error generating pitch deck: {str(e)}")
