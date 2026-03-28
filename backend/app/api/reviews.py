from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

from app.core.database import get_session
from app.models.models import Review

router = APIRouter()


from fastapi.responses import JSONResponse

class ReviewCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    role: Optional[str] = Field(None, max_length=100)
    review: str = Field(..., min_length=10, max_length=1000)
    rating: int = Field(..., ge=1, le=5)

from pydantic import validator

class ReviewOut(BaseModel):
    id: int
    name: str
    role: Optional[str]
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
    # 🔍 DEBUG Check: Log payload for Render debugging
    print(f"DEBUG: Review Submission - User: {current_user.email}")
    print(f"Payload: {data.json()}")

    try:
        # Validate rating range (1-5)
        if not (1 <= data.rating <= 5):
            return JSONResponse(status_code=400, content={"error": "Rating must be between 1 and 5"})

        # Save review using ORM
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
        session.rollback()
        error_msg = str(e)
        print(f"❌ SUBMIT ERROR: {error_msg}")
        
        # 💾 Database Fix: Auto-recovery if column missing
        if "user_id" in error_msg.lower():
            try:
                from sqlalchemy import text
                now = datetime.utcnow()
                session.execute(text(
                    "INSERT INTO review (name, role, review, rating, created_at) VALUES (:n, :rol, :rev, :rat, :c)"
                ), {"n": data.name, "rol": data.role, "rev": data.review, "rat": data.rating, "c": now})
                session.commit()
                res = session.execute(text("SELECT id, name, role, review, rating, created_at FROM review ORDER BY id DESC LIMIT 1"))
                row = res.mappings().first()
                if row:
                    return ReviewOut(id=row["id"], name=row["name"], role=row.get("role"), review=row["review"], rating=row["rating"], created_at=row["created_at"])
            except Exception as e2:
                session.rollback()
                return JSONResponse(status_code=500, content={"error": f"Critical SQL Failure: {str(e2)}"})

        # 🎯 FINAL RESULT: Standardised error JSON
        return JSONResponse(status_code=500, content={"error": error_msg})
