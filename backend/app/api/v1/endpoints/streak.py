"""
Streak tracking endpoints — daily check-in and weekly heatmap data.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, date, timedelta
from typing import List

router = APIRouter()

# In-memory streak store (replace with Supabase in production)
streak_data: dict = {
    "current_streak": 12,
    "longest_streak": 21,
    "last_checkin": (date.today() - timedelta(days=1)).isoformat(),
    "checkin_dates": [
        (date.today() - timedelta(days=i)).isoformat() for i in range(12)
    ],
}


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_checkin: str
    checked_in_today: bool
    weekly_heatmap: List[dict]


class CheckinResponse(BaseModel):
    message: str
    current_streak: int


def build_weekly_heatmap() -> List[dict]:
    """Build last 7 days activity map."""
    heatmap = []
    checkin_set = set(streak_data["checkin_dates"])
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        heatmap.append({
            "date": day.isoformat(),
            "day": day.strftime("%a"),
            "active": day.isoformat() in checkin_set,
        })
    return heatmap


@router.get("", response_model=StreakResponse, summary="Get streak stats and heatmap")
def get_streak():
    today = date.today().isoformat()
    return {
        "current_streak": streak_data["current_streak"],
        "longest_streak": streak_data["longest_streak"],
        "last_checkin": streak_data["last_checkin"],
        "checked_in_today": streak_data["last_checkin"] == today,
        "weekly_heatmap": build_weekly_heatmap(),
    }


@router.post("/checkin", response_model=CheckinResponse, summary="Record today's check-in")
def daily_checkin():
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    if streak_data["last_checkin"] == today:
        return {"message": "Already checked in today!", "current_streak": streak_data["current_streak"]}

    if streak_data["last_checkin"] == yesterday:
        streak_data["current_streak"] += 1
    else:
        streak_data["current_streak"] = 1

    streak_data["last_checkin"] = today
    streak_data["longest_streak"] = max(streak_data["longest_streak"], streak_data["current_streak"])
    streak_data["checkin_dates"].append(today)

    return {
        "message": f"✅ Check-in recorded! Streak: {streak_data['current_streak']} days",
        "current_streak": streak_data["current_streak"],
    }
