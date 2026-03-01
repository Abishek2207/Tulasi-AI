from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/groups", tags=["Collaboration Groups"])

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    user_id: str

@router.get("/")
async def list_groups():
    return [
        {"id": "1", "name": "Frontend Wizards", "members": 12, "active": True},
        {"id": "2", "name": "AI Explorers", "members": 8, "active": False}
    ]

@router.post("/create")
async def create_group(group: GroupCreate):
    return {"status": "success", "group_id": "3", "name": group.name}

@router.get("/{group_id}/members")
async def get_group_members(group_id: str):
    return [{"id": "1", "name": "Abishek", "role": "admin"}]
