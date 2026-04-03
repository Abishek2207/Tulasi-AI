from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import json
from app.core.database import get_session
from app.api.auth import get_admin_user
from app.models.models import User, UserMemoryChunk
from app.services.vector_service import vector_service

router = APIRouter()

SYSTEM_DESIGN_SEED = [
    "Q: How do you design a scalable Twitter feed? A: Use a combination of push and pull models. Push to active users via fanout service (Redis or Cassandra), and pull for celebrities with massive followers to avoid fanout latency. Use CDN for media.",
    "Q: What is a Bloom filter and when to use it? A: A space-efficient probabilistic data structure used to test whether an element is a member of a set. Useful in databases (like Cassandra) to avoid expensive disk lookups for non-existent keys.",
    "Q: Contrast monolithic architectures vs microservices. A: Monoliths are simpler to deploy and debug initially but scale poorly. Microservices allow independent scaling, language flexibility, and targeted fault isolation but introduce network latency and distributed data consistency challenges.",
    "Q: What is the CAP theorem? A: It states that a distributed data store can only guarantee two out of three: Consistency, Availability, and Partition tolerance. In network partitions, you must choose between Consistency and Availability.",
]

FAANG_INTERVIEW_SEED = [
    "Q: What is the STAR method? A: Situation, Task, Action, Result. Used to answer behavioral questions clearly and concisely. Action should be 'I' not 'We' to highlight your specific contribution.",
    "Q: How to handle conflicts in a software team? A: Emphasize open communication, assuming good intent, using data-driven arguments over opinions, and escalating to a manager only when a deadlock persists.",
]

@router.post("/seed")
def seed_global_knowledge(db: Session = Depends(get_session), admin: User = Depends(get_admin_user)):
    """
    Seeds the RAG vector store with foundational AI Career Platform knowledge.
    We isolate this by assigning these chunks to user_id = 0 (Global Knowledge space).
    """
    try:
        # Prevent duplicate seeding
        existing = db.exec(select(UserMemoryChunk).where(UserMemoryChunk.user_id == 0)).first()
        if existing:
            return {"message": "Knowledge already seeded"}

        all_knowledge = SYSTEM_DESIGN_SEED + FAANG_INTERVIEW_SEED
        vector_service.store_batch_embeddings(user_id=0, texts=all_knowledge, db=db)
        return {"message": "Successfully seeded Global Knowledge into RAG memory."}
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}

@router.get("/query")
def query_knowledge(q: str, db: Session = Depends(get_session)):
    """Publicly query the global RAG."""
    context = vector_service.retrieve_context(user_id=0, query=q, db=db, top_k=2)
    return {"query": q, "context": context}
