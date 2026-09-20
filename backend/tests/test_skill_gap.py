import pytest
from sqlmodel import Session, create_engine, select
from fastapi.testclient import TestClient
import json

from app.models.models import User, Skill, CareerRole, RoleSkillRequirement, UserSkill, Job, JobSkillRequirement
from app.services.intelligence_service import intelligence_service
from app.services.smart_job_match_service import smart_job_match_service
from app.core.database import engine

@pytest.fixture(scope="module")
def db():
    from sqlmodel import SQLModel, Session
    # Use standard engine but in a transaction
    with Session(engine) as session:
        yield session
        session.rollback()

def test_ai_engineer_skill_gap(db: Session):
    # 1. Setup Taxonomy (similar to seeder)
    role = db.exec(select(CareerRole).where(CareerRole.normalized_name == "ai engineer")).first()
    if not role:
        role = CareerRole(name="AI Engineer", normalized_name="ai engineer")
        db.add(role)
        db.commit()
    
    python_skill = db.exec(select(Skill).where(Skill.normalized_name == "python")).first()
    if not python_skill:
        python_skill = Skill(name="Python", normalized_name="python", category="Programming")
        db.add(python_skill)
        db.commit()

    ml_skill = db.exec(select(Skill).where(Skill.normalized_name == "machine learning")).first()
    if not ml_skill:
        ml_skill = Skill(name="Machine Learning", normalized_name="machine learning", category="AI")
        db.add(ml_skill)
        db.commit()

    docker_skill = db.exec(select(Skill).where(Skill.normalized_name == "docker")).first()
    if not docker_skill:
        docker_skill = Skill(name="Docker", normalized_name="docker", category="DevOps")
        db.add(docker_skill)
        db.commit()
    
    # Ensure role requirements exist
    reqs = db.exec(select(RoleSkillRequirement).where(RoleSkillRequirement.role_id == role.id)).all()
    if not reqs:
        db.add(RoleSkillRequirement(role_id=role.id, skill_id=python_skill.id, importance=0.9, minimum_level=0.8))
        db.add(RoleSkillRequirement(role_id=role.id, skill_id=ml_skill.id, importance=0.95, minimum_level=0.8))
        db.add(RoleSkillRequirement(role_id=role.id, skill_id=docker_skill.id, importance=0.6, minimum_level=0.5))
        db.commit()

    # 2. Setup User
    import uuid
    unique_email = f"aie_{uuid.uuid4().hex[:8]}@example.com"
    user = User(email=unique_email, name="AI User", hashed_password="hash", role="student")
    db.add(user)
    db.commit()

    # 3. Setup User Skills (Proficient in Python, completely missing ML and Docker)
    db.add(UserSkill(user_id=user.id, skill_id=python_skill.id, proficiency=0.9, evidence="Repo"))
    db.commit()

    # 4. Test Intelligence Service Gap Analysis
    result = intelligence_service.get_user_skill_gap(db, user.id, "AI Engineer")
    
    assert not result["error"]
    assert result["target_role"] == "AI Engineer"
    assert len(result["strong_skills"]) == 1
    assert result["strong_skills"][0]["skill_name"] == "Python"
    
    assert len(result["gaps"]) >= 2
    # ML is the most important skill for AI Engineer in our seeder, so it should be near the top
    assert result["gaps"][0]["skill_name"] == "Machine Learning"

    # 5. Test Job Matching
    import uuid
    unique_hash = f"hash_{uuid.uuid4().hex[:8]}"
    job = Job(title="Senior AI Engineer", source="test", company="OpenAI", description="Needs Python, Machine Learning, and Docker", content_hash=unique_hash)
    db.add(job)
    db.commit()
    
    db.add(JobSkillRequirement(job_id=job.id, skill_id=python_skill.id, importance=1.0))
    db.add(JobSkillRequirement(job_id=job.id, skill_id=ml_skill.id, importance=1.0))
    db.commit()
    
    matches_result = smart_job_match_service.get_matched_jobs(db, user.id, "AI Engineer")
    matches = matches_result["matches"]
    
    assert len(matches) >= 1
    job_match = [m for m in matches if m["job"]["company"] == "OpenAI"][0]
    
    assert "Python" in job_match["matched_skills"]
    assert "Machine Learning" in job_match["missing_skills"]
    assert job_match["match_score"] == 50.0  # Matched 1 out of 2 equally important requirements
