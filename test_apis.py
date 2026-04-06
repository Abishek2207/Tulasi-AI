import sys
import os
import asyncio

# Setup env
sys.path.append(os.path.abspath("backend"))

from backend.app.core.database import get_session
from backend.app.api.feed import get_feed
from backend.app.api.messages import get_user_directory

async def main():
    db = next(get_session())
    try:
        from backend.app.models.models import User
        from sqlmodel import select
        user = db.exec(select(User).limit(1)).first()
        if not user:
            print("No user found")
            return
            
        print("Testing getting feed:")
        try:
            feed = await get_feed(tab="global", db=db, current_user=user)
            print("Feed length:", len(feed))
        except Exception as e:
            import traceback
            traceback.print_exc()

        print("\nTesting user directory:")
        try:
            users = get_user_directory(current_user=user, db=db)
            print("Directory Length:", len(users.get('users', [])))
        except Exception as e:
            import traceback
            traceback.print_exc()
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
