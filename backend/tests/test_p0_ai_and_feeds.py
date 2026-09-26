"""
P0 regression tests: AI provider failure path and industry feed endpoint.
All tests run in isolation with in-memory SQLite and proper SQLModel User instances.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, select
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.models import User, SQLModel
import app.core.security as sec_module
import app.api.auth as auth_module
from app.core.database import get_session

# ── Shared in-memory DB ───────────────────────────────────────────────────────
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SQLModel.metadata.create_all(test_engine)

# Seed a test user
with Session(test_engine) as seed_session:
    existing = seed_session.exec(select(User).where(User.email == "test@tulasiai.com")).first()
    if not existing:
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
    """Return a live, session-bound User from the test DB."""
    with Session(test_engine) as s:
        user = s.exec(select(User).where(User.email == "test@tulasiai.com")).first()
        # Ensure profile is loaded
        if getattr(user, 'profile', None): pass
        s.expunge(user)  # detach but all attributes already loaded
        return user


@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_session] = get_test_session
    app.dependency_overrides[sec_module.get_current_user] = override_user
    app.dependency_overrides[auth_module.get_current_user] = override_user
    yield
    app.dependency_overrides = {}


client = TestClient(app)


# ── TEST: unauthenticated → 401 ──────────────────────────────────────────────
def test_chat_unauthenticated_returns_401():
    """Unauthenticated /api/chat must return 401."""
    old_overrides = app.dependency_overrides.copy()
    app.dependency_overrides.pop(auth_module.get_current_user, None)
    app.dependency_overrides.pop(sec_module.get_current_user, None)
    r = client.post("/api/chat", json={"message": "hello", "tool": "chat"})
    assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"
    app.dependency_overrides = old_overrides


# ── TEST: /api/chat no providers → 503 (not 200) ─────────────────────────────

def test_chat_provider_failure_returns_503_not_200(monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    from app.core.ai_router import ai_client
    monkeypatch.setattr(ai_client, 'groq_key', None)
    monkeypatch.setattr(ai_client, 'gemini_key', None)
    monkeypatch.setattr(ai_client, 'openrouter_key', None)
    monkeypatch.delenv('OPENROUTER_API_KEY', raising=False)
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    monkeypatch.delenv('GOOGLE_API_KEY', raising=False)
    """All AI providers fail → /api/chat must return 503, not a fake 200."""
    r = client.post("/api/chat", json={"message": "TULASIA_REAL_AI_92741", "tool": "chat"})
    assert r.status_code != 200, (
        f"FAIL: /api/chat returned 200 when all providers fail. "
        f"Possible fake response: {r.text[:200]}"
    )
    assert r.status_code == 503, f"Expected 503, got {r.status_code}: {r.text}"


# ── TEST: /api/intel/chat no providers → 503 ─────────────────────────────────

def test_intel_chat_provider_failure_returns_503(monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    from app.core.ai_router import ai_client
    monkeypatch.setattr(ai_client, 'groq_key', None)
    monkeypatch.setattr(ai_client, 'gemini_key', None)
    monkeypatch.setattr(ai_client, 'openrouter_key', None)
    monkeypatch.delenv('OPENROUTER_API_KEY', raising=False)
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    monkeypatch.delenv('GOOGLE_API_KEY', raising=False)
    """All AI providers fail → /api/intel/chat must return 503."""
    r = client.post("/api/intel/chat", json={"message": "TULASIA_INTEL_AI_58291"})
    assert r.status_code == 503, f"Expected 503, got {r.status_code}: {r.text}"
    assert "unavailable" in r.text.lower() or "service" in r.text.lower()


# ── TEST: /api/v1/industry/feed → 200 + empty list ───────────────────────────
def test_industry_feed_returns_200_with_empty_list():
    """/api/v1/industry/feed must return 200 with industry_feed list (may be empty)."""
    r = client.get("/api/v1/industry/feed")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    body = r.json()
    assert "industry_feed" in body
    assert isinstance(body["industry_feed"], list)


# ── TEST: /api/market/intelligence → no fabricated data ──────────────────────
def test_market_intelligence_no_fake_data():
    """/api/market/intelligence must return truthful UNAVAILABLE when SerpApi is absent."""
    r = client.get("/api/market/intelligence?role=Developer")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    body = r.json()
    assert "status" in body
    if body.get("status") == "UNAVAILABLE":
        assert body.get("jobs_analyzed", 0) == 0







