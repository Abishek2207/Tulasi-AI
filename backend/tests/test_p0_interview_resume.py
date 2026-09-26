import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select, create_engine
from sqlalchemy.pool import StaticPool
from app.main import app
from app.models.models import User, PersistentInterviewSession, SavedResume, SQLModel
from app.core.database import get_session
from app.api.deps import get_current_user

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SQLModel.metadata.create_all(test_engine)

with Session(test_engine) as seed_session:
    seed_user = User(
        email="test@tulasiai.com",
        name="Test Student",
        role="user",
        user_type="student",
        hashed_password="$2b$12$dummy_hash",
        is_active=True,
        is_verified=True,
        xp=0,
        level=1,
    )
    seed_session.add(seed_user)
    seed_session.commit()

def get_test_session():
    with Session(test_engine) as session:
        yield session

def override_user():
    with Session(test_engine) as s:
        user = s.exec(select(User).where(User.email == "test@tulasiai.com")).first()
        s.expunge(user)
        return user

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_session] = get_test_session
    app.dependency_overrides[get_current_user] = override_user
    yield
    app.dependency_overrides.clear()
    
@pytest.fixture
def db_session():
    with Session(test_engine) as session:
        yield session

@pytest.fixture
def normal_user_token_headers():
    return {"Authorization": "Bearer mock"}

client = TestClient(app)

from unittest.mock import patch

def test_resume_improve(db_session: Session, normal_user_token_headers):
    # Test Resume ATS endpoint
    payload = {
        "resume_text": "I write Python code.",
        "job_description": "We need a senior Python developer with backend experience."
    }
    
    # 1. Valid request
    with patch("app.api.resume.resilient_ai_response") as mock_ai:
        mock_ai.return_value = {"ats_score": 85, "improved_resume": "I write excellent Python code.", "feedback": ["Add more details"]}
        response = client.post("/api/resume/improve", json=payload, headers=normal_user_token_headers)
        
    assert response.status_code == 200, response.text
    
    data = response.json()
    assert "ats_score" in data
    assert "improved_resume" in data
    
    # Check that it got saved
    saved = db_session.exec(select(SavedResume)).first()
    assert saved is not None
    assert saved.ats_score == data["ats_score"]

def test_resume_improve_validation(normal_user_token_headers):
    # Missing job description
    payload = {
        "resume_text": "I write Python code."
    }
    response = client.post("/api/resume/improve", json=payload, headers=normal_user_token_headers)
    assert response.status_code == 400

def test_interview_flow(db_session: Session, normal_user_token_headers):
    # 1. Start Interview
    start_payload = {
        "role": "Software Engineer",
        "company": "Google",
        "interview_type": "Technical",
        "num_questions": 3
    }
    
    response = client.post("/api/interview/start", json=start_payload, headers=normal_user_token_headers)
    assert response.status_code == 200, response.text
    data = response.json()
    
    assert data["status"] == "in_progress"
    assert "session_id" in data
    assert "question" in data
    assert data["question_number"] == 1
    
    session_id = data["session_id"]
    
    # Check DB
    session_record = db_session.exec(select(PersistentInterviewSession).where(PersistentInterviewSession.session_id == session_id)).first()
    assert session_record is not None
    assert session_record.questions_asked == 1
    
    # 2. Answer Question
    answer_payload = {
        "session_id": session_id,
        "answer": "My answer is to use a hash map for O(1) lookups."
    }
    
    response = client.post("/api/interview/answer", json=answer_payload, headers=normal_user_token_headers)
    assert response.status_code == 200, response.text
    data = response.json()
    
    assert data["status"] in ["in_progress", "completed"]
    assert "eval" in data
    assert "score" in data["eval"]
    assert data["question_number"] == 2
    
    # 3. Invalid Session
    invalid_payload = {
        "session_id": "invalid-session-uuid",
        "answer": "Test"
    }
    response = client.post("/api/interview/answer", json=invalid_payload, headers=normal_user_token_headers)
    assert response.status_code == 404


