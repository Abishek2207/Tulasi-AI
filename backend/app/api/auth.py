from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import date

from app.core.database import get_session
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.core.config import settings
from app.models.models import User
from app.core.rate_limit import limiter

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    invite_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_session)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.exec(select(User).where(User.email == payload.get("sub"))).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_user_from_token(token: str, db: Session) -> Optional[User]:
    payload = decode_token(token)
    if not payload:
        return None
    user = db.exec(select(User).where(User.email == payload.get("sub"))).first()
    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.email != settings.ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, req: RegisterRequest, db: Session = Depends(get_session)):
    print("Incoming password length:", len(req.password))
    existing = db.exec(select(User).where(User.email == req.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    is_admin = req.email == settings.ADMIN_EMAIL
    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        name=req.name,
        role="admin" if is_admin else "student",
        invite_code=uuid.uuid4().hex[:8].upper(),
    )
    
    # ── REFERRAL REWARD SYSTEM ───────────────────────────────────
    if req.invite_code:
        referer = db.exec(select(User).where(User.invite_code == req.invite_code)).first()
        if referer:
            referer.xp = (referer.xp or 0) + 500
            user.xp = 500
            user.referred_by = referer.invite_code
            db.add(referer)
    # ─────────────────────────────────────────────────────────────

    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "invite_code": user.invite_code,
        }
    }


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_session)):
    user = db.exec(select(User).where(User.email == req.email)).first()
    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # ── Update streak on login ────────────────────────────────────────
    today = date.today().isoformat()
    last = user.last_activity_date
    if last != today:
        from datetime import date as _date
        if last and (_date.today() - _date.fromisoformat(last)).days == 1:
            user.streak = (user.streak or 0) + 1
        elif not last or (_date.today() - _date.fromisoformat(last)).days > 1:
            user.streak = 1
        # Update longest streak
        user.longest_streak = max(user.longest_streak or 0, user.streak)
        user.last_activity_date = today
        db.add(user)
        db.commit()
        db.refresh(user)
    # ─────────────────────────────────────────────────────────────────

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "invite_code": user.invite_code,
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "bio": current_user.bio or "",
        "skills": current_user.skills or "",
        "role": current_user.role,
        "avatar": current_user.avatar,
        "streak": current_user.streak,
        "longest_streak": current_user.longest_streak or 0,
        "xp": current_user.xp,
        "level": current_user.level,
        "invite_code": current_user.invite_code,
    }


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None  # comma-separated


@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if req.name is not None:
        current_user.name = req.name.strip()
    if req.bio is not None:
        current_user.bio = req.bio.strip()
    if req.skills is not None:
        current_user.skills = req.skills.strip()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "bio": current_user.bio or "",
            "skills": current_user.skills or "",
            "email": current_user.email,
        },
    }


class OAuthLoginRequest(BaseModel):
    email: str
    name: Optional[str] = None
    provider: str = "google"
    invite_code: Optional[str] = None


@router.post("/google-oauth")
def oauth_login(req: OAuthLoginRequest, db: Session = Depends(get_session)):
    """Auto-register or login OAuth users (Google/GitHub) and return a JWT token."""
    user = db.exec(select(User).where(User.email == req.email)).first()

    if not user:
        # Auto-register the oauth user
        is_admin = req.email == settings.ADMIN_EMAIL
        user = User(
            email=req.email,
            hashed_password=None,  # No password for OAuth users
            name=req.name or req.email.split("@")[0],
            role="admin" if is_admin else "student",
            provider=req.provider,
            invite_code=uuid.uuid4().hex[:8].upper(),
        )

        # ── REFERRAL REWARD SYSTEM ───────────────────────────────────
        if req.invite_code:
            referer = db.exec(select(User).where(User.invite_code == req.invite_code)).first()
            if referer:
                referer.xp = (referer.xp or 0) + 500
                user.xp = 500
                user.referred_by = referer.invite_code
                db.add(referer)
        # ─────────────────────────────────────────────────────────────

        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "invite_code": user.invite_code,
        }
    }
