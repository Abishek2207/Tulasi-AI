import pytest
from fastapi.testclient import TestClient
from app.main import app
from sqlmodel import Session, select
from app.core.database import engine
from app.models.models import User, CareerRole, Skill, RoleSkillRequirement, UserRoadmap, ActionTask
import uuid

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def db_session():
    with Session(engine) as session:
        yield session

def get_auth_headers(user_id: int):
    # Depending on auth.py, usually standard Bearer token.
    # In tests, we might mock `get_current_user` or rely on the test DB token generation.
    # Here, we will just use dependency overrides for fastapi.
    pass

@pytest.fixture
def override_auth(client, db_session):
    # This fixture overrides the auth dependency for the test
    from app.api.deps import get_current_user
    uid = str(uuid.uuid4())[:8]
    user = User(email=f"api_{uid}@test.com", password_hash="hash", auth_provider="email")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    def mock_get_current_user():
        return user
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield user
    app.dependency_overrides.pop(get_current_user, None)

def test_api_roadmap_flow(client, override_auth, db_session):
    user = override_auth
    
    uid = str(uuid.uuid4())[:8]
    role = CareerRole(name=f"Backend API {uid}", normalized_name=f"backend api {uid}".lower(), description="Test")
    db_session.add(role)
    db_session.commit()
    
    s1 = Skill(name=f"API Python {uid}", category="Tech")
    db_session.add(s1)
    db_session.commit()
    req = RoleSkillRequirement(role_id=role.id, skill_id=s1.id, minimum_level=0.7, importance=1.0)
    db_session.add(req)
    db_session.commit()

    # 1. Create roadmap
    res = client.post("/api/v1/execution/roadmap", json={"role_id": role.id})
    assert res.status_code == 201
    data = res.json()
    assert data["roadmap"]["role_id"] == role.id
    assert len(data["milestones"]) > 0

    # 2. Get roadmap
    res2 = client.get("/api/v1/execution/roadmap")
    assert res2.status_code == 200
    assert res2.json()["roadmap"]["id"] == data["roadmap"]["id"]

    # 3. Get tasks
    res3 = client.get("/api/v1/execution/tasks")
    assert res3.status_code == 200
    tasks = res3.json()
    assert len(tasks) > 0
    task_id = tasks[0]["id"]

    # 4. Update task
    res4 = client.patch(f"/api/v1/execution/tasks/{task_id}", json={"status": "completed"})
    assert res4.status_code == 200
    assert res4.json()["status"] == "completed"

def test_api_project_flow(client, override_auth, db_session):
    user = override_auth

    uid = str(uuid.uuid4())[:8]
    s1 = Skill(name=f"Proj API {uid}", category="Tech")
    db_session.add(s1)
    db_session.commit()

    # Create project
    res = client.post("/api/v1/execution/projects", json={
        "title": "My API Project",
        "description": "Desc",
        "project_url": "https://example.com",
        "skill_ids": [s1.id]
    })
    assert res.status_code == 201
    proj_id = res.json()["id"]

    # Get projects
    res2 = client.get("/api/v1/execution/projects")
    assert res2.status_code == 200
    assert len(res2.json()) > 0
    assert res2.json()[0]["id"] == proj_id

    # Complete project
    res3 = client.patch(f"/api/v1/execution/projects/{proj_id}/complete")
    assert res3.status_code == 200
    assert res3.json()["status"] == "completed"

def test_api_readiness_calculation(client, override_auth, db_session):
    user = override_auth

    uid = str(uuid.uuid4())[:8]
    role = CareerRole(name=f"Readiness API {uid}", normalized_name=f"readiness api {uid}".lower(), description="Test")
    db_session.add(role)
    db_session.commit()

    # Get readiness without skills
    res = client.get(f"/api/v1/execution/readiness/{role.id}")
    assert res.status_code == 200
    assert res.json()["score"] == 0.0

    # Add a requirement
    s1 = Skill(name=f"Readiness Skill {uid}", category="Tech")
    db_session.add(s1)
    db_session.commit()
    req = RoleSkillRequirement(role_id=role.id, skill_id=s1.id, minimum_level=0.7, importance=1.0)
    db_session.add(req)
    db_session.commit()

    res2 = client.get(f"/api/v1/execution/readiness/{role.id}")
    assert res2.status_code == 200
    assert res2.json()["score"] == 0.0
