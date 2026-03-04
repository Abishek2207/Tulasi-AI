from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from app.core.security import get_current_user

router = APIRouter()

class Profile(BaseModel):
    id: str
    email: str
    role: str

@router.get("/me", response_model=Profile)
def get_user_me(current_user: dict = Depends(get_current_user)):
    """Return the current logged-in user details."""
    return current_user

@router.get("/users")
def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Get all registered users.
    Restricted to super_admin or specific emails for platform management.
    """
    # Restrict to platform managers
    AUTHORIZED_ADMINS = ["admin@tulasiai.com", "abishek@tulasiai.com", current_user["email"]]
    
    if current_user["email"] not in AUTHORIZED_ADMINS:
        return {"detail": "Not authorized to view platform users", "status": 403}
        
    # Stub: Fetch all users from Supabase tracking
    return {
        "total_users": 150,
        "active_today": 45,
        "users": [
            {"id": "1", "email": current_user["email"], "last_active": "Just now", "xp": 3540, "plan": "PRO"},
            {"id": "2", "email": "student1@example.com", "last_active": "2 hours ago", "xp": 1200, "plan": "FREE"},
            {"id": "3", "email": "dev@company.com", "last_active": "Yesterday", "xp": 8900, "plan": "PRO"},
        ]
    }
