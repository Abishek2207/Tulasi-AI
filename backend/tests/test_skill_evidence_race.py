import pytest
import uuid
import asyncio
from sqlmodel import Session, select
from app.models.models import User, Skill, SkillEvidence, UserSkill
from app.services.skill_engine import update_skill_proficiency
from app.core.database import get_session

def test_concurrent_skill_evidence_replay():
    db_session = next(get_session())
    # Setup test data
    user = User(email=f"test_{uuid.uuid4().hex[:6]}@example.com", password_hash="test", auth_provider="email")
    skill = Skill(name=f"Concurrency Test Skill {uuid.uuid4().hex[:6]}", category="Testing")
    db_session.add_all([user, skill])
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(skill)

    # 1. Test duplicate source_id (race condition simulation)
    # The first one should succeed
    new_level_1 = update_skill_proficiency(
        user_id=user.id,
        skill_id=skill.id,
        evidence_type="project",
        evidence_score=0.9,
        confidence=1.0,
        source_id="proj_123",
        db=db_session
    )
    
    # The second one should hit the unique constraint and/or python pre-check 
    # but not blow up with a 500 error, and should return the existing new_level.
    new_level_2 = update_skill_proficiency(
        user_id=user.id,
        skill_id=skill.id,
        evidence_type="project",
        evidence_score=0.9,
        confidence=1.0,
        source_id="proj_123",
        db=db_session
    )

    assert new_level_1 == pytest.approx(new_level_2)

    # Verify only ONE SkillEvidence row was created for proj_123
    evidence = db_session.exec(
        select(SkillEvidence).where(
            SkillEvidence.user_id == user.id,
            SkillEvidence.source_id == "proj_123"
        )
    ).all()
    assert len(evidence) == 1, "Duplicate evidence created despite uniqueness!"

    # 2. Test independent source_ids
    new_level_3 = update_skill_proficiency(
        user_id=user.id,
        skill_id=skill.id,
        evidence_type="project",
        evidence_score=0.8,
        confidence=1.0,
        source_id="proj_456",
        db=db_session
    )

    # Should have updated and created a new evidence row
    assert new_level_3 != new_level_1
    evidence_all = db_session.exec(
        select(SkillEvidence).where(
            SkillEvidence.user_id == user.id,
            SkillEvidence.source_type == "project"
        )
    ).all()
    assert len(evidence_all) == 2, "Failed to preserve legitimate independent evidence records!"

    # 3. Test nullable source_id (independent evaluations)
    new_level_null_1 = update_skill_proficiency(
        user_id=user.id,
        skill_id=skill.id,
        evidence_type="assessment",
        evidence_score=1.0,
        confidence=1.0,
        source_id=None,
        db=db_session
    )

    new_level_null_2 = update_skill_proficiency(
        user_id=user.id,
        skill_id=skill.id,
        evidence_type="assessment",
        evidence_score=1.0,
        confidence=1.0,
        source_id=None,
        db=db_session
    )

    # PostgreSQL allows multiple NULLs in unique constraints, which correctly
    # preserves legitimate independent evidence records for assessments.
    evidence_nulls = db_session.exec(
        select(SkillEvidence).where(
            SkillEvidence.user_id == user.id,
            SkillEvidence.source_type == "assessment"
        )
    ).all()
    assert len(evidence_nulls) == 2, "Failed to preserve legitimate independent evidence records for null source_id!"
