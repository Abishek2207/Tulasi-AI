import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
sys.path.insert(0, backend_dir)

from sqlmodel import SQLModel, create_engine, Session
from app.models.models import User, UserProgress, Certificate
from app.api.certificates import generate_certificate
from fastapi import HTTPException
import uuid

def run_in_memory_test():
    print("--- Starting Strict Certificate Logic (In-Memory Unit Test) ---")
    
    # 1. Setup In-Memory DB
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as db:
        # Create user
        user = User(
            email=f"test_{uuid.uuid4().hex[:6]}@example.com",
            hashed_password="pw",
            name="Memory Tester",
            role="student",
            invite_code="MEM123",
            streak=1,
            xp=0,
            level=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Start with 50% for coding
        prog = UserProgress(user_id=user.id, category="coding", progress_pct=50, total_items=100, completed_items=50)
        db.add(prog)
        db.commit()
        
        print("\n[Test 1] Attempting to generate 'Coding Arena Master' with 50% progress...")
        try:
            generate_certificate(milestone_id="coding_complete", db=db, current_user=user)
            print("❌ FAILED: Exception was NOT raised! Certificate was generated illegitimately.")
            sys.exit(1)
        except HTTPException as e:
            if e.status_code == 403:
                print(f"✅ PASSED: Correctly blocked! Backend responded with: {e.detail}")
            else:
                print(f"❌ FAILED with wrong HTTP status code: {e.status_code}")
                sys.exit(1)
                
        # 2. Update to 100%
        print("\n[Setup] User completes all remaining problems to reach 100%...")
        prog.progress_pct = 100
        prog.completed_items = 100
        db.add(prog)
        db.commit()
        
        print("\n[Test 2] Attempting to generate 'Coding Arena Master' with 100% progress...")
        try:
            res = generate_certificate(milestone_id="coding_complete", db=db, current_user=user)
            print(f"✅ PASSED: Certificate Successfully Generated! Return value: {res['message']}")
            print(f"    Certificate ID: {res['certificate']['id']}")
        except HTTPException as e:
            print(f"❌ FAILED: Generation blocked improperly! {e.detail}")
            sys.exit(1)
            
        print("\n🎉 Excellent! The strict backend certificate verification mathematically works perfectly.")

if __name__ == "__main__":
    run_in_memory_test()
