from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import date

from app.core.database import get_session, engine
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.models import User
from app.api.activity import log_activity_internal
from app.api.deps import get_current_user, get_admin_user, get_user_from_token, oauth2_scheme
from app.core.rate_limit import limiter
from app.services.email import email_service

router = APIRouter()

def background_log_login(user_id: int, action_type: str, title: str):
    with Session(engine) as db:
        user = db.exec(select(User).where(User.id == user_id)).first()
        if user:
            log_activity_internal(user, db, action_type, title)
            db.commit()

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    invite_code: Optional[str] = None
    user_type: Optional[str] = "student"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
@limiter.limit("20/minute")
def register(request: Request, req: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    print("Incoming password length:", len(req.password))
    query = select(User).where(User.email == req.email)
    result = db.exec(query)
    existing = result.first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    admin_emails = [settings.ADMIN_EMAIL.lower(), "abishek2207@gmail.com", "abishekramamoorthy22@gmail.com"]
    is_admin = req.email.lower() in admin_emails
    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        name=req.name,
        role="admin" if is_admin else "student",
        user_type=req.user_type if hasattr(req, "user_type") and req.user_type else "student",
        invite_code=uuid.uuid4().hex[:8].upper(),
    )
    
    # ── REFERRAL & ADMIN INVITE SYSTEM ───────────────────────────
    if req.invite_code:
        from app.models.models import InviteCode
        # 1. Check against Admin-generated codes first
        admin_code = db.exec(select(InviteCode).where(InviteCode.code == req.invite_code)).first()
        if admin_code:
            if admin_code.usage_count < admin_code.usage_limit:
                admin_code.usage_count += 1
                if admin_code.grants_pro:
                    user.is_pro = True
                user.referred_by = f"ADMIN:{admin_code.code}"
                db.add(admin_code)
                # Keep committing for each registration to avoid lock contention if high volume
                db.commit()
            else:
                # Code reached limit, but we don't block registration, just don't grant rewards
                pass
        else:
            # 2. Fallback to User Referral rewards
            query = select(User).where(User.invite_code == req.invite_code)
            result = db.exec(query)
            referer = result.first()
            if referer:
                referer.xp = (referer.xp or 0) + 500
                user.xp = 500
                user.referred_by = referer.invite_code
                db.add(referer)
                db.commit() # Save XP

                # 📧 Notify referrer of reward
                import threading
                _ref_email = referer.email
                _ref_name = referer.name or "Engineer"
                _new_name = req.name or req.email.split("@")[0]
                threading.Thread(
                    target=email_service.send_invite_reward_email,
                    args=(_ref_email, _ref_name, _new_name, 500),
                    daemon=True
                ).start()

                # Check if this hit the 10 referral threshold
                total_referrals = db.exec(select(User).where(User.referred_by == referer.invite_code)).all()
                if len(total_referrals) >= 9: # >= 9 because the current user is not yet committed
                    referer.is_pro = True
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
            "username": user.username,
            "role": user.role,
            "invite_code": user.invite_code, "is_pro": True, "chats_today": 0,
            "user_type": getattr(user, "user_type", "student") or "student",
            "is_onboarded": getattr(user, "is_onboarded", False) or False,
        }
    }


