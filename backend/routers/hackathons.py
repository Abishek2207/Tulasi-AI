from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/hackathons", tags=["Hackathons"])

class Hackathon(BaseModel):
    id: str
    title: str
    description: str
    link: str
    deadline: str
    tags: List[str]

@router.get("/")
async def get_hackathons():
    # Logic to fetch from database or scrap from external sources
    return [
        {
            "id": "1",
            "title": "Google Solution Challenge 2026",
            "description": "Build solutions for UN Sustainable Development Goals.",
            "link": "https://developers.google.com/community/solutions-challenge",
            "deadline": "2026-04-30",
            "tags": ["Global", "Social Impact", "Google"]
        }
    ]

@router.post("/bookmark/{hackathon_id}")
async def bookmark_hackathon(hackathon_id: str, user_id: str):
    return {"status": "bookmarked"}
