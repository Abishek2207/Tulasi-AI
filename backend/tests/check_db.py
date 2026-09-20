import sys
from app.core.config import settings
from sqlalchemy import create_engine, text

u = settings.normalized_database_url
e = create_engine(u)
with e.connect() as c:
    res = c.execute(text("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'preferred_model'"))
    cols = res.fetchall()
    print("COLUMN:", cols)

    res2 = c.execute(text("SELECT id, email, preferred_model FROM "user" LIMIT 3".replace('"', '"')))
    print("USERS:", res2.fetchall())
