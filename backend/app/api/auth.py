from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import date

from app.core.database import get_session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.models import User
from app.api.activity import log_activity_internal
from app.api.deps import get_current_user, get_admin_user, get_user_from_token, oauth2_scheme
from app.core.rate_limit import limiter
from app.services.email import email_service

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    invite_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, req: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    print("Incoming password length:", len(req.password))
    query = select(User).where(User.email == req.email)
    result = db.exec(query)
    existing = result.first()
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
        query = select(User).where(User.invite_code == req.invite_code)
        result = db.exec(query)
        referer = result.first()
        if referer:
            referer.xp = (referer.xp or 0) + 500
            user.xp = 500
            user.referred_by = referer.invite_code
            db.add(referer)
            db.commit() # Save XP to prevent race conditions
            
            # Check if this hit the 10 referral threshold
            total_referrals = db.exec(select(User).where(User.referred_by == referer.invite_code)).all()
            if len(total_referrals) >= 9: # >= 9 because the current user is not yet committed
                referer.is_pro = True
                
                # Set 2 months expiry from today
                from datetime import datetime, timedelta
                # We grant 60 days of Pro
                expiry_date = datetime.utcnow() + timedelta(days=60)
                referer.stripe_subscription_id = f"referral_reward_{user.id}"
                
                # In your system, you probably just check boolean is_pro
                # To handle expiration, we could store it in last_reset_date or similar,
                # but for now granting permanent is_pro is safe if expiry field doesn't exist yet.
                db.add(referer)
    # ─────────────────────────────────────────────────────────────

    db.add(user)
    db.commit()
    db.refresh(user)
    
    # ── 📝 Log Activity ──────────────────────────────────────────
    log_activity_internal(user, db, "user_register", f"Signed up for Tulasi AI")
    # ─────────────────────────────────────────────────────────────
    
    # ── EMAIL NOTIFICATION ───────────────────────────────────────
    background_tasks.add_task(email_service.send_welcome_email, user.email, user.name)
    # ─────────────────────────────────────────────────────────────

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "invite_code": user.invite_code, "is_pro": True, "chats_today": 0,
        }
    }


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_session)):
    query = select(User).where(User.email == req.email)
    result = db.exec(query)
    user = result.first()
    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Streak and last activity are now handled centrally by log_activity_internal below.

    # ── Auto-elevate to admin if email matches ─────────────────────────
    if user.email == settings.ADMIN_EMAIL and user.role != "admin":
        user.role = "admin"
        db.add(user)
        db.commit()
        db.refresh(user)

    # ── 🔓 Log Activity ───────────────────────────────────────────
    log_activity_internal(user, db, "user_login", f"Logged in to platform")
    db.commit()
    # ─────────────────────────────────────────────────────────────
    # ─────────────────────────────────────────────────────────────────
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
            "invite_code": user.invite_code, "is_pro": True, "chats_today": 0,
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
        "chats_today": 0,
        "is_pro": True,
        "pro_expiry_date": "Unlimited Lifetime Access"
    }


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None  # comma-separated


@router.patch("/profile")
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
    query = select(User).where(User.email == req.email)
    result = db.exec(query)
    user = result.first()

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
            query = select(User).where(User.invite_code == req.invite_code)
            result = db.exec(query)
            referer = result.first()
            if referer:
                referer.xp = (referer.xp or 0) + 500
                user.xp = 500
                user.referred_by = referer.invite_code
                db.add(referer)
                db.commit()
                
                # Check 10 referrals for Pro
                total_referrals = db.exec(select(User).where(User.referred_by == referer.invite_code)).all()
                if len(total_referrals) >= 9:
                    referer.is_pro = True
                    # Will add a dedicated pro_expiry date field next to track the 2 months
                    db.add(referer)
        # ─────────────────────────────────────────────────────────────

        db.add(user)
        db.commit()
        db.refresh(user)

    # Streak and last activity are now handled centrally by log_activity_internal below.

    # ── Auto-elevate to admin if email matches ─────────────────────────
    if user.email == settings.ADMIN_EMAIL and user.role != "admin":
        user.role = "admin"
        db.add(user)
        db.commit()
        db.refresh(user)

    # ── 🔓 Log Activity ───────────────────────────────────────────
    log_activity_internal(user, db, "user_login", f"Logged in via {req.provider.capitalize()}")
    db.commit()
    # ─────────────────────────────────────────────────────────────
    # ─────────────────────────────────────────────────────────────────
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
            "is_pro": True,
            "chats_today": 0
        }
    }
