from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List

from app.core.database import get_session
from app.api.auth import get_admin_user, get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    from datetime import date
    users = db.exec(select(User)).all()
    total = len(users)
    students = [u for u in users if u.role == "student"]
    pro_users = [u for u in users if u.is_pro]
    
    today_str = date.today().isoformat()
    active_today = len([u for u in users if u.last_activity_date == today_str])

    return {
        "total_users": total,
        "students": len(students),
        "admins": total - len(students),
        "pro_users": len(pro_users),
        "active_today": active_today,
    }


@router.get("/users")
def get_all_users(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    users = db.exec(select(User)).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "xp": u.xp,
                "streak": u.streak,
                "is_pro": u.is_pro,
                "created_at": u.created_at.isoformat(),
                "is_active": u.is_active,
            }
            for u in users

        ]
    }


class ToggleUserRequest(BaseModel):
    user_id: int
    is_active: bool


@router.post("/toggle-user")
def toggle_user(req: ToggleUserRequest, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    user = db.get(User, req.user_id)
    if not user:
        return {"error": "User not found"}
    if user.email == admin.email:
        return {"error": "Cannot disable your own admin account"}
    user.is_active = req.is_active
    db.add(user)
    db.commit()
    return {"message": f"User {'enabled' if req.is_active else 'disabled'} successfully"}