@router.post("/login")
@limiter.limit("30/minute")
def login(request: Request, req: LoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")
        
    query = select(User).where(User.email == req.email)
    try:
        result = db.exec(query)
        user = result.first()
    except Exception as e:
        print(f"Login DB error: {e}")
        raise HTTPException(status_code=503, detail="Database temporarily unavailable")

    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Streak and last activity are now handled centrally by log_activity_internal below.

    # ── Auto-elevate to admin if email matches ─────────────────────────
    needs_commit = False
    admin_emails = [settings.ADMIN_EMAIL.lower(), "abishek2207@gmail.com", "abishekramamoorthy22@gmail.com"]
    if user.email.lower() in admin_emails and user.role != "admin":
        user.role = "admin"
        db.add(user)
        needs_commit = True
        
    if needs_commit:
        db.commit()
        db.refresh(user)

    # ── 🔓 Log Activity In Background ──────────────────────────────
    background_tasks.add_task(background_log_login, user.id, "user_login", "Logged in to platform")
    # ─────────────────────────────────────────────────────────────

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "username": user.username,
            "role": user.role,
            "invite_code": user.invite_code, "is_pro": True, "chats_today": 0,
            "user_type": getattr(user, "user_type", "student") or "student",
            "is_onboarded": getattr(user, "is_onboarded", False) or False,
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "username": current_user.username,
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
        "pro_expiry_date": "Unlimited Lifetime Access",
        "user_type": getattr(current_user, "user_type", "student") or "student",
        "is_onboarded": getattr(current_user, "is_onboarded", False) or False,
        "department": current_user.department,
        "target_role": current_user.target_role,
        "interest_areas": current_user.interest_areas,
    }



class OAuthLoginRequest(BaseModel):
    email: str
    name: Optional[str] = None
    avatar: Optional[str] = None
    provider: str = "google"
    invite_code: Optional[str] = None


@router.post("/google-oauth")
@limiter.limit("30/minute")
def oauth_login(request: Request, req: OAuthLoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_session)):
    """Auto-register or login OAuth users (Google/GitHub) and return a JWT token."""
    query = select(User).where(User.email == req.email)
    result = db.exec(query)
    user = result.first()

    admin_emails = [settings.ADMIN_EMAIL.lower(), "abishek2207@gmail.com", "abishekramamoorthy22@gmail.com"]
    is_admin = req.email.lower() in admin_emails
    needs_commit = False

    if not user:
        # Auto-register the oauth user
        user = User(
            email=req.email,
            hashed_password=None,  # No password for OAuth users
            name=req.name or req.email.split("@")[0],
            avatar=req.avatar,
            role="admin" if is_admin else "student",
            provider=req.provider,
            invite_code=uuid.uuid4().hex[:8].upper(),
        )
        
        # ── REFERRAL REWARD SYSTEM ───────────────────────────────────
        if req.invite_code:
            query = select(User).where(User.invite_code == req.invite_code)
            referer = db.exec(query).first()
            if referer:
                referer.xp = (referer.xp or 0) + 500
                user.xp = 500
                user.referred_by = referer.invite_code
                db.add(referer)
                
                # Check 10 referrals for Pro
                total_referral_count = db.exec(select(User).where(User.referred_by == referer.invite_code)).all()
                if len(total_referral_count) >= 9:
                    referer.is_pro = True
                    db.add(referer)
        # ─────────────────────────────────────────────────────────────
        db.add(user)
        needs_commit = True
    else:
        # ── IDENTITY SYNC: Harden existing user metadata ──────────────
        # Update name if changed
        if req.name and user.name != req.name:
            user.name = req.name
            needs_commit = True
            
        # Update avatar if changed
        if req.avatar and user.avatar != req.avatar:
            user.avatar = req.avatar
            needs_commit = True

        # Update admin role if needed (security hardening)
        if is_admin and user.role != "admin":
            user.role = "admin"
            needs_commit = True
        
        # Ensure provider is recorded
        if not user.provider or user.provider == "email":
            user.provider = req.provider
            needs_commit = True

    if needs_commit:
        db.commit()
        db.refresh(user)

    # Streak and last activity are now handled centrally by log_activity_internal below.

    # ── 🔓 Log Activity In Background ──────────────────────────────
    background_tasks.add_task(background_log_login, user.id, "user_login", f"Logged in via {req.provider.capitalize()}")
    # ─────────────────────────────────────────────────────────────

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "username": user.username,
            "role": user.role,
            "invite_code": user.invite_code,
            "is_pro": True,
            "chats_today": 0,
            "user_type": getattr(user, "user_type", "student") or "student",
            "is_onboarded": getattr(user, "is_onboarded", False) or False,
        }
    }
