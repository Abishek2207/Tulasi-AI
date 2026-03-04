"""
Hackathons feed endpoint — returns curated hackathon data.
In production, this can be enriched via web scraping or Devpost/MLH APIs.
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class Hackathon(BaseModel):
    id: str
    name: str
    organizer: str
    prize: str
    deadline: str
    participants: str
    tags: List[str]
    status: str  # live | upcoming | past
    link: str
    description: str


HACKATHONS: List[dict] = [
    {
        "id": "1",
        "name": "Google AI Hackathon 2026",
        "organizer": "Google",
        "prize": "$50,000",
        "deadline": "2026-03-20",
        "participants": "12,400+",
        "tags": ["AI", "ML", "Open Source"],
        "status": "upcoming",
        "link": "https://events.withgoogle.com",
        "description": "Build innovative AI solutions using Google Cloud Vertex AI and Gemini models.",
    },
    {
        "id": "2",
        "name": "HackAI — India Edition",
        "organizer": "Devfolio",
        "prize": "₹5,00,000",
        "deadline": "2026-03-14",
        "participants": "8,200+",
        "tags": ["AI", "SaaS", "EdTech"],
        "status": "live",
        "link": "https://devfolio.co",
        "description": "India's largest AI hackathon. Build products that solve real problems.",
    },
    {
        "id": "3",
        "name": "MLH Global Hack Week",
        "organizer": "Major League Hacking",
        "prize": "Swag + Internships",
        "deadline": "2026-03-10",
        "participants": "50,000+",
        "tags": ["Open Source", "Community", "All Tracks"],
        "status": "live",
        "link": "https://mlh.io",
        "description": "A week-long global event with daily challenges and mini-hacks.",
    },
    {
        "id": "4",
        "name": "ETHIndia Buildathon",
        "organizer": "ETHIndia",
        "prize": "$25,000 in crypto",
        "deadline": "2026-04-05",
        "participants": "3,500+",
        "tags": ["Web3", "DeFi", "Blockchain"],
        "status": "upcoming",
        "link": "https://ethindia.co",
        "description": "India's premier Web3 hackathon. Build decentralized applications.",
    },
]


@router.get("", response_model=List[Hackathon], summary="List curated hackathons")
def list_hackathons(status: Optional[str] = Query(None, description="Filter by status: live|upcoming|past")):
    if status:
        return [h for h in HACKATHONS if h["status"] == status]
    return sorted(HACKATHONS, key=lambda h: ["live", "upcoming", "past"].index(h["status"]))
