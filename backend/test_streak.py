import asyncio
from sqlmodel import Session, select
from app.core.database import engine
from app.api.auth import oauth_login, OAuthLoginRequest
from app.models.models import User
from datetime import date, timedelta

def test_oauth_streak():
    with Session(engine) as db:
        # 1. Create a dummy user
        dummy_email = "test.streak@tulasi.ai"
        user = db.exec(select(User).where(User.email == dummy_email)).first()
        if user:
            db.delete(user)
            db.commit()

        # 2. Simulate First OAuth Login
        req = OAuthLoginRequest(email=dummy_email, name="Test Streak", provider="google")
        res1 = oauth_login(req, db)
        
        # Verify Token exists
        assert res1["access_token"] is not None
        
        # Verify User created and logged
        user = db.exec(select(User).where(User.email == dummy_email)).first()
        print(f"First Login Streak: {user.streak}, Last Activity: {user.last_activity_date}")
        assert user.streak == 1
        assert user.last_activity_date == date.today().isoformat()

        # 3. Simulate Next Day Login (by artificially backdating the user)
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        user.last_activity_date = yesterday
        db.add(user)
        db.commit()

        # Login again
        res2 = oauth_login(req, db)
        db.refresh(user)
        print(f"Second Login Streak: {user.streak}, Last Activity: {user.last_activity_date}")
        assert user.streak == 2
        
        print("✅ OAuth Streak Logic Verified Successfully!")

if __name__ == "__main__":
    test_oauth_streak()
