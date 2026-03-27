
from sqlmodel import Session, select, create_engine
import sys
import os

# Adjust path to import app modules if necessary
sys.path.append(os.getcwd())

from app.models.models import Review, User

def cleanup():
    engine = create_engine('sqlite:///./tulasi_ai.db')
    with Session(engine) as session:
        # 1. Promote User
        user = session.exec(select(User).where(User.email == 'abishekramamoorthy22@gmail.com')).first()
        if user:
            user.role = 'admin'
            session.add(user)
            print(f"✅ User {user.email} promoted to admin in DB.")
        else:
            print("❌ User abishekramamoorthy22@gmail.com not found in DB.")

        # 2. Delete Spam
        spam_reviews = session.exec(select(Review).where(Review.review.contains('mia kalifa'))).all()
        for r in spam_reviews:
            session.delete(r)
            print(f"🗑️ Deleted spam review ID {r.id}: {r.review[:30]}...")
        
        session.commit()
        print("🚀 Database synchronized.")

if __name__ == "__main__":
    cleanup()
