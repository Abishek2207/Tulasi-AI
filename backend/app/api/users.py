from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "is_pro": current_user.is_pro,
        "xp": current_user.xp,
        "level": current_user.level,
    }


@router.get("/")
def get_all_users(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    users = db.exec(select(User)).all()
    return [{"id": u.id, "email": u.email, "name": u.name, "role": u.role} for u in users]
