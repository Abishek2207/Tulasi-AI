
import sys
import os
import asyncio
import json
from pydantic import BaseModel

# Setup env
sys.path.append(os.path.abspath("backend"))

from app.core.database import get_session, init_db
from app.api.intelligence_v2 import get_salary_intel, SalaryRequest
from app.models.models import User
from sqlmodel import select

async def main():
    print("🚀 Verifying Salary Intelligence Backend...")
    init_db()
    db = next(get_session())
    try:
        user = db.exec(select(User).limit(1)).first()
        if not user:
            print("❌ No user found in database to test with.")
            return

        # Mock request object
        class MockRequest:
            def __init__(self):
                self.state = type('obj', (object,), {'view_count': 0})
        
        mock_req = MockRequest()
        
        # Test 1: Software Engineer, Bangalore, 2 YOE
        print("\nTest 1: Software Engineer, Bangalore, 2 YOE")
        body = SalaryRequest(role="Software Engineer", location="Bangalore", yoe=2)
        try:
            result = get_salary_intel(request=mock_req, body=body, db=db, current_user=user)
            print("✅ Result received:")
            print(json.dumps(result, indent=2))
            
            if "salary_range" in result:
                print("✨ Data structure looks VALID.")
            else:
                print("⚠️  Data structure might be missing 'salary_range'.")
        except Exception as e:
            print(f"❌ Error in Test 1: {e}")

        # Test 2: AI Engineer, USA, 5 YOE
        print("\nTest 2: AI Engineer, USA, 5 YOE")
        body = SalaryRequest(role="AI Engineer", location="USA", yoe=5)
        try:
            result = get_salary_intel(request=mock_req, body=body, db=db, current_user=user)
            print("✅ Result received:")
            # Just print keys to keep output clean if it's long
            print(f"Keys: {list(result.keys())}")
            print(f"Salary Range: {result.get('salary_range')}")
        except Exception as e:
            print(f"❌ Error in Test 2: {e}")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
