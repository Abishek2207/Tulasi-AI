from sqlmodel import Session, create_engine
from app.core.config import settings
from sqlalchemy import text

engine = create_engine(settings.normalized_database_url)
with Session(engine) as db:
    policies = db.exec(text("SELECT polname, polcmd, polqual, polwithcheck FROM pg_policy WHERE polrelid = 'subscription'::regclass")).all()
    for p in policies:
        print(f"Sub Policy: {p[0]} | cmd: {p[1]} | qual: {p[2]} | withcheck: {p[3]}")
    
    policies = db.exec(text("SELECT polname, polcmd, polqual, polwithcheck FROM pg_policy WHERE polrelid = 'user'::regclass")).all()
    for p in policies:
        print(f"User Policy: {p[0]} | cmd: {p[1]} | qual: {p[2]} | withcheck: {p[3]}")
