from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

from app.core.database import get_session
from app.models.models import Review

router = APIRouter()


class ReviewCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    role: Optional[str] = Field(None, max_length=100)
    review: str = Field(..., min_length=10, max_length=1000)
    rating: int = Field(..., ge=1, le=5)

    @validator("name")
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty.")
        return v.strip()

    @validator("review")
    def review_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Review cannot be empty.")
        return v.strip()

    @validator("role", pre=True, always=True)
    def sanitize_role(cls, v):
        if v:
            return v.strip() or None
        return None


class ReviewOut(BaseModel):
    id: int
    name: str
    role: Optional[str]
    review: str
    rating: int
    created_at: datetime

    class Config:
        orm_mode = True


@router.get("", response_model=List[ReviewOut])
def get_reviews(session: Session = Depends(get_session)):
    """Fetch all reviews, sorted by newest first. Fault-tolerant fallback for old schemas."""
    try:
        reviews = session.exec(
            select(Review).order_by(Review.created_at.desc())
        ).all()
        return reviews
    except Exception:
        # Fallback: use raw SQL in case ORM fails due to schema mismatch (e.g. missing user_id column)
        from sqlalchemy import text
        try:
            result = session.execute(text(
                "SELECT id, name, role, review, rating, created_at FROM review ORDER BY created_at DESC"
            ))
            rows = result.mappings().all()
            from datetime import datetime
            return [
                ReviewOut(
                    id=row["id"],
                    name=row["name"],
                    role=row.get("role"),
                    review=row["review"],
                    rating=row["rating"],
                    created_at=row["created_at"] if isinstance(row["created_at"], datetime) else datetime.fromisoformat(str(row["created_at"])) if row["created_at"] else datetime.utcnow(),
                )
                for row in rows
            ]
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"DB error: {str(e2)}")


from app.api.auth import get_current_user
from app.models.models import User

@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(
    data: ReviewCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Submit a new review, associated with the current user."""
    review = Review(
        user_id=current_user.id,
        name=data.name,
        role=data.role,
        review=data.review,
        rating=data.rating,
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review
