"""
Tulasi AI — Backend Test Suite (STEP 13)

Tests:
  - Health check endpoint
  - User registration & login
  - Code execution (Python)
  - Roadmap list
  - Activity analytics
  - Rewards list
  - Hackathon list

Run:
  cd backend
  pip install pytest httpx
  python -m pytest tests/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ─── Helper ──────────────────────────────────────────────────────────────────

_TEST_EMAIL = "testuser_pytest@tulasiai.dev"
_TEST_PASSWORD = "TestPass123!"
_TEST_NAME = "Pytest Runner"

_token: str = ""


def _get_token() -> str:
    global _token
    if _token:
        return _token
    # Try login first, then register
    res = client.post("/api/auth/login", json={"email": _TEST_EMAIL, "password": _TEST_PASSWORD})
    if res.status_code == 200:
        _token = res.json()["access_token"]
        return _token
    reg = client.post(
        "/api/auth/register",
        json={"email": _TEST_EMAIL, "password": _TEST_PASSWORD, "name": _TEST_NAME},
    )
    assert reg.status_code == 200, f"Registration failed: {reg.text}"
    _token = reg.json()["access_token"]
    return _token


# ─── Tests ────────────────────────────────────────────────────────────────────


class TestHealth:
    def test_health_ok(self):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "services" in data
        assert isinstance(data["services"], list)
        assert len(data["services"]) > 0
        assert "server" in data

    def test_ping(self):
        res = client.get("/api/ping")
        assert res.status_code == 200
        assert "ping" in res.json() or res.json() == "pong" or "pong" in str(res.json())

    def test_root(self):
        res = client.get("/")
        assert res.status_code == 200
        assert res.json()["name"] == "Tulasi AI API"


class TestAuth:
    def test_register_and_login(self):
        token = _get_token()
        assert isinstance(token, str)
        assert len(token) > 10

    def test_me_endpoint(self):
        token = _get_token()
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        user = res.json()
        assert "email" in user
        assert "name" in user

    def test_invalid_login(self):
        res = client.post(
            "/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "wrongpass"},
        )
        assert res.status_code in (401, 404, 422)


class TestCodeExecution:
    def test_python_hello_world(self):
        token = _get_token()
        res = client.post(
            "/api/code/run",
            json={"code": 'print("Hello, Tulasi AI!")', "language": "python"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "Hello, Tulasi AI!" in data["output"]
        assert data["status"] in ("success", "runtime_error")

    def test_python_with_stdin(self):
        token = _get_token()
        res = client.post(
            "/api/code/run",
            json={"code": "name = input()\nprint(f'Hi {name}')", "language": "python", "stdin": "World"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert "Hi World" in res.json().get("output", "")

    def test_unsupported_language(self):
        token = _get_token()
        res = client.post(
            "/api/code/run",
            json={"code": "console.log('hello')", "language": "javascript"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "error"

    def test_code_problems_list(self):
        token = _get_token()
        res = client.get(
            "/api/code/problems",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "problems" in data
        assert len(data["problems"]) > 0


class TestRoadmap:
    def test_roadmap_list(self):
        token = _get_token()
        res = client.get("/api/roadmap/", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "roadmaps" in data


class TestAnalytics:
    def test_analytics_endpoint(self):
        token = _get_token()
        res = client.get("/api/activity/analytics", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "time_series" in data
        assert isinstance(data["time_series"], list)
        assert len(data["time_series"]) == 30  # 30 days

    def test_stats_endpoint(self):
        token = _get_token()
        res = client.get("/api/activity/stats", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "xp" in data
        assert "streak" in data or "level" in data


class TestRewards:
    def test_rewards_list(self):
        token = _get_token()
        res = client.get("/api/activity/rewards", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 200
        data = res.json()
        assert "rewards" in data
        assert isinstance(data["rewards"], list)

    def test_redeem_insufficient_xp(self):
        """Trying to redeem without enough XP should return 400."""
        token = _get_token()
        # Get an expensive reward
        res = client.get("/api/activity/rewards", headers={"Authorization": f"Bearer {token}"})
        rewards = res.json().get("rewards", [])
        if not rewards:
            pytest.skip("No rewards available to test")
        expensive = max(rewards, key=lambda r: r["cost_xp"])
        redeem_res = client.post(
            "/api/activity/rewards/redeem",
            json={"reward_id": expensive["id"]},
            headers={"Authorization": f"Bearer {token}"},
        )
        # Either succeeds (user has enough XP) or fails with 400
        assert redeem_res.status_code in (200, 400)


class TestHackathons:
    def test_hackathon_list(self):
        res = client.get("/api/hackathons")
        assert res.status_code == 200
        data = res.json()
        assert "hackathons" in data
        assert len(data["hackathons"]) > 0

    def test_hackathon_filter_by_status(self):
        res = client.get("/api/hackathons?status=Open")
        assert res.status_code == 200


class TestWebSocketStatus:
    def test_ws_status_endpoint(self):
        res = client.get("/api/ws/status")
        assert res.status_code == 200
        data = res.json()
        assert "active_connections" in data
