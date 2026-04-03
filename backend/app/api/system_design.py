from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.ai_router import get_ai_response
from app.models.models import User
from app.api.deps import get_current_user
import json

router = APIRouter()

class SolutionRequest(BaseModel):
    problem_id: str
    current_step: Optional[int] = 0
    user_input: Optional[str] = ""

CONCEPTS = [
    {"id": "c1", "title": "Load Balancing", "difficulty": "Beginner", "desc": "L4 vs L7, Round Robin, Least Connections, IP Hash."},
    {"id": "c2", "title": "Caching Strategy", "difficulty": "Beginner", "desc": "Write-through, Write-back, LRU Eviction, Redis Cluster."},
    {"id": "c3", "title": "Database Sharding", "difficulty": "Intermediate", "desc": "Horizontal partitioning, Consistent Hashing, Rebalancing."},
    {"id": "c4", "title": "Event Streaming", "difficulty": "Intermediate", "desc": "Kafka, RabbitMQ, Publisher-Subscriber, At-least-once delivery."},
    {"id": "c5", "title": "CAP & PACELC", "difficulty": "Advanced", "desc": "Consistency, Availability, Partition Tolerance, Latency vs Consistency."},
    {"id": "c6", "title": "Microservices Sync/Async", "difficulty": "Advanced", "desc": "gRPC vs REST, Sagas Pattern, Circuit Breakers."},
    {"id": "c7", "title": "Global State (KV Stores)", "difficulty": "Elite", "desc": "Distributed Locking (Dsync), Etcd, Consensus (Paxos/Raft)."},
]

COMPANY_PREP = [
    {"id": "g1", "company": "Google", "question": "Design YouTube (Global scale, high availability, CDNs)"},
    {"id": "g2", "company": "Google", "question": "Design Google Drive (Differential sync, chunk-based sharding)"},
    {"id": "a1", "company": "Amazon", "question": "Design Amazon Inventory (Flash sales, ACID vs BASE, DynamoDB)"},
    {"id": "m1", "company": "Microsoft", "question": "Design Teams Presence (Real-time, status sharding, push vs pull)"},
    {"id": "n1", "company": "Netflix", "question": "Design Netflix Playback Engine (Micro-batching, specialized encoding)"},
    {"id": "u1", "company": "Uber", "question": "Design Uber Rideshare (Geo-spatial indexing, Quad-trees, S2 Cells)"},
]

PRACTICE = [
    {
        "id": "p1", 
        "title": "Design a Global URL Shortener", 
        "difficulty": "Easy",
        "description": "Design a service like bit.ly/TinyURL that handles 100M+ requests per day.",
        "solution_hints": ["Base62 encoding", "Collision handling", "Read-heavy caching (Redis)"]
    },
    {
        "id": "p2", 
        "title": "Design a Real-time Messaging Platform", 
        "difficulty": "Medium",
        "description": "Design WhatsApp/Discord for 1B users with message persistence and E2EE.",
        "solution_hints": ["WebSockets/long-polling", "Sequence markers", "Cassandra/HBase storage"]
    },
    {
        "id": "p3", 
        "title": "Design a Distributed Rate Limiter", 
        "difficulty": "Hard",
        "description": "Design a global rate limiter to prevent API abuse (Handle 10M QPS).",
        "solution_hints": ["Sliding Window Counter", "Race conditions in Redis", "Local vs Global enforcement"]
    },
    {
        "id": "p4", 
        "title": "Design a Metrics Monitoring DB", 
        "difficulty": "Elite",
        "description": "Design a Time-Series DB like Prometheus for millions of incoming data points/sec.",
        "solution_hints": ["LSM Trees", "Downsampling", "Retention policies", "Write-ahead logging"]
    }
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
    The Tulasi AI Senior Architect Mentor. 
    Provides multi-step, technical feedback with a focus on trade-offs.
    """
    problem = next((p for p in PRACTICE if p["id"] == req.problem_id), None)
    if not problem:
        problem = next((p for p in COMPANY_PREP if p["id"] == req.problem_id), None)
        if problem: 
            problem = {"title": problem["question"], "description": problem["question"]}

    if not problem:
        return {"error": "Problem not found"}

    prompt = f"""
    You are a Principal Software Engineer (L7/L8) at a FAANG company. 
    You are conducting a System Design interview for "{problem['title']}".
    
    Current Problem: {problem['description']}
    Candidate's Current Step: {req.current_step} 
    Candidate Input: "{req.user_input or 'Just starting analysis'}"
    
    Your Task:
    1. Evaluate the candidate's input with ELITE architectural rigor.
    2. Identify specific logical gaps (e.g., SPOF, Bottlenecks, Data consistency issues).
    3. Guide them to the next phase: (Functional Req -> Non-Functional -> API Design -> DB Schema -> High Level -> Component Deep Dive).
    4. Provide ONE "Architectural Trade-off" question (e.g., Latency vs Availability).
    
    Return ONLY JSON:
    {{
      "feedback": "Expert architectural assessment",
      "guidance": "Instructions for next phase",
      "current_step": {req.current_step + 1},
      "checklist": ["Critical items for this phase"],
      "hint": "Subtle, powerful technical hint",
      "architect_question": "A deep question to test their scalability mindset"
    }}
    """
    
    try:
        # Use robust client directly for best model
        from app.core.ai_client import ai_client
        res = ai_client.get_response(prompt, force_model="complex_reasoning")
        
        import re
        match = re.search(r'\{.*\}', res, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {"error": "Neural Link synchronization failed. Retrying logic..."}
    except Exception as e:
        return {"error": f"Senior Architect is currently scaled: {str(e)}"}
