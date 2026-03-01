from fastapi import APIRouter, HTTPException
from services.leetcode import fetch_leetcode_stats

router = APIRouter(prefix="/api/leetcode", tags=["LeetCode"])

@router.get("/stats/{username}")
async def get_leetcode_stats(username: str):
    stats = await fetch_leetcode_stats(username)
    if not stats:
        raise HTTPException(status_code=404, detail="LeetCode user not found")
    return stats

@router.get("/daily")
async def get_daily_challenge():
    return {"id": "1", "title": "Two Sum", "difficulty": "Easy", "url": "https://leetcode.com/problems/two-sum/"}
