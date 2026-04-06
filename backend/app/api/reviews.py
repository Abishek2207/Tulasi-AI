"""
Tulasi AI — Public Reviews API
- GET  /reviews   : Return latest 10 reviews (email hidden for privacy)
- POST /reviews   : Submit a review (public endpoint, optional XP award if email matches)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import Review, User
from app.api.activity import log_activity_internal
from app.core.cache import review_cache

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
    is_approved: bool = False
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
        from_attributes = True  # Pydantic v2 (replaces orm_mode)


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
    """Return the latest approved reviews for public display."""
    # 1. Check Cache
    cached_reviews = review_cache.get("public_reviews")
    if cached_reviews:
        return cached_reviews

    try:
        reviews_raw = session.exec(
            select(Review)
            .where(Review.is_approved == True)
            .order_by(Review.created_at.desc())
            .limit(50)
        ).all()

        result = [
            ReviewOut(
                id=r.id,
                name=r.name,
                email=None,          # Always hide email on public endpoint
                role=r.role,
                review=r.review,
                rating=r.rating,
                is_approved=True,
                created_at=_parse_dt(r.created_at),
            )
            for r in reviews_raw
        ]
        
        # 2. Set Cache
        review_cache.set("public_reviews", result)
        return result
    except Exception as e:
        print(f"❌ [Reviews] GET failed: {e}")
        return []

@router.get("/me", response_model=ReviewOut)
def get_my_review(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Fetch the current logged in user's review if it exists."""
    review = session.exec(
        select(Review).where(Review.user_id == current_user.id)
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="No review found.")
        
    return ReviewOut(
        id=review.id,
        name=review.name,
        email=review.email,
        role=review.role,
        review=review.review,
        rating=review.rating,
        is_approved=review.is_approved,
        created_at=_parse_dt(review.created_at),
    )


