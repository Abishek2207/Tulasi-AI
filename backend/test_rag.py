import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.local_rag_core import local_rag_service

async def test_rag():
    print("Testing RAG Indexing...")
    docs = [
        {"type": "skill", "content": "I am proficient in Python and FastAPI."},
        {"type": "roadmap", "content": "My goal is to learn distributed systems and Kubernetes."},
        {"type": "profile", "content": "I am a backend engineer looking for a FAANG job in Seattle."}
    ]
    user_id = "test-user-123"
    
    # Test Indexing
    await local_rag_service.index_user_data(user_id, docs)
    
    # Test Retrieval
    context = local_rag_service.retrieve_context(user_id, "What is my goal?")
    print("Context retrieved:", context)
    
    # Test Generation
    print("Testing Generation...")
    res = await local_rag_service.generate_answer(user_id, "What are my skills, and where do I want to work?")
    print("Answer:", res["answer"])
    print("Sources:", [s["content"] for s in res.get("sources", [])])
    print("Model Used:", res.get("used_model"))

if __name__ == "__main__":
    asyncio.run(test_rag())
