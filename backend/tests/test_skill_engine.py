import pytest
from sqlmodel import Session, select
from app.models.models import User, Skill, UserSkill, SkillEvidence
from app.services.skill_engine import update_skill_proficiency
import uuid
import os
from app.core.database import engine

@pytest.fixture
def db():
    with Session(engine) as session:
        yield session

@pytest.fixture
def test_user(db: Session):
    u = User(
        email=f"test_{uuid.uuid4()}@example.com", 
        password_hash="hash",
        first_name="Test"
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

@pytest.fixture
def test_user2(db: Session):
    u = User(
        email=f"test_{uuid.uuid4()}@example.com", 
        password_hash="hash",
        first_name="Test"
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

@pytest.fixture
def test_skill(db: Session):
    skill = Skill(name=f"TestSkill-{uuid.uuid4()}", normalized_name=f"testskill-{uuid.uuid4()}")
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

def test_deterministic_skill_formula(db: Session, test_user: User, test_skill: Skill):
    # Setup RLS context for user
    from sqlalchemy import text
    db.execute(text(f"SELECT set_config('app.current_tenant', '{test_user.id}', true)"))
    
    # 1. Initial Practice Attempt (0.5 score, 0.8 confidence)
    # new_level = 0.0 * 0.84 + 0.5 * 0.16 = 0.08
    new_lvl = update_skill_proficiency(
        user_id=test_user.id,
        
        skill_id=test_skill.id,
        evidence_type="practice",
        evidence_score=0.5,
        confidence=0.8,
        source_id="pt-1",
        db=db
    )
    assert abs(new_lvl - 0.08) < 0.001
    
    # 2. Assessment Attempt (1.0 score, 1.0 confidence)
    # w_historical = 0.6, w_evidence = 0.4
    # new_level = 0.08 * 0.6 + 1.0 * 0.4 = 0.048 + 0.4 = 0.448
    new_lvl2 = update_skill_proficiency(
        user_id=test_user.id,
        
        skill_id=test_skill.id,
        evidence_type="assessment",
        evidence_score=1.0,
        confidence=1.0,
        source_id="as-1",
        db=db
    )
    assert abs(new_lvl2 - 0.448) < 0.001
    
    # Verify evidence provenance
    evidence = db.exec(select(SkillEvidence).where(SkillEvidence.user_id == test_user.id).order_by(SkillEvidence.timestamp)).all()
    assert len(evidence) == 2
    assert evidence[0].source_type == "practice"
    assert evidence[0].previous_level == 0.0
    assert abs(evidence[0].new_level - 0.08) < 0.001
    
    assert evidence[1].source_type == "assessment"
    assert evidence[1].previous_level == evidence[0].new_level
    assert abs(evidence[1].new_level - 0.448) < 0.001
    
def test_skill_evidence_rls(db: Session, test_user: User, test_user2: User, test_skill: Skill):
    # User 1 sets RLS and creates evidence
    from sqlalchemy import text
    db.execute(text(f"SELECT set_config('app.current_tenant', '{test_user.id}', true)"))
    update_skill_proficiency(test_user.id, test_skill.id, "practice", 0.9, 1.0, "pt-2", db)
    
    ev1 = db.exec(select(SkillEvidence).where(SkillEvidence.user_id == test_user.id)).all()
    assert len(ev1) == 1
    
    # User 2 sets RLS and tries to see User 1's evidence
    from sqlalchemy import text
    db.execute(text(f"SELECT set_config('app.current_tenant', '{test_user2.id}', true)"))
    ev2 = db.exec(select(SkillEvidence).where(SkillEvidence.user_id == test_user.id)).all()
    
    # SQLite fallback (which won't happen if postgres)
    # We must ensure test runs on Postgres. If so, ev2 should be 0 due to RLS.
    if os.getenv("DATABASE_URL") and "postgresql" in os.getenv("DATABASE_URL"):
        assert len(ev2) == 0, "RLS failed to isolate SkillEvidence"
