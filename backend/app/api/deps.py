from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select, func
from typing import Optional
from datetime import datetime, timedelta

from app.core.database import get_session
from app.core.security import decode_token
from app.core.config import settings
from app.models.models import User, UserSubscription, SubscriptionPlan, UsageLog

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    query = select(User).where(User.email == (payload.get("sub") or payload.get("email")))
    result = db.exec(query)
    user = result.first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled due to abuse policy violations")

    # Best-effort last_seen update — do NOT commit here (causes SQLite write-lock under load)
    try:
        user.last_seen = datetime.utcnow()
        db.add(user)
        # Commit happens at end of request lifecycle, not here
    except Exception:
        pass  # Never fail auth because of a cosmetic last_seen update

    return user


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    payload = decode_token(token)
    if not payload:
        return None
    query = select(User).where(User.email == payload.get("sub"))
    result = db.exec(query)
    user = result.first()
    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    admin_emails = [settings.ADMIN_EMAIL.lower(), "abishek2207@gmail.com", "abishekramamoorthy22@gmail.com"]
    is_admin_email = current_user.email and current_user.email.lower() in admin_emails
    if current_user.role != "admin" and not is_admin_email:
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


def require_pro(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)) -> User:
    """Gate: requires the user to have an active paid subscription or is_pro flag."""
    if current_user.is_pro:
        return current_user
    sub = db.exec(
        select(UserSubscription).where(
            UserSubscription.user_id == current_user.id,
            UserSubscription.status == "active"
        )
    ).first()
    if not sub:
        raise HTTPException(
            status_code=402,
            detail="This feature requires a Pro subscription. Upgrade at /dashboard/billing."
        )
    return current_user


def require_quota(action_type: str, limit: int = 10):
    """
    Factory that returns a FastAPI dependency which enforces a daily usage quota.
    Usage: Depends(require_quota("ats_analyze", limit=5))
    """
    def _dependency(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)) -> User:
        # Pro users and admins get unlimited access
        if current_user.is_pro or current_user.role == "admin":
            return current_user

        # Count usage for today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        count = db.exec(
            select(func.count(UsageLog.id)).where(
                UsageLog.user_id == current_user.id,
                UsageLog.action_type == action_type,
                UsageLog.created_at >= today_start
            )
        ).one()

        if count >= limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily limit of {limit} for '{action_type}' reached. Upgrade to Pro for unlimited access."
            )
        return current_user

    return _dependency
