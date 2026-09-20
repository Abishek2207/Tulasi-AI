from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.api.deps import get_current_user
from app.models.models import User
from app.agents.market_intelligence import fetch_market_trends, analyze_career_risk, get_career_directions

router = APIRouter()

class ProfileContextRequest(BaseModel):
    current_role: str
    target_role: Optional[str] = None
    experience_years: int = 2
    current_skills: List[str] = []

@router.post("/market-trends")
async def api_market_trends(req: ProfileContextRequest, current_user: User = Depends(get_current_user)):
    target = (req.profile.target_role if getattr(req, "profile", None) else "") or req.current_role
    return fetch_market_trends(req.current_role, target)

@router.post("/risk-analysis")
async def api_risk_analysis(req: ProfileContextRequest, current_user: User = Depends(get_current_user)):
    return analyze_career_risk(req.current_role, req.experience_years, req.current_skills)

@router.post("/career-directions")
async def api_career_directions(req: ProfileContextRequest, current_user: User = Depends(get_current_user)):
    return get_career_directions(req.current_role, req.current_skills)

