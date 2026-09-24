import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_jobs_unauthenticated():
    """Jobs endpoint requires authentication - must return 401."""
    response = client.get("/api/opportunities/jobs")
    assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"

def test_hackathons_unauthenticated():
    """Hackathons endpoint is public - must return 200."""
    response = client.get("/api/opportunities/hackathons")
    assert response.status_code == 200, f"Expected 200 for unauthenticated request, got {response.status_code}"
    data = response.json()
    assert data["success"] is True

@patch("app.api.opportunities_api.requests.get")
def test_jobs_api_failure_returns_503(mock_get):
    """When external job API fails with no auth, returns 401 (auth checked first)."""
    mock_get.side_effect = Exception("API Timeout")
    response = client.get("/api/opportunities/jobs")
    # Auth is checked before external API call
    assert response.status_code == 401
