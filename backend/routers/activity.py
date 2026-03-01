from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/activity", tags=["Activity"])

class ActivityLog(BaseModel):
    user_id: str
    activity_type: str
    intensity: int = 1

@router.post("/log")
async def log_activity(activity: ActivityLog):
    # Logic to update streaks and calculate XP via Supabase functions
    return {"status": "logged", "xp_earned": 50}

@router.get("/heatmap/{user_id}")
async def get_heatmap(user_id: str):
    # Return count of activities per day
    return {"2026-03-01": 5, "2026-02-28": 3}
