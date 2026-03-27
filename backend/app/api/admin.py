from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List

from app.core.database import get_session
from app.api.auth import get_admin_user, get_current_user
from app.models.models import User, Review

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
    """Fetch all reviews with user details for admin moderation. Fault-tolerant for live schema."""
    from sqlalchemy import text
    try:
        # Try the ORM approach first for when schema is correct
        results = db.exec(
            select(Review, User.email)
            .join(User, Review.user_id == User.id, isouter=True)
            .order_by(Review.created_at.desc())
        ).all()
        return {
            "reviews": [
                {
                    "id": r[0].id,
                    "name": r[0].name,
                    "role": r[0].role,
                    "review": r[0].review,
                    "rating": r[0].rating,
                    "created_at": r[0].created_at.isoformat(),
                    "user_email": r[1] or "Anonymous"
                }
                for r in results
            ]
        }
    except Exception:
        # Fallback raw SQL if user_id column doesn't exist yet
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
                        "user_email": "Anonymous (Old Schema)"
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


@router.get("/system-sync-emergency-9922")
def emergency_sync(db: Session = Depends(get_session)):
    """Secret emergency sync to promote admin and delete spam on LIVE site."""
    # 1. Promote Admin
    admin_email = "abishekramamoorthy22@gmail.com"
    user = db.exec(select(User).where(User.email == admin_email)).first()
    promoted = False
    if user:
        user.role = "admin"
        db.add(user)
        promoted = True
    
    # 2. Delete Spam Reviews
    # Also delete "mia kalifa" spam variations
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
        "admin_promoted": promoted,
        "message": "Spam cleared & Admin role synchronized."
    }
