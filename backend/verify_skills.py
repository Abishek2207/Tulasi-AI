import json
from sqlmodel import Session, create_engine, select
from app.core.config import settings
from app.models.models import User, Skill, UserSkill, CareerRole
from app.services.intelligence_service import intelligence_service
from app.services.smart_job_match_service import smart_job_match_service

engine = create_engine(settings.normalized_database_url)
with Session(engine) as db:
    # 1. Create temporary deterministic test user
    test_user = User(email="test_strict_verify_2@example.com", name="Test Verify User", password_hash="hash")
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    # 2. Add skills: Python = 0.8, SQL = 0.7, Machine Learning = 0.4
    skills_map = {s.name: s for s in db.exec(select(Skill)).all()}
    db.add(UserSkill(user_id=test_user.id, skill_id=skills_map['Python'].id, proficiency=0.8))
    db.add(UserSkill(user_id=test_user.id, skill_id=skills_map['SQL'].id, proficiency=0.7))
    db.add(UserSkill(user_id=test_user.id, skill_id=skills_map['Machine Learning'].id, proficiency=0.4))
    db.commit()
    
    # 3. Test Skill Gap
    print("\n=== SKILL GAP REAL TEST ===")
    gap_result = intelligence_service.get_user_skill_gap(db, test_user.id, "AI Engineer")
    print(json.dumps(gap_result, indent=2))
    
    # 4. Job Match Verification
    print("\n=== JOB MATCH VERIFICATION ===")
    # Job match also uses remotive to sync, so this tests both
    job_match_result = smart_job_match_service.get_matched_jobs(db, test_user.id, "AI Engineer")
    print(json.dumps(job_match_result.get("matches", [])[:1], indent=2))
    
    # Cleanup test user
    for us in db.exec(select(UserSkill).where(UserSkill.user_id == test_user.id)).all():
        db.delete(us)
    db.delete(test_user)
    db.commit()
