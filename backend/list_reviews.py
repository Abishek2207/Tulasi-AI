from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
with engine.connect() as conn:
    res = conn.execute(text('SELECT id, name, review FROM review')).fetchall()
    for r in res:
        print(f"ID: {r.id} | Name: {r.name} | Review: {r.review}")
