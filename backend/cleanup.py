from sqlmodel import Session, create_engine
from app.core.config import settings
from sqlalchemy import text

engine = create_engine(settings.normalized_database_url)
with Session(engine) as db:
    db.exec(text("DELETE FROM userskill WHERE user_id IN (SELECT id FROM \"user\" WHERE email = 'aie@example.com')"))
    db.exec(text("DELETE FROM \"user\" WHERE email = 'aie@example.com'"))
    db.commit()
