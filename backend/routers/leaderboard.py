from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

@router.get("/")
async def get_leaderboard(limit: int = 10):
    # Logic to fetch from Supabase functions (get_leaderboard)
    return [
        {"name": "Alice", "xp": 15000, "level": 15, "rank": 1},
        {"name": "Bob", "xp": 12000, "level": 12, "rank": 2},
        {"name": "Admin", "xp": 10500, "level": 11, "rank": 3}
    ]
