from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os

from app.agents.market_intelligence import fetch_real_market_data

router = APIRouter()

class MarketIntelligenceRequest(BaseModel):
    current_role: str
    company: str
    experience_years: int
    current_skills: List[str]
    target_role: str

@router.post("/market-intelligence")
async def get_market_intelligence(req: MarketIntelligenceRequest):
    try:
        data = fetch_real_market_data(
            current_role=req.current_role,
            company=req.company,
            experience_years=req.experience_years,
            current_skills=req.current_skills,
            target_role=req.target_role
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch market data")
