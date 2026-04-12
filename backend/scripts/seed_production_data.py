import os
import sys
from datetime import datetime

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlmodel import Session, select, text
from app.core.database import engine
from app.models.models import Hackathon, Review, User
from app.core.constants import REAL_HACKATHONS, REAL_REVIEWS

def seed():
    with Session(engine) as db:
        # 1. Promote Admin
        print("👤 Checking admin users...")
        admin_emails = ["abishekramamoorthy22@gmail.com", "abishek.ramamoorthy.dev@gmail.com"]
        for email in admin_emails:
            u = db.exec(select(User).where(User.email == email)).first()
            if u:
                u.role = "admin"
                db.add(u)
                print(f"✅ Promoted {email} to admin.")
        db.commit()

        # ⭐ Seeding professional reviews...
        print("\n⭐ Seeding professional reviews...")
        added_r = 0
        skipped_r = 0
        for r in REAL_REVIEWS:
            # Check if this review text already exists
            existing = db.execute(text("SELECT id FROM review WHERE review = :rev"), {"rev": r["review"]}).first()
            if existing:
                skipped_r += 1
                continue
            
            new_review = Review(
                name=r["name"],
                role=r["role"],
                review=r["review"],
                rating=r["rating"],
                created_at=datetime.utcnow(),
            )
            db.add(new_review)
            added_r += 1
        db.commit()
        print(f"✅ Seeded {added_r} reviews ({skipped_r} skipped).")

        # 3. Seed Hackathons
        print("\n🚀 Seeding global hackathons...")
        added_h = 0
        skipped_h = 0
        for h_data in REAL_HACKATHONS:
            existing = db.exec(select(Hackathon).where(Hackathon.name == h_data["name"])).first()
            if existing:
                skipped_h += 1
                continue
            
            h = Hackathon(
                name=h_data["name"],
                organizer=h_data["organizer"],
                description=h_data["description"],
                prize=h_data["prize"],
                prize_pool=h_data["prize"],
                deadline=h_data["deadline"],
                link=h_data["link"],
                registration_link=h_data["link"],
                tags=h_data["tags"],
                status=h_data["status"],
                is_active=True,
                mode="Online",
                difficulty="Beginner",
                image_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=60",
                participants_count=0
            )
            db.add(h)
            added_h += 1
        db.commit()
        print(f"✅ Seeded {added_h} hackathons ({skipped_h} skipped).")

    print("\n🎉 PRODUCTION SEEDING COMPLETE!")

if __name__ == "__main__":
    seed()
