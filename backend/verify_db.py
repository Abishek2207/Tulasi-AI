from sqlmodel import Session, create_engine
from app.core.config import settings
from sqlalchemy import text
import json

engine = create_engine(settings.normalized_database_url)
with Session(engine) as db:
    print("--- TABLES ---")
    tables = db.exec(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).all()
    print([t[0] for t in tables if t[0] in ['skill', 'careerrole', 'roleskillrequirement', 'userskill', 'job']])
    
    print("\n--- ALEMBIC VERSION ---")
    print(db.exec(text("SELECT version_num FROM alembic_version")).all())
    
    print("\n--- TABLE COUNTS ---")
    print("Skill:", db.exec(text("SELECT COUNT(*) FROM skill")).first()[0])
    print("CareerRole:", db.exec(text("SELECT COUNT(*) FROM careerrole")).first()[0])
    print("RoleSkillRequirement:", db.exec(text("SELECT COUNT(*) FROM roleskillrequirement")).first()[0])
    print("UserSkill:", db.exec(text("SELECT COUNT(*) FROM userskill")).first()[0])
    print("Job:", db.exec(text("SELECT COUNT(*) FROM job")).first()[0])

    print("\n--- AI ENGINEER SAMPLE ---")
    ai_eng = db.exec(text("SELECT id, name FROM careerrole WHERE normalized_name='ai engineer'")).first()
    if ai_eng:
        reqs = db.exec(text(f"SELECT s.name, r.importance, r.minimum_level FROM roleskillrequirement r JOIN skill s ON r.skill_id = s.id WHERE r.role_id = {ai_eng[0]}")).all()
        print(f"Role: {ai_eng[1]}")
        for r in reqs:
            print(f"  - {r[0]}: importance={r[1]}, min_level={r[2]}")
