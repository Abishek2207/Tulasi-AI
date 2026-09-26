import os
import pytest
import os

if "REDACTED" in os.environ.get("DATABASE_URL", "REDACTED"):
    pytest.skip("Live Supabase credentials unavailable (blocked) - Skipping RLS live tests", allow_module_level=True)

from sqlalchemy import create_engine, text
from sqlmodel import Session, select
from app.models.models import User, Subscription
from app.core.security import get_password_hash
import uuid

# Use the environment DATABASE_URL or fallback (though the test runner will set it)
db_url = os.environ.get("DATABASE_URL", "postgresql://postgres.postgres:REDACTED@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require")

@pytest.fixture(scope="module")
def engine():
    return create_engine(db_url)

@pytest.fixture(scope="module")
def users(engine):
    # Setup: Create User A and User B
    with Session(engine) as db:
        ua_email = f"user_a_{uuid.uuid4().hex[:6]}@example.com"
        ub_email = f"user_b_{uuid.uuid4().hex[:6]}@example.com"
        
        user_a = User(email=ua_email, hashed_password=get_password_hash("pass"), name="User A")
        user_b = User(email=ub_email, hashed_password=get_password_hash("pass"), name="User B")
        
        db.add(user_a)
        db.add(user_b)
        db.commit()
        db.refresh(user_a)
        db.refresh(user_b)
        
        # Create a subscription for User A
        sub_a = Subscription(
            user_id=user_a.id, 
            plan="student", 
            amount=500.0, 
            currency="INR", 
            status="active"
        )
        # Create a subscription for User B
        sub_b = Subscription(
            user_id=user_b.id, 
            plan="professional", 
            amount=700.0, 
            currency="INR", 
            status="active"
        )
        db.add(sub_a)
        db.add(sub_b)
        db.commit()
        db.refresh(sub_a)
        db.refresh(sub_b)
        db.refresh(user_a)
        db.refresh(user_b)
        
        yield (user_a, user_b, sub_a, sub_b)

def test_rls_isolation_user_a(engine, users):
    user_a, user_b, sub_a, sub_b = users
    
    with engine.connect() as conn:
        try:
            conn.execute(text("SET ROLE authenticated"))
        except Exception as e:
            pytest.fail(f"Could not SET ROLE authenticated: {e}")
            
        # Impersonate User A
        conn.execute(text(f"SELECT set_config('app.current_user_id', '{user_a.id}', true)"))
        
        # Query subscriptions without python-level user_id filters
        res = conn.execute(text("SELECT id, user_id, plan FROM subscription")).fetchall()
        
        # We should ONLY see User A's subscription
        assert len(res) == 1, f"Expected 1 subscription, got {len(res)}. Bypass RLS issue?"
        assert res[0].user_id == user_a.id
        assert res[0].id == sub_a.id

def test_rls_isolation_user_b(engine, users):
    user_a, user_b, sub_a, sub_b = users
    
    with engine.connect() as conn:
        try:
            conn.execute(text("SET ROLE authenticated"))
        except Exception as e:
            pytest.fail(f"Could not SET ROLE authenticated: {e}")
            
        # Impersonate User B
        conn.execute(text(f"SELECT set_config('app.current_user_id', '{user_b.id}', true)"))
        
        res = conn.execute(text("SELECT id, user_id, plan FROM subscription")).fetchall()
        
        assert len(res) == 1
        assert res[0].user_id == user_b.id
        assert res[0].id == sub_b.id

def test_rls_modification_isolation(engine, users):
    user_a, user_b, sub_a, sub_b = users
    
    with engine.connect() as conn:
        try:
            conn.execute(text("SET ROLE authenticated"))
        except Exception as e:
            pytest.fail(f"Could not SET ROLE authenticated: {e}")
            
        # Impersonate User A
        conn.execute(text(f"SELECT set_config('app.current_user_id', '{user_a.id}', true)"))
        
        # Try to modify User B's subscription
        res = conn.execute(text(f"UPDATE subscription SET status = 'cancelled' WHERE id = {sub_b.id} RETURNING id")).fetchall()
        
        # Update should affect 0 rows because User A cannot see/modify User B's rows
        assert len(res) == 0, "User A was able to modify User B's subscription!"