@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(
    data: ReviewCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a new platform review. Only logged-in users.
    Limits to 1 review per user.
    """
    # 1. Enforce Unique Constraint
    existing = session.exec(
        select(Review).where(Review.user_id == current_user.id)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="You have already submitted a review. You can edit it from your dashboard."
        )

    now = datetime.utcnow()
    # Use user's real email, name from payload if provided else user's name
    reviewer_name = data.name.strip() or current_user.name or "Anonymous"
    reviewer_email = current_user.email

    new_review = Review(
        user_id=current_user.id,
        name=reviewer_name,
        email=reviewer_email,
        role=data.role,
        review=data.review,
        rating=data.rating,
        is_approved=False,
        created_at=now,
    )

    try:
        session.add(new_review)
        current_user.xp = (current_user.xp or 0) + 100
        session.add(current_user)
        session.commit()
        session.refresh(new_review)
        
        try:
            log_activity_internal(
                current_user, session,
                "review_submitted",
                "Awarded 100 XP for platform review",
                None,
            )
        except Exception:
            pass

        return ReviewOut(
            id=new_review.id,
            name=new_review.name,
            email=new_review.email,
            role=new_review.role,
            review=new_review.review,
            rating=new_review.rating,
            is_approved=new_review.is_approved,
            created_at=_parse_dt(new_review.created_at),
        )

    except Exception as orm_err:
        session.rollback()
        raise HTTPException(status_code=500, detail="Failed to save review.")


@router.put("/{review_id}", response_model=ReviewOut)
def edit_review(
    review_id: int,
    data: ReviewCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Edit own review. Resets approval status to pending."""
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to edit this review.")

    review.name = data.name.strip() or current_user.name or "Anonymous"
    review.role = data.role
    review.review = data.review
    review.rating = data.rating
    review.is_approved = False  # Need admin to re-approve
    
    session.add(review)
    session.commit()
    session.refresh(review)
    
    return ReviewOut(
        id=review.id,
        name=review.name,
        email=review.email,
        role=review.role,
        review=review.review,
        rating=review.rating,
        is_approved=review.is_approved,
        created_at=_parse_dt(review.created_at),
    )
@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Delete a review."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    session.delete(review)
    session.commit()
    return {"success": True, "message": f"Review {review_id} deleted."}


@router.patch("/approve/{review_id}")
def approve_review(
    review_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Admin-only: Approve a pending review."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    review.is_approved = True
    session.add(review)
    session.commit()
    return {"success": True, "message": f"Review {review_id} approved."}


class SeedReview(BaseModel):
    name: str
    role: Optional[str] = None
    review: str
    rating: int = 5


@router.post("/seed", status_code=201)
def seed_reviews(
    reviews: List[SeedReview],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Admin-only: Bulk insert reviews with auto-approval (for DB migration)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only.")
    
    inserted = 0
    for r in reviews:
        new_review = Review(
            name=r.name,
            role=r.role,
            review=r.review,
            rating=r.rating,
            is_approved=True,    # Auto-approve seeded reviews
            is_featured=False,
            created_at=datetime.utcnow(),
        )
        session.add(new_review)
        inserted += 1
    
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")
    
    return {"success": True, "inserted": inserted}


@router.post("/seed-public", status_code=201)
def seed_reviews_public(
    reviews: List[SeedReview],
    request: Request,
    session: Session = Depends(get_session),
):
    """
    Public seed endpoint protected by SEED_SECRET header.
    POST /api/reviews/seed-public  with header  X-Seed-Secret: <SEED_SECRET env value>
    """
    import os
    seed_secret = os.environ.get("SEED_SECRET", "")
    incoming = request.headers.get("X-Seed-Secret", "")
    if not seed_secret or incoming != seed_secret:
        raise HTTPException(status_code=403, detail="Invalid seed secret.")

    inserted = 0
    for r in reviews:
        exists = session.exec(
            select(Review).where(Review.name == r.name, Review.review == r.review)
        ).first()
        if exists:
            continue
        new_review = Review(
            name=r.name, role=r.role, review=r.review, rating=r.rating,
            is_approved=True, is_featured=False, created_at=datetime.utcnow(),
        )
        session.add(new_review)
        inserted += 1

    try:
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")

    return {"success": True, "inserted": inserted}


@router.post("/approve-all", status_code=200)
def approve_all_reviews(
    request: Request,
    session: Session = Depends(get_session),
):
    """Admin-only: Approve all pending reviews (Migration helper)."""
    import os
    seed_secret = os.environ.get("SEED_SECRET", "")
    incoming = request.headers.get("X-Seed-Secret", "")
    if not seed_secret or incoming != seed_secret:
        raise HTTPException(status_code=403, detail="Invalid seed secret.")

    try:
        from sqlmodel import update
        # Using SQLAlchemy update style for efficiency
        session.exec(
            update(Review).where(Review.is_approved == False).values(is_approved=True)
        )
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Approve-all failed: {str(e)}")

    return {"success": True, "message": "All pending reviews approved."}


@router.post("/reset-and-seed", status_code=201)
def reset_and_seed_reviews(
    reviews: List[SeedReview],
    request: Request,
    session: Session = Depends(get_session),
):
    """Admin-only: Wipe and re-seed 10 reviews (Cleanup helper)."""
    import os
    from sqlalchemy import text
    seed_secret = os.environ.get("SEED_SECRET", "")
    incoming = request.headers.get("X-Seed-Secret", "")
    if not seed_secret or incoming != seed_secret:
        raise HTTPException(status_code=403, detail="Invalid seed secret.")

    try:
        # Wipe all existing reviews
        session.exec(text("DELETE FROM review"))
        
        # Reset ID sequence if Postgres
        try:
            session.exec(text("ALTER SEQUENCE review_id_seq RESTART WITH 1"))
        except:
            pass # Skip if not pg/sequence doesn't exist
            
        # Seed new ones
        inserted = 0
        for r in reviews:
            new_review = Review(
                name=r.name, role=r.role, review=r.review, rating=r.rating,
                is_approved=True, is_featured=False, created_at=datetime.utcnow(),
            )
            session.add(new_review)
            inserted += 1
        
        session.commit()
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Reset and Seed failed: {str(e)}")

    return {"success": True, "inserted": inserted}
