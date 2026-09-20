from sqlmodel import Session, create_engine
from app.core.config import settings
from app.services.taxonomy import seed_taxonomy

engine = create_engine(settings.normalized_database_url)
with Session(engine) as db:
    seed_taxonomy(db)
    print("Taxonomy seeded successfully!")
