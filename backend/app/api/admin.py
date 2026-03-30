from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List

from app.core.database import get_session
from app.api.auth import get_admin_user, get_current_user
from app.models.models import User, Review, ActivityLog

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


@router.get("/reviews")
def get_admin_reviews(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Fetch all reviews with user details for admin moderation."""
    from sqlalchemy import text
    try:
        # Try with email column (new schema)
        res = db.execute(text("SELECT id, name, email, role, review, rating, created_at FROM review ORDER BY created_at DESC"))
        rows = res.mappings().all()
        return {
            "reviews": [
                {
                    "id": row["id"],
                    "name": row["name"] or "Anonymous",
                    "role": row.get("role"),
                    "review": row["review"],
                    "rating": row["rating"],
                    "created_at": str(row["created_at"]),
                    "user_email": row.get("email") or "Anonymous"
                }
                for row in rows
            ]
        }
    except Exception:
        # Fallback: old schema without email
        try:
            res = db.execute(text("SELECT id, name, role, review, rating, created_at FROM review ORDER BY created_at DESC"))
            rows = res.mappings().all()
            return {
                "reviews": [
                    {
                        "id": row["id"],
                        "name": row["name"],
                        "role": row.get("role"),
                        "review": row["review"],
                        "rating": row["rating"],
                        "created_at": str(row["created_at"]),
                        "user_email": "Anonymous"
                    }
                    for row in rows
                ]
            }
        except Exception as e:
            return {"error": str(e), "reviews": []}


@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Delete a review (Admin Only)."""
    review = db.get(Review, review_id)
    if not review:
        return {"error": "Review not found"}
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}


