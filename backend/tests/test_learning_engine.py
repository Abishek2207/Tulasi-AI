import pytest
from sqlmodel import Session, select
from app.models.models import User, Skill, Goal, CareerRole, RoleSkillRequirement, LearningTopic, LearningResource, PracticeTask, Assessment, AssessmentQuestion
from app.services.learning_engine import learning_engine
import uuid
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
def learning_setup(db: Session, test_user: User):
    role_name = f"Role-{uuid.uuid4()}"
    role = CareerRole(name=role_name, normalized_name=role_name.lower())
    db.add(role)
    
    skill = Skill(name=f"Skill-{uuid.uuid4()}", normalized_name=f"skill-{uuid.uuid4()}")
    db.add(skill)
    db.commit()
    db.refresh(role)
    db.refresh(skill)
    
    req = RoleSkillRequirement(role_id=role.id, skill_id=skill.id, importance=1.0, minimum_level=0.8)
    db.add(req)
    
    goal = Goal(user_id=test_user.id, target_role=role.name, status='active', daily_minutes=60, goal="Test Goal")
    db.add(goal)
    
    topic = LearningTopic(skill_id=skill.id, name="Test Topic")
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    resource = LearningResource(topic_id=topic.id, title="Test Resource", url="http://test.com")
    db.add(resource)
    
    pt = PracticeTask(skill_id=skill.id, title="Test Practice", prompt="1+1", expected_output="2", evaluation_method="exact_match")
    db.add(pt)
    
    ass = Assessment(skill_id=skill.id, title="Test Assessment")
    db.add(ass)
    db.commit()
    db.refresh(ass)
    
    ass_q = AssessmentQuestion(assessment_id=ass.id, prompt="A or B?", expected_answer="A")
    db.add(ass_q)
    db.commit()
    db.refresh(pt)
    db.refresh(ass)
    
    return {"role": role, "skill": skill, "goal": goal, "topic": topic, "resource": resource, "practice": pt, "assessment": ass}

def test_get_next_best_learning_action(db: Session, test_user: User, learning_setup: dict):
    # Set RLS
    from sqlalchemy import text
    db.execute(text(f"SELECT set_config('app.current_tenant', '{test_user.id}', true)"))
    
    res = learning_engine.get_next_best_learning_action(db, test_user.id)
    
    assert res["error"] is False
    assert res["target_role"] == learning_setup["role"].name
    assert res["priority_skill"]["skill_name"] == learning_setup["skill"].name
    assert res["next_topic"]["name"] == learning_setup["topic"].name
    assert res["next_resource"]["title"] == learning_setup["resource"].title
    assert res["assessment_available"] is True
    assert res["practice_available"] is True

def test_evaluate_practice(db: Session, test_user: User, learning_setup: dict):
    from sqlalchemy import text
    db.execute(text(f"SELECT set_config('app.current_tenant', '{test_user.id}', true)"))
    pt_id = learning_setup["practice"].id
    
    # Incorrect
    attempt_bad = learning_engine.evaluate_practice(db, test_user.id, pt_id, "3")
    assert attempt_bad.score == 0.0
    
    # Correct
    attempt_good = learning_engine.evaluate_practice(db, test_user.id, pt_id, "2")
    assert attempt_good.score == 1.0

def test_evaluate_assessment(db: Session, test_user: User, learning_setup: dict):
    from sqlalchemy import text
    db.execute(text(f"SELECT set_config('app.current_tenant', '{test_user.id}', true)"))
    ass_id = learning_setup["assessment"].id
    
    # Need question id
    q = db.exec(select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == ass_id)).first()
    
    # Correct
    attempt = learning_engine.evaluate_assessment(db, test_user.id, ass_id, {q.id: "A"})
    assert attempt.score == 1.0
    assert attempt.passed is True

