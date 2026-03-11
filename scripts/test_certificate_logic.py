import sys
import os

# Add backend directory to Python path so we can import app modules
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
sys.path.insert(0, backend_dir)

from sqlmodel import Session, select
from app.core.database import engine
from app.models.models import User, UserProgress, Certificate
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
import uuid

def run_test():
    print("--- Starting Strict Certificate Logic Test ---")
    # 1. Setup Test User
    with Session(engine) as db:
        test_email = f"strict_test_{uuid.uuid4().hex[:6]}@example.com"
        user = User(
            email=test_email, 
            hashed_password="pw", 
            name="Strict Tester", 
            role="student", 
            invite_code="TESTC"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Start with 50% progress
        prog = UserProgress(user_id=user.id, category="coding", progress_pct=50)
        db.add(prog)
        db.commit()

        token = create_access_token({"sub": user.email})
        
    client = TestClient(app)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Test Rejection at 50%
    print("\n[Test 1] Attempting to generate 'Coding Arena Master' certificate with 50% progress...")
    res = client.post("/api/certificates/generate/coding_complete", headers=headers)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.json()}")
    assert res.status_code == 403, "Certificate generation should have been REJECTED (403)"
    print("✅ Test 1 Passed: Correctly rejected generation at 50% progress.")

    # 3. Update to 100%
    print("\n[Setup] Simulating user completing 100% of coding challenges...")
    with Session(engine) as db:
        prog = db.exec(select(UserProgress).where(UserProgress.user_id == user.id)).first()
        prog.progress_pct = 100
        db.add(prog)
        db.commit()

    # 4. Test Approval at 100%
    print("\n[Test 2] Attempting to generate certificate with 100% progress...")
    res = client.post("/api/certificates/generate/coding_complete", headers=headers)
    print(f"Status Code: {res.status_code}")
    print(f"Response: {res.json()}")
    assert res.status_code == 200, "Certificate generation should have SUCCEEDED (200)"
    assert "id" in res.json().get("certificate", {}), "Certificate ID missing from response"
    print("✅ Test 2 Passed: Correctly generated certificate at 100% progress.")

    print("\n🎉 All tests passed successfully! The strict certificate logic is solid.")

if __name__ == "__main__":
    run_test()
