from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.models import User

router = APIRouter()

CONCEPTS = [
    {"id": "c1", "title": "Load Balancing", "difficulty": "Beginner", "desc": "Distributing traffic across multiple servers."},
    {"id": "c2", "title": "Caching", "difficulty": "Beginner", "desc": "Storing temporary data for faster retrieval (Redis/Memcached)."},
    {"id": "c3", "title": "Database Sharding", "difficulty": "Intermediate", "desc": "Partitioning data across multiple databases."},
    {"id": "c4", "title": "Message Queues", "difficulty": "Intermediate", "desc": "Asynchronous communication (Kafka/RabbitMQ)."},
    {"id": "c5", "title": "CAP Theorem", "difficulty": "Advanced", "desc": "Consistency, Availability, Partition Tolerance trade-offs."},
    {"id": "c6", "title": "Microservices", "difficulty": "Advanced", "desc": "Designing independent deployable services."},
]

COMPANY_PREP = [
    {"id": "g1", "company": "Google", "question": "Design YouTube"},
    {"id": "g2", "company": "Google", "question": "Design Google Drive"},
    {"id": "a1", "company": "Amazon", "question": "Design Amazon E-commerce"},
    {"id": "m1", "company": "Microsoft", "question": "Design Teams"},
    {"id": "n1", "company": "Netflix", "question": "Design Netflix Video Streaming"},
]

PRACTICE = [
    {
        "id": "p1", 
        "title": "Design a URL Shortener", 
        "difficulty": "Easy",
        "description": "Design a service like bit.ly that takes a long URL and returns a short alias.",
        "solution_hints": ["Use base62 encoding", "Handling collisions", "Read-heavy vs Write-heavy database design"]
    },
    {
        "id": "p2", 
        "title": "Design a Chat Application", 
        "difficulty": "Medium",
        "description": "Design a real-time chat application like WhatsApp or Discord.",
        "solution_hints": ["WebSockets", "Message sequencing", "Online presence indicator"]
    },
]

@router.get("/concepts")
def get_concepts(current_user: User = Depends(get_current_user)):
    return {"concepts": CONCEPTS}

@router.get("/companies")
def get_companies(current_user: User = Depends(get_current_user)):
    return {"companies": COMPANY_PREP}

@router.get("/practice")
def get_practice_problems(current_user: User = Depends(get_current_user)):
    return {"practice": PRACTICE}
