import pytest
import os
import uuid
from sqlmodel import Session, select
from app.core.database import engine
from app.models.models import User, CareerRole, Skill, RoleSkillRequirement, UserSkill, UserRoadmap, ActionTask, UserProject, CareerReadinessLog
from app.services.execution_service import ExecutionService
from app.services.project_service import ProjectService
from app.services.career_readiness_service import CareerReadinessService

@pytest.fixture(scope="module")
def db_session():
    with Session(engine) as session:
        yield session

def test_career_readiness_deterministic(db_session):
    # Create test user
    uid = str(uuid.uuid4())[:8]
    user = User(email=f"readiness_{uid}@test.com", password_hash="hash", auth_provider="email")
    db_session.add(user)
    
    # Create Role
    role = CareerRole(name=f"Data Scientist {uid}", normalized_name=f"ds_{uid}", description="Test")
    db_session.add(role)
    db_session.commit()

    # Create Skills
    s1 = Skill(name=f"Python {uid}", category="Tech")
    s2 = Skill(name=f"SQL {uid}", category="Tech")
    db_session.add_all([s1, s2])
    db_session.commit()

    # Create Requirements
    req1 = RoleSkillRequirement(role_id=role.id, skill_id=s1.id, minimum_level=0.8, importance=1.0)
    req2 = RoleSkillRequirement(role_id=role.id, skill_id=s2.id, minimum_level=0.6, importance=0.5)
    db_session.add_all([req1, req2])
    db_session.commit()

    # Calculate readiness before skills
    res = CareerReadinessService.calculate_readiness(db_session, user.id, role.id)
    assert res['score'] == 0.0

    # Add user skills
    # python 0.4 (cap 0.8), sql 0.9 (cap 0.6)
    us1 = UserSkill(user_id=user.id, skill_id=s1.id, proficiency=0.4)
    us2 = UserSkill(user_id=user.id, skill_id=s2.id, proficiency=0.9)
    db_session.add_all([us1, us2])
    db_session.commit()

    # Calc again
    res2 = CareerReadinessService.calculate_readiness(db_session, user.id, role.id)
    
    # Total required = (0.8 * 1.0) + (0.6 * 0.5) = 0.8 + 0.3 = 1.1
    # Total achieved = (min(0.4, 0.8) * 1.0) + (min(0.9, 0.6) * 0.5) = 0.4 + 0.3 = 0.7
    # Score = 0.7 / 1.1 = 0.636363...
    assert round(res2['score'], 4) == 0.6364
    
    # Verify snapshot log
    log = db_session.exec(select(CareerReadinessLog).where(CareerReadinessLog.user_id == user.id).order_by(CareerReadinessLog.timestamp.desc())).first()
    assert log is not None
    assert round(log.readiness_score, 4) == 0.6364

def test_project_evidence_integration(db_session):
    uid = str(uuid.uuid4())[:8]
    user = User(email=f"proj_{uid}@test.com", password_hash="hash", auth_provider="email")
    skill = Skill(name=f"Django {uid}", category="Tech")
    db_session.add_all([user, skill])
    db_session.commit()

    # Create project
    proj = ProjectService.create_project(
        db=db_session,
        user_id=user.id,
        title="Test App",
        description="Built an app",
        project_url="github.com",
        skill_ids=[skill.id]
    )
    assert proj.status == 'active'

    # Complete project
    ProjectService.complete_project(db_session, user.id, proj.id)

    # Check that proficiency was updated by Phase 2 Skill Engine
    us = db_session.exec(select(UserSkill).where(UserSkill.user_id == user.id, UserSkill.skill_id == skill.id)).first()
    assert us is not None
    assert us.proficiency > 0.0

def test_execution_roadmap_and_tasks(db_session):
    uid = str(uuid.uuid4())[:8]
    user = User(email=f"exec_{uid}@test.com", password_hash="hash", auth_provider="email")
    role = CareerRole(name=f"Backend {uid}", normalized_name=f"backend {uid}".lower(), description="Test")
    db_session.add_all([user, role])
    db_session.commit()

    s1 = Skill(name=f"Go {uid}", category="Tech")
    db_session.add(s1)
    db_session.commit()
    req = RoleSkillRequirement(role_id=role.id, skill_id=s1.id, minimum_level=0.7, importance=1.0)
    db_session.add(req)
    db_session.commit()

    # Generate Roadmap
    roadmap = ExecutionService.generate_roadmap(db_session, user.id, role.id)
    assert roadmap.status == 'active'

    rm_data = ExecutionService.get_roadmap(db_session, user.id)
    assert len(rm_data['milestones']) == 1

    # Generate daily tasks
    tasks = ExecutionService.generate_daily_tasks(db_session, user.id)
    assert len(tasks) == 1
    assert tasks[0].status == 'pending'
    
    # Idempotent task generation
    tasks_dup = ExecutionService.generate_daily_tasks(db_session, user.id)
    assert tasks[0].id == tasks_dup[0].id

    # Complete task
    completed = ExecutionService.complete_task(db_session, user.id, tasks[0].id)
    assert completed.status == 'completed'
    assert completed.completed_at is not None
