import pytest
import os

@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    import os
    from sqlmodel import SQLModel
    from app.core.database import engine
    from app.models.models import User # Ensure models are loaded
    
    # We only recreate if we're using SQLite
    db_url = os.environ.get("DATABASE_URL", "sqlite:///./ai_platform.db")
    if "sqlite" in db_url:
        SQLModel.metadata.drop_all(engine)
        SQLModel.metadata.create_all(engine)

@pytest.fixture(autouse=True)
def mock_ai_client(monkeypatch):
    """
    Mock AI responses during tests so we don't hit real providers or exhaust quotas.
    This replaces the hardcoded mock fallback that was previously in production code.
    """
    def fake_get_response(message: str, force_model=None, *args, **kwargs):
        if "No response" in message or "fail" in message.lower():
            return "No response generated."
            
        if "TULASIA_REAL_AI_92741" in message or "TULASIA_INTEL_AI_58291" in message:
            raise Exception("Simulated provider failure")
        
        # Determine format based on prompt keywords to satisfy test expectations
        msg_low = message.lower()
        if "roadmap" in msg_low or "json" in msg_low:
            return '```json\n{"roadmap": [], "career_readiness": 85}\n```'
        if "system design" in msg_low:
            return '{"summary": "A highly scalable distributed architecture.", "suggested_questions": []}'
        if "user a" in msg_low:
            return "I couldn't find enough evidence in your uploaded documents."
            
        return '```json\n{"skills_score": 90, "overall_score": 85, "keyword_match_score": 80}\n```'
        
    # We patch BOTH places where it might be imported
    try:
        monkeypatch.setattr('app.core.ai_client.HybridAIClient.get_response', fake_get_response)
        monkeypatch.setattr('app.core.ai_client.ai_client.get_response', fake_get_response)
    except AttributeError:
        pass


def pytest_runtest_setup(item):
    db_url = os.environ.get("DATABASE_URL", "sqlite:///./ai_platform.db")
    if "sqlite" in db_url:
        file_name = item.location[0]
        test_name = item.name
        
        postgres_only_files = [
            "test_rls_ab.py",
            "test_rag_isolation.py",
            "test_rls_context.py",
            "verify_rls_isolation.py",
            "verify_rls_policies.py",
            "verify_rls_real.py",
            "test_skill_evidence_race.py",
            "test_learning_engine.py",
            "test_skill_engine.py"
        ]
        
        if any(f in file_name for f in postgres_only_files):
            pytest.skip("This test requires PostgreSQL (RLS/Vector) but SQLite is configured.")
            
        if "rls" in test_name.lower() or "set_config" in test_name.lower():
            pytest.skip("This test requires PostgreSQL RLS features.")
