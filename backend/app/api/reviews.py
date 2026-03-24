from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_session
from app.models.models import Review

router = APIRouter()

class ReviewCreate(BaseModel):
    name: str
    role: str = ""
    company: str = ""
    review: str
    rating: int = 5

class ReviewResponse(BaseModel):
    id: int
    name: str
    role: str
    company: str
    review: str
    rating: int
    created_at: datetime

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    data: ReviewCreate,
    session: Session = Depends(get_session)
):
    try:
        new_review = Review(
            name=data.name,
            role=data.role,
            company=data.company,
            review=data.review,
            rating=data.rating,
            is_approved=True  # Auto-approve for the scope of this project
        )
        session.add(new_review)
        session.commit()
        session.refresh(new_review)
        return new_review
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit review: {str(e)}"
        )

@router.get("/", response_model=List[ReviewResponse])
def get_reviews(session: Session = Depends(get_session)):
    try:
        # Fetch latest approved reviews, descending order
        statement = select(Review).where(Review.is_approved == True).order_by(Review.created_at.desc())
        results = session.exec(statement).all()
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reviews: {str(e)}"
        )
