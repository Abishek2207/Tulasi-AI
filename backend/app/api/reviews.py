"""
Tulasi AI — Public Reviews API
- GET  /reviews   : Return latest 10 reviews (email hidden for privacy)
- POST /reviews   : Submit a review (public endpoint, optional XP award if email matches)
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

from app.core.database import get_session
from app.models.models import Review, User
from app.api.activity import log_activity_internal

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = Field(None, max_length=100)
    review: str = Field(..., min_length=10, max_length=1000)
    rating: int = Field(..., ge=1, le=5)


class ReviewOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    role: Optional[str] = None
    review: str
    rating: int
    created_at: datetime

    @validator("created_at", pre=True)
    def parse_datetime(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace("Z", "+00:00"))
            except ValueError:
                return datetime.utcnow()
        return v

    class Config:
        orm_mode = True


# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_dt(val) -> datetime:
    """Safely coerce a string or datetime to a datetime object."""
    if val is None:
        return datetime.utcnow()
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val).replace("Z", "+00:00"))
    except Exception:
        return datetime.utcnow()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[ReviewOut])
def get_reviews(session: Session = Depends(get_session)):
    """Return the latest 10 approved reviews for public display (email hidden)."""
    try:
        reviews_raw = session.exec(
            select(Review).order_by(Review.created_at.desc()).limit(10)
        ).all()

        return [
            ReviewOut(
                id=r.id,
                name=r.name,
                email=None,          # Always hide email on public endpoint
                role=r.role,
                review=r.review,
                rating=r.rating,
                created_at=_parse_dt(r.created_at),
            )
            for r in reviews_raw
        ]
    except Exception as e:
        print(f"❌ [Reviews] GET failed: {e}")
        return []


@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(
    data: ReviewCreate,
    session: Session = Depends(get_session),
):
    """
    Submit a new platform review (public — no auth required).
    If the supplied email matches a registered user, award 100 XP.
    """
    now = datetime.utcnow()
    reviewer_name = data.name.strip() or "Anonymous"
    reviewer_email = (data.email or "").strip() or None

    # Build the ORM object
    new_review = Review(
        user_id=None,
        name=reviewer_name,
        email=reviewer_email,
        role=data.role,
        review=data.review,
        rating=data.rating,
        created_at=now,
    )

    # Optional: link to a registered user by email and award XP
    if reviewer_email:
        try:
            user: Optional[User] = session.exec(
                select(User).where(User.email == reviewer_email)
            ).first()
            if user:
                new_review.user_id = user.id
                user.xp = (user.xp or 0) + 100
                session.add(user)
                try:
                    log_activity_internal(
                        user, session,
                        "review_submitted",
                        "Awarded 100 XP for platform review",
                        None,
                    )
                except Exception as log_err:
                    print(f"⚠️ [Reviews] XP activity log failed (non-fatal): {log_err}")
        except Exception as lookup_err:
            print(f"⚠️ [Reviews] User lookup failed (non-fatal): {lookup_err}")

    try:
        session.add(new_review)
        session.commit()
        session.refresh(new_review)

        return ReviewOut(
            id=new_review.id,
            name=new_review.name,
            email=new_review.email,
            role=new_review.role,
            review=new_review.review,
            rating=new_review.rating,
            created_at=_parse_dt(new_review.created_at),
        )

    except Exception as orm_err:
        session.rollback()
        print(f"❌ [Reviews] ORM insert failed: {orm_err}")

        # ── Raw SQL fallback (handles email column presence differences) ──
        from sqlalchemy import text
        try:
            session.execute(
                text(
                    "INSERT INTO review (name, role, review, rating, created_at) "
                    "VALUES (:name, :role, :review, :rating, :created_at)"
                ),
                {
                    "name": reviewer_name,
                    "role": data.role,
                    "review": data.review,
                    "rating": data.rating,
                    "created_at": now,
                },
            )
            session.commit()

            row = session.execute(
                text(
                    "SELECT id, name, role, review, rating, created_at "
                    "FROM review ORDER BY id DESC LIMIT 1"
                )
            ).mappings().first()

            if row:
                return ReviewOut(
                    id=row["id"],
                    name=row["name"],
                    email=None,
                    role=row.get("role"),
                    review=row["review"],
                    rating=row["rating"],
                    created_at=_parse_dt(row["created_at"]),
                )
        except Exception as sql_err:
            session.rollback()
            print(f"❌ [Reviews] SQL fallback also failed: {sql_err}")
            return JSONResponse(
                status_code=500,
                content={"error": "Review could not be saved. Please try again later."},
            )

        # ORM failed but SQL also returned no row (very unlikely)
        return JSONResponse(
            status_code=500,
            content={"error": "Review saved but could not be retrieved."},
        )
