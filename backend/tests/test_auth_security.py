import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_missing_auth_token():
    """Phase B Verification: Missing tokens should yield 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Not authenticated" in response.text

def test_invalid_auth_token():
    """Phase B Verification: Invalid tokens should yield 401."""
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_123"})
    assert response.status_code == 401
    assert "Invalid or expired token" in response.text

def test_cors_headers():
    """Phase C Verification: CORS headers should be properly restricted."""
    # An allowed origin
    response = client.options(
        "/api/health", 
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"

    # A disallowed origin should NOT receive the allow-origin header matching the rogue origin
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://evil-hacker-site.com",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.headers.get("access-control-allow-origin") != "http://evil-hacker-site.com"
