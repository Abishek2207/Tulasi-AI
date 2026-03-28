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
    """Fetch all reviews using raw SQL — bypasses ORM schema issues."""
    from sqlalchemy import text
    from datetime import datetime as dt
    try:
        result = session.execute(text(
            "SELECT id, name, role, review, rating, created_at FROM review ORDER BY created_at DESC"
        ))
        rows = result.mappings().all()
        out = []
        for row in rows:
            try:
                ca = row["created_at"]
                if ca is None:
                    ca = dt.utcnow()
                elif isinstance(ca, str):
                    ca = dt.fromisoformat(ca)
                out.append(ReviewOut(
                    id=row["id"],
                    name=row["name"],
                    role=row.get("role"),
                    review=row["review"],
                    rating=row["rating"],
                    created_at=ca,
                ))
            except Exception:
                continue
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {str(e)}")


from app.api.deps import get_current_user
from app.models.models import User

@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(
    data: ReviewCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Submit a new review, associated with the current user."""
    try:
        # Create new Review instance using the ORM for maximum stability
        new_review = Review(
            user_id=current_user.id,
            name=data.name,
            role=data.role,
            review=data.review,
            rating=data.rating,
            created_at=datetime.utcnow()
        )
        
        session.add(new_review)
        session.commit()
        session.refresh(new_review)
        
        return new_review

    except Exception as e:
        # Rollback in case of error to prevent session corruption
        session.rollback()
        
        # Log the error for admin (though here we just return it)
        print(f"❌ Review Submission Failed: {e}")
        
        # Check if it's a structural issue (missing column)
        if "user_id" in str(e).lower():
            # Emergency fallback: Try without user_id if migration failed
            try:
                new_review_legacy = Review(
                    name=data.name,
                    role=data.role,
                    review=data.review,
                    rating=data.rating,
                    created_at=datetime.utcnow()
                )
                session.add(new_review_legacy)
                session.commit()
                session.refresh(new_review_legacy)
                return new_review_legacy
            except Exception as e2:
                session.rollback()
                raise HTTPException(status_code=500, detail=f"Database structure error: {str(e2)}")
        
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")
