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
        "is_pro": True,
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


@router.get("/referrals")
def get_referral_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Returns the user's invite code and how many people have used it."""
    if not current_user.invite_code:
        import uuid
        current_user.invite_code = uuid.uuid4().hex[:8].upper()
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
    referred_users = db.exec(
        select(User).where(User.referred_by == current_user.invite_code)
    ).all()
    
    return {
        "invite_code": current_user.invite_code,
        "total_referrals": len(referred_users),
        "is_pro": True,
        "pro_expiry_date": current_user.pro_expiry_date,
        "referrals_needed_for_pro": 0
    }

