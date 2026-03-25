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
    """Fetch all reviews, sorted by newest first."""
    reviews = session.exec(
        select(Review).order_by(Review.created_at.desc())
    ).all()
    return reviews


@router.get("/init-db")
def force_init_db():
    from app.core.database import engine
    from sqlmodel import text
    try:
        with engine.begin() as conn:
            conn.execute(text('''
                CREATE TABLE IF NOT EXISTS review (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    role VARCHAR,
                    review VARCHAR NOT NULL,
                    rating INTEGER NOT NULL,
                    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            '''))
        return {"success": True, "message": "Raw SQL schema applied successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(data: ReviewCreate, session: Session = Depends(get_session)):
    """Submit a new review."""
    review = Review(
        name=data.name,
        role=data.role,
        review=data.review,
        rating=data.rating,
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review
