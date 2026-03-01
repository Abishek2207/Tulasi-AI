from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class AuthRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    avatar: Optional[str] = None

@router.post("/login")
async def login(request: AuthRequest):
    # This will be handled by Supabase on the frontend, 
    # but we provide the endpoint for backend-to-backend or direct API calls.
    return {"status": "success", "message": "Login successful", "user": {"id": "1", "email": request.email}}

@router.post("/register")
async def register(request: AuthRequest):
    return {"status": "success", "message": "Verification email sent"}

@router.get("/me", response_model=UserProfile)
async def get_current_user():
    return UserProfile(id="1", email="user@tulasiai.com", name="Tulasi Student")
