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
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = Field(None, max_length=100)
    review: str = Field(..., min_length=10, max_length=1000)
    rating: int = Field(..., ge=1, le=5)

from pydantic import validator

class ReviewOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
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


from app.api.deps import get_admin_user
from app.models.models import User

@router.get("", response_model=List[ReviewOut])
def get_reviews(session: Session = Depends(get_session)):
    """Fetch the latest 10 reviews for public display (Email intentionally hidden)."""
    from sqlalchemy import text
    try:
        # Try a direct query since Review model might be out of sync with raw email col
        res = session.execute(text(
            "SELECT id, name, role, review, rating, created_at FROM review ORDER BY created_at DESC LIMIT 10"
        ))
        rows = res.mappings().all()
        reviews = []
        for row in rows:
            ca = row["created_at"]
            if isinstance(ca, str):
                try: ca = datetime.fromisoformat(ca.replace("Z", "+00:00"))
                except: ca = datetime.utcnow()
            reviews.append(ReviewOut(
                id=row["id"], name=row["name"], email=None,
                role=row.get("role"), review=row["review"],
                rating=row["rating"], created_at=ca or datetime.utcnow()
            ))
        return reviews
    except Exception as e:
        print(f"❌ Error fetching reviews: {e}")
        return session.exec(select(Review).order_by(Review.created_at.desc()).limit(10)).all()


@router.post("", response_model=ReviewOut, status_code=201)
def submit_review(
    data: ReviewCreate,
    session: Session = Depends(get_session),
):
    """
    Submit a new review — NO LOGIN REQUIRED.
    Name and optional email are captured from the form.
    Reviews are only visible in the admin dashboard (not public listing).
    """
    from sqlalchemy import text

    now = datetime.utcnow()
    reviewer_name = data.name.strip() or "Anonymous"
    reviewer_email = (data.email or "").strip() or None

    try:
        # Try ORM insert first
        new_review = Review(
            user_id=None,
            name=reviewer_name,
            role=data.role,
            review=data.review,
            rating=data.rating,
            created_at=now,
        )
        session.add(new_review)
        session.commit()
        session.refresh(new_review)

        # Try to update email if column exists
        try:
            session.execute(text(
                "UPDATE review SET email = :email WHERE id = :id"
            ), {"email": reviewer_email, "id": new_review.id})
            session.commit()
        except Exception:
            pass

        return ReviewOut(
            id=new_review.id,
            name=new_review.name,
            email=reviewer_email,
            role=new_review.role,
            review=new_review.review,
            rating=new_review.rating,
            created_at=new_review.created_at,
        )

    except Exception as e:
        session.rollback()
        error_msg = str(e)
        print(f"❌ SUBMIT ERROR (ORM): {error_msg}")

        # Raw SQL fallback
        try:
            session.execute(text(
                "INSERT INTO review (name, email, role, review, rating, created_at) VALUES (:n, :e, :rol, :rev, :rat, :c)"
            ), {
                "n": reviewer_name,
                "e": reviewer_email,
                "rol": data.role,
                "rev": data.review,
                "rat": data.rating,
                "c": now,
            })
            session.commit()
            res = session.execute(text(
                "SELECT id, name, email, role, review, rating, created_at FROM review ORDER BY id DESC LIMIT 1"
            ))
            row = res.mappings().first()
            if row:
                ca = row["created_at"]
                if isinstance(ca, str):
                    ca = datetime.fromisoformat(ca)
                return ReviewOut(
                    id=row["id"],
                    name=row["name"],
                    email=row.get("email"),
                    role=row.get("role"),
                    review=row["review"],
                    rating=row["rating"],
                    created_at=ca or now,
                )
        except Exception as e2:
            session.rollback()
            # Last-resort: insert without email column
            try:
                session.execute(text(
                    "INSERT INTO review (name, role, review, rating, created_at) VALUES (:n, :rol, :rev, :rat, :c)"
                ), {"n": reviewer_name, "rol": data.role, "rev": data.review, "rat": data.rating, "c": now})
                session.commit()
                res = session.execute(text(
                    "SELECT id, name, role, review, rating, created_at FROM review ORDER BY id DESC LIMIT 1"
                ))
                row = res.mappings().first()
                if row:
                    ca = row["created_at"]
                    if isinstance(ca, str):
                        ca = datetime.fromisoformat(ca)
                    return ReviewOut(
                        id=row["id"], name=row["name"], email=None,
                        role=row.get("role"), review=row["review"],
                        rating=row["rating"], created_at=ca or now,
                    )
            except Exception as e3:
                session.rollback()
                return JSONResponse(status_code=500, content={"error": f"Review save failed: {str(e3)}"})

        return JSONResponse(status_code=500, content={"error": error_msg})
