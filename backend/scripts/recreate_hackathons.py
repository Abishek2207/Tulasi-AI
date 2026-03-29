from sqlmodel import Session, SQLModel, create_engine, select
from app.core.database import engine
from app.models.models import Hackathon, HackathonBookmark, HackathonApplication

def recreate():
    print("🛠️ Dropping Hackathon-related tables...")
    try:
        # We need to drop dependent tables first if they have foreign keys
        HackathonApplication.__table__.drop(engine, checkfirst=True)
        HackathonBookmark.__table__.drop(engine, checkfirst=True)
        Hackathon.__table__.drop(engine, checkfirst=True)
        
        print("🏗️ Creating fresh tables...")
        SQLModel.metadata.create_all(engine)
        print("✅ Tables recreated successfully.")
    except Exception as e:
        print(f"❌ Error recreating tables: {e}")

if __name__ == "__main__":
    recreate()
