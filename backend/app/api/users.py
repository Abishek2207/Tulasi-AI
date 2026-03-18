from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import UserResponse
from typing import List

router = APIRouter()

# In a real app we'd verify the JWT token here using a dependency
# For now, these are placeholder structures

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    # Placeholder: assuming user ID 1 is logged in
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    # Placeholder: Only Admin should access this
    users = db.query(User).all()
    return users
