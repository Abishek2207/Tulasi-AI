import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.auth import get_current_user
from app.models.models import User

client = TestClient(app)

# Mock users
normal_user = User(id=1, email="user@example.com", role="user", is_active=True)
admin_user = User(id=2, email="abishek2207@gmail.com", role="admin", is_active=True)

def override_get_normal_user():
    return normal_user

def override_get_admin_user():
    return admin_user

@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides = {}

def test_no_auth():
    """A. No Authorization header should return 401/403."""
    app.dependency_overrides = {}
    response = client.post("/api/admin/seed-hackathons")
    assert response.status_code in [401, 403]
    
    response2 = client.post("/api/admin/seed-reviews")
    assert response.status_code in [401, 403]

def test_normal_user_rejected():
    """B. Normal authenticated user should return 403."""
    app.dependency_overrides[get_current_user] = override_get_normal_user
    response = client.post("/api/admin/seed-hackathons")
    assert response.status_code == 403
    
    response2 = client.post("/api/admin/seed-reviews")
    assert response.status_code == 403

def test_admin_user_accepted():
    """C. Authorized admin should reach the intended seed operation."""
    app.dependency_overrides[get_current_user] = override_get_admin_user
    # The endpoint will attempt to execute db.execute which will use the test DB.
    # It might fail with a 500 if DB is not mocked, but it should NOT return 403.
    response = client.post("/api/admin/seed-hackathons")
    assert response.status_code != 403
    assert response.status_code != 401

def test_client_claim_admin():
    """D. Client attempts to claim admin through request body data should return 403."""
    app.dependency_overrides[get_current_user] = override_get_normal_user
    # Send forged payload
    response = client.post("/api/admin/seed-hackathons", json={"role": "admin", "admin": True})
    assert response.status_code == 403

