from fastapi import APIRouter

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_metrics():
    """
    Return user dashboard metrics.
    In production, this pulls from Supabase per user session.
    """
    return {
        "streak": 12,
        "problems_solved": 34,
        "study_hours": 120,
        "roadmap_progress": 45,
        "interviews_completed": 8,
        "certificates_earned": 3,
        "leaderboard_rank": 42,
        "weekly_activity": [
            {"day": "Mon", "hours": 2.5},
            {"day": "Tue", "hours": 3.0},
            {"day": "Wed", "hours": 1.5},
            {"day": "Thu", "hours": 4.0},
            {"day": "Fri", "hours": 2.0},
            {"day": "Sat", "hours": 5.0},
            {"day": "Sun", "hours": 3.5},
        ],
    }