@router.get("/activity")
def get_global_activity(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Fetch global user activity logs with user details for admin review."""
    results = db.exec(
        select(ActivityLog, User.name, User.email)
        .join(User, ActivityLog.user_id == User.id, isouter=True)
        .order_by(ActivityLog.created_at.desc())
        .limit(100) # Changed from 200 to 100 as per instruction
    ).all()
    
    return {
        "activity": [
            {
                "id": act[0].id,
                "user_name": act[1] or "Unknown",
                "user_email": act[2] or "Unknown",
                "action_type": act[0].action_type,
                "title": act[0].title,
                "metadata": act[0].metadata_json,
                "xp": act[0].xp_earned,
                "created_at": act[0].created_at.isoformat()
            }
            for act in results
        ]
    }


@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Fetch 14-day aggregated analytics with robust date parsing for SQLite."""
    from datetime import datetime, timedelta
    
    try:
        # Range: last 14 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=13)
        
        # 1. User Growth (Daily Signups)
        users = db.exec(select(User).where(User.created_at >= start_date)).all()
        
        # 2. Daily Activity (Pulse)
        logs = db.exec(select(ActivityLog).where(ActivityLog.created_at >= start_date)).all()
        
        # Helper for SQLite date handling
        def to_day(dt):
            if not dt: return None
            # If it's already a datetime/date object (e.g. from ORM on Postgres)
            if hasattr(dt, 'strftime'):
                return dt.strftime("%Y-%m-%d")
            # If it's a string (e.g. from SQLite)
            if isinstance(dt, str):
                return dt.split(" ")[0] # Handles "2024-03-24 15:30:00" -> "2024-03-24"
            return str(dt).split(" ")[0]

        # Aggregation mapping
        daily_stats = {}
        for i in range(14):
            date_str = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            daily_stats[date_str] = {"date": date_str, "signups": 0, "actions": 0}
            
        for u in users:
            try:
                day = to_day(u.created_at)
                if day in daily_stats:
                    daily_stats[day]["signups"] += 1
            except Exception as e:
                print(f"User growth aggregation warning: {e}")
                
        for log in logs:
            try:
                day = to_day(log.created_at)
                if day in daily_stats:
                    daily_stats[day]["actions"] += 1
            except Exception as e:
                print(f"Log activity aggregation warning: {e}")
                
        growth_history = [daily_stats[d] for d in sorted(daily_stats.keys())]
        
        # 3. User Segmentation (Pro vs Free)
        all_users = db.exec(select(User)).all()
        pro_count = sum(1 for u in all_users if getattr(u, 'is_pro', False))
        free_count = len(all_users) - pro_count
        
        return {
            "growth": growth_history,
            "segmentation": [
                {"name": "Pro 👑", "value": pro_count, "color": "#A78BFA"},
                {"name": "Free", "value": free_count, "color": "rgba(255,255,255,0.1)"}
            ],
            "total_users": len(all_users),
            "pro_percentage": round((pro_count / len(all_users) * 100), 1) if all_users else 0
        }
    except Exception as e:
        import traceback
        print(f"Analytics aggregation error: {e}")
        print(traceback.format_exc())
        return {"growth": [], "segmentation": [], "error": str(e), "success": False}


@router.get("/hackathons")
def get_admin_hackathons(
    limit: int = 100, 
    offset: int = 0, 
    db: Session = Depends(get_session), 
    admin: User = Depends(get_admin_user)
):
    """Fetch hackathons with pagination for admin management."""
    from app.models.models import Hackathon
    from sqlmodel import func
    
    total = db.exec(select(func.count(Hackathon.id))).one()
    hackathons = db.exec(
        select(Hackathon)
        .order_by(Hackathon.id.desc())
        .offset(offset)
        .limit(limit)
    ).all()
    
    return {"hackathons": hackathons, "total": total}


class CreateHackathonRequest(BaseModel):
    name: str
    organizer: str
    description: str
    prize: str
    deadline: str
    link: str
    tags: str = ""
    status: str = "Open"
    image_url: str = ""


@router.post("/hackathons")
def create_hackathon(req: CreateHackathonRequest, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Add a new hackathon (Admin Only)."""
    from app.models.models import Hackathon
    h = Hackathon(
        name=req.name,
        organizer=req.organizer,
        description=req.description,
        prize=req.prize,
        prize_pool=req.prize,
        deadline=req.deadline,
        link=req.link,
        registration_link=req.link,
        tags=req.tags,
        status=req.status,
        image_url=req.image_url or "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=60"
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return h


@router.delete("/hackathons/{hackathon_id}")
def delete_hackathon(hackathon_id: int, db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """Delete a hackathon (Admin Only)."""
    from app.models.models import Hackathon
    h = db.get(Hackathon, hackathon_id)
    if not h:
        return {"error": "Hackathon not found"}
    db.delete(h)
    db.commit()
    return {"message": "Hackathon deleted successfully"}


@router.get("/system-sync-emergency-9922")
def emergency_sync(db: Session = Depends(get_session)):
    """Secret emergency sync to promote admin and delete spam on LIVE site."""
    from app.models.models import User
    # 1. Promote Admin
    admin_emails = ["abishekramamoorthy22@gmail.com", "abishek.ramamoorthy.dev@gmail.com"]
    for email in admin_emails:
        user = db.exec(select(User).where(User.email == email)).first()
        if user:
            user.role = "admin"
            db.add(user)
    
    # 2. Delete Spam Reviews
    from sqlalchemy import text
    try:
        db.execute(text("DELETE FROM review WHERE review LIKE '%mia kalifa%'"))
        db.execute(text("DELETE FROM review WHERE name LIKE '%mia kalifa%'"))
        db.execute(text("DELETE FROM review WHERE review LIKE '%mia khalifa%'"))
        db.execute(text("DELETE FROM review WHERE name LIKE '%mia khalifa%'"))
        db.execute(text("DELETE FROM review WHERE role LIKE '%corn actor%'"))
    except:
        pass
        
    db.commit()
    return {
        "status": "success",
        "message": "Spam cleared & Admin role synchronized."
    }
