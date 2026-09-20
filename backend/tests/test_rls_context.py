import pytest
from sqlalchemy import text
from sqlmodel import Session
from app.core.database import engine

def test_unauthenticated_session_has_no_context():
    with Session(engine) as session:
        assert "current_user_id" not in session.info
        is_sqlite = session.bind.dialect.name == "sqlite"
        if not is_sqlite:
            result = session.execute(text("SELECT current_setting('app.current_user_id', true)")).scalar()
            assert result == '' or result is None

def test_authenticated_context_injection():
    # We bypass querying the out-of-sync User table and just test the SQLAlchemy hook
    with Session(engine) as session:
        is_sqlite = session.bind.dialect.name == "sqlite"
        if is_sqlite:
            return
            
        # 1. Simulate deps.py successful auth injection
        session.info["current_user_id"] = 123
        
        # We must trigger a query to start the transaction and fire after_begin
        result = session.execute(text("SELECT current_setting('app.current_user_id', true)")).scalar()
        assert result == "123"
        
        # 2. Test Commit Retains Context (after_begin fires again)
        session.commit()
        result2 = session.execute(text("SELECT current_setting('app.current_user_id', true)")).scalar()
        assert result2 == "123"

def test_context_isolation():
    with Session(engine) as session1:
        session1.info["current_user_id"] = 999
        is_sqlite = session1.bind.dialect.name == "sqlite"
        if not is_sqlite:
            # Trigger transaction
            res = session1.execute(text("SELECT current_setting('app.current_user_id', true)")).scalar()
            assert res == "999"
            
    # Session 2 should have NO context
    with Session(engine) as session2:
        assert "current_user_id" not in session2.info
        if not is_sqlite:
            result = session2.execute(text("SELECT current_setting('app.current_user_id', true)")).scalar()
            assert result == '' or result is None
