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
    user = db.exec(select(User).where(User.email == (payload.get("sub") or payload.get("email"))).first())
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Update last_seen for activity tracking
    user.last_seen = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    payload = decode_token(token)
    if not payload:
        return None
    user = db.exec(select(User).where(User.email == payload.get("sub"))).first()
    return user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin" and current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user

