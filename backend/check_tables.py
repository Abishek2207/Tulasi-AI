from sqlmodel import Session, create_engine
from app.core.config import settings
from sqlalchemy import text
engine = create_engine(settings.normalized_database_url)
with Session(engine) as db:
    print(db.exec(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).all())
