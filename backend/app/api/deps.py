from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from typing import Optional

from app.core.database import get_session
from app.core.security import decode_token
from app.core.config import settings
from app.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

from datetime import datetime

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
    if current_user.role != "admin" and current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user

