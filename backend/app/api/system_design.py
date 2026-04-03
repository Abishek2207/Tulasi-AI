from pydantic import BaseModel
from typing import List, Optional
from app.core.ai_router import get_ai_response
import json

class SolutionRequest(BaseModel):
    problem_id: str
    current_step: Optional[int] = 0
    user_input: Optional[str] = ""

CONCEPTS = [
    {"id": "c1", "title": "Load Balancing", "difficulty": "Beginner", "desc": "Distributing traffic across multiple servers."},
    {"id": "c2", "title": "Caching", "difficulty": "Beginner", "desc": "Storing temporary data for faster retrieval (Redis/Memcached)."},
    {"id": "c3", "title": "Database Sharding", "difficulty": "Intermediate", "desc": "Partitioning data across multiple databases."},
    {"id": "c4", "title": "Message Queues", "difficulty": "Intermediate", "desc": "Asynchronous communication (Kafka/RabbitMQ)."},
    {"id": "c5", "title": "CAP Theorem", "difficulty": "Advanced", "desc": "Consistency, Availability, Partition Tolerance trade-offs."},
    {"id": "c6", "title": "Microservices", "difficulty": "Advanced", "desc": "Designing independent deployable services."},
]

COMPANY_PREP = [
    {"id": "g1", "company": "Google", "question": "Design YouTube (Global scale, high availability)"},
    {"id": "g2", "company": "Google", "question": "Design Google Drive (File sync, sharding)"},
    {"id": "a1", "company": "Amazon", "question": "Design Amazon E-commerce (Flash sales, inventory consistency)"},
    {"id": "m1", "company": "Microsoft", "question": "Design Teams (Real-time messaging, presence)"},
    {"id": "n1", "company": "Netflix", "question": "Design Netflix Video Streaming (Content delivery, encryption)"},
    {"id": "u1", "company": "Uber", "question": "Design Uber Rideshare (Geo-spatial indexing, dynamic pricing)"},
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
    {
        "id": "p3", 
        "title": "Design a Distributed Rate Limiter", 
        "difficulty": "Advanced",
        "description": "Design a rate limiter for 100M users to prevent API abuse across distributed clusters.",
        "solution_hints": ["Token Bucket Algorithm", "Redis storage", "Race conditions & synchronization"]
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

@router.post("/guided-solution")
def get_guided_solution(req: SolutionRequest, current_user: User = Depends(get_current_user)):
    """
    Uses AI to provide a step-by-step guided solution for a system design problem.
    This acts as a 'Senior Architect' mentor.
    """
    problem = next((p for p in PRACTICE if p["id"] == req.problem_id), None)
    if not problem:
        # Check company prep too
        problem = next((p for p in COMPANY_PREP if p["id"] == req.problem_id), None)
        if problem: 
            problem = {"title": problem["question"], "description": problem["question"]}

    if not problem:
        return {"error": "Problem not found"}

    prompt = f"""
    You are a Principal Architect guiding a candidate through a System Design interview for {problem['title']}.
    The candidate is at Step {req.current_step} of the design.
    
    Current Problem: {problem['description']}
    Candidate Input: {req.user_input or "Just started"}
    Step History: {req.current_step} Steps completed.

    Your goal:
    1. Evaluate the candidate's input.
    2. Provide deep architectural feedback.
    3. Guide them to the NEXT step (Requirements -> Back-of-envelope -> API Design -> DB Schema -> High Level -> Deep Dive).
    4. Keep it interactive and Socratic.

    Return ONLY JSON:
    {{
      "feedback": "Your evaluation",
      "guidance": "Next logical step and why",
      "current_step": {req.current_step + 1},
      "checklist": ["List of things to consider now"],
      "hint": "A subtle technical hint for the next step"
    }}
    """
    
    try:
        res = get_ai_response(prompt, force_model="fast_flash")
        import re
        match = re.search(r'\{.*\}', res, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"error": "Failed to parse architect response"}
    except Exception as e:
        return {"error": f"Architect unavailable: {str(e)}"}
