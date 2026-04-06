from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.models import User
import os
import io
try:
    from PIL import Image
except ImportError:
    Image = None
from fastapi import File, UploadFile
from fastapi.responses import StreamingResponse

import re
from pydantic import BaseModel, constr
from typing import Optional

class SetUsernameRequest(BaseModel):
    username: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    avatar: Optional[str] = None
    department: Optional[str] = None
    target_role: Optional[str] = None
    interest_areas: Optional[str] = None

router = APIRouter()


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "name": current_user.name,
        "bio": current_user.bio,
        "skills": current_user.skills,
        "avatar": current_user.avatar,
        "role": current_user.role,
        "is_pro": current_user.is_pro,
        "xp": current_user.xp,
        "level": current_user.level,
        "department": current_user.department,
        "target_role": current_user.target_role,
        "interest_areas": current_user.interest_areas,
    }


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if data.name is not None: current_user.name = data.name
    if data.bio is not None: current_user.bio = data.bio
    if data.skills is not None: current_user.skills = data.skills
    if data.avatar is not None: current_user.avatar = data.avatar
    if data.department is not None: current_user.department = data.department
    if data.target_role is not None: current_user.target_role = data.target_role
    if data.interest_areas is not None: current_user.interest_areas = data.interest_areas
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return {"status": "success", "user": {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "avatar": current_user.avatar,
        "email": current_user.email
    }}


@router.post("/set-username")
def set_username(
    data: SetUsernameRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.username:
        raise HTTPException(status_code=400, detail="Username already set")
        
    username = data.username.lower()
    if not re.match(r"^[a-z0-9_]{3,20}$", username):
        raise HTTPException(status_code=400, detail="Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores")
        
    existing = db.exec(select(User).where(User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username is already taken")
        
    current_user.username = username
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "username": current_user.username}


@router.get("/search")
def search_users(q: str, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Search for users by username."""
    if not q or len(q) < 2:
        return {"users": []}
    
    # Needs wildcard for partial match
    statement = select(User).where(
        (User.id != current_user.id) &
        (User.username.ilike(f"%{q}%"))
    ).limit(50)
    users = db.exec(statement).all()
    
    # Map following logic
    from app.models.models import UserFollow
    follows = db.exec(select(UserFollow).where(UserFollow.follower_id == current_user.id)).all()
    follow_map = {f.following_id: f for f in follows}
    
    results = []
    for u in users:
        f = follow_map.get(u.id)
        results.append({
            "id": u.id,
            "username": u.username,
            "name": u.name,
            "avatar": u.avatar,
            "is_following": f.status == "accepted" if f else False,
            "request_status": f.status if f else "none"
        })
        
    return {"users": results}


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


@router.post("/avatar/remove-bg")
async def remove_avatar_bg(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered background removal for user avatars.
    Converts white/near-white backgrounds to transparent.
    """
    if Image is None:
        raise HTTPException(status_code=500, detail="Pillow library not installed on server.")
    
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check if the pixel is white or near white
            if item[0] > 235 and item[1] > 235 and item[2] > 235:
                newData.append((255, 255, 255, 0)) # Fully transparent
            elif item[0] > 215 and item[1] > 215 and item[2] > 215:
                # Soft edge
                avg = (item[0] + item[1] + item[2]) / 3
                alpha = int(255 - ((avg - 215) / 20) * 255)
                alpha = max(0, min(255, alpha))
                newData.append((item[0], item[1], item[2], alpha))
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Crop empty space
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

