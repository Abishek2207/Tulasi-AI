import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

def test_jobs_unauthenticated():
    response = client.get("/api/opportunities/jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)

def test_jobs_authenticated():
    response = client.get("/api/opportunities/jobs", headers={"Authorization": "Bearer fake_token"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

@patch("app.api.opportunities_api.requests.get")
def test_jobs_api_failure_fallback(mock_get):
    mock_get.side_effect = Exception("API Timeout")
    response = client.get("/api/opportunities/jobs")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"] == []

def test_hackathons_unauthenticated():
    response = client.get("/api/opportunities/hackathons")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)

def test_hackathons_authenticated():
    response = client.get("/api/opportunities/hackathons", headers={"Authorization": "Bearer fake_token"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

@patch("app.api.opportunities_api.requests.get")
def test_hackathons_api_failure_fallback(mock_get):
    mock_get.side_effect = Exception("API Timeout")
    response = client.get("/api/opportunities/hackathons")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
