import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.main import app
from app.core.database import engine
from app.models.models import User, Document, DocumentChunk
import json
import uuid

client = TestClient(app)

def setup_users_and_documents():
    with Session(engine) as session:
        unique_a = f"user_a_{uuid.uuid4().hex[:8]}@test.com"
        unique_b = f"user_b_{uuid.uuid4().hex[:8]}@test.com"
        
        # Create User A
        user_a = User(email=unique_a, password_hash="hash", role="user", name="User A")
        session.add(user_a)
        
        # Create User B
        user_b = User(email=unique_b, password_hash="hash", role="user", name="User B")
        session.add(user_b)
        session.commit()
        session.refresh(user_a)
        session.refresh(user_b)
        
        # User A uploads a highly sensitive document
        doc_a = Document(user_id=user_a.id, title="Secret A.pdf", filename="Secret A.pdf", file_path="path/a", file_size_bytes=100)
        session.add(doc_a)
        session.commit()
        session.refresh(doc_a)
        
        chunk_a = DocumentChunk(
            document_id=doc_a.id,
            user_id=user_a.id,
            page_number=1,
            chunk_index=0,
            content="This is the top secret formula of User A: E=mc^3",
            embedding=[0.1]*768 
        )
        session.add(chunk_a)
        
        # User B uploads a normal document
        doc_b = Document(user_id=user_b.id, title="Normal B.pdf", filename="Normal B.pdf", file_path="path/b", file_size_bytes=100)
        session.add(doc_b)
        session.commit()
        session.refresh(doc_b)
        
        chunk_b = DocumentChunk(
            document_id=doc_b.id,
            user_id=user_b.id,
            page_number=1,
            chunk_index=0,
            content="This is just some regular math: 2+2=4",
            embedding=[0.1]*768
        )
        session.add(chunk_b)
        session.commit()
        
        return (
            {"id": user_a.id, "email": user_a.email, "doc_id": doc_a.id},
            {"id": user_b.id, "email": user_b.email, "doc_id": doc_b.id},
        )

def test_rag_user_isolation(monkeypatch):
    monkeypatch.setattr('app.services.vector_service.vector_service.embed_documents', lambda text: [0.1]*768)
    monkeypatch.setattr('app.api.rag.ai_client.get_response', lambda prompt, force_model=None: 'I couldn''t find enough evidence in your uploaded documents.' if 'User A' in prompt else 'Mock Response')
    # Setup Data
    user_a, user_b = setup_users_and_documents()
    
    # Generate Fake JWT for User B to authenticate
    from app.api.auth import create_access_token
    token_b = create_access_token({"sub": user_b["email"]})
    headers = {"Authorization": f"Bearer {token_b}"}
    
    # User B queries the RAG system attempting to retrieve User A's secret
    response = client.post(
        "/api/rag/chat", 
        json={"query": "What is the top secret formula of User A?"},
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Validate User A's data NEVER leaked into User B's context
    # Our prompt fallback response is: "I couldn't find enough evidence..."
    assert "E=mc^3" not in data["answer"]
    assert len(data["citations"]) == 1  # Only User B's document should be returned as context
    # The returned citation must belong to User B's document, NOT User A's document
    assert data["citations"][0]["document_id"] == user_b["doc_id"]
    assert data["citations"][0]["document_id"] != user_a["doc_id"]
