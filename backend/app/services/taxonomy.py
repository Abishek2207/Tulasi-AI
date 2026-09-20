from sqlmodel import Session, select
from app.models.models import Skill, CareerRole, RoleSkillRequirement

SEED_ROLES = [
    {
        "name": "AI Engineer",
        "description": "Develops, deploys, and optimizes AI models and pipelines.",
        "skills": [
            {"name": "Python", "importance": 1.0, "minimum_level": 0.6, "category": "Programming"},
            {"name": "Machine Learning", "importance": 1.0, "minimum_level": 0.7, "category": "AI/ML"},
            {"name": "Deep Learning", "importance": 0.9, "minimum_level": 0.6, "category": "AI/ML"},
            {"name": "PyTorch", "importance": 0.9, "minimum_level": 0.6, "category": "Frameworks"},
            {"name": "TensorFlow", "importance": 0.5, "minimum_level": 0.4, "category": "Frameworks"},
            {"name": "SQL", "importance": 0.8, "minimum_level": 0.5, "category": "Database"},
            {"name": "Docker", "importance": 0.7, "minimum_level": 0.5, "category": "DevOps"},
            {"name": "LLMs & RAG", "importance": 0.9, "minimum_level": 0.6, "category": "AI/ML"},
            {"name": "Vector Databases", "importance": 0.8, "minimum_level": 0.5, "category": "Database"},
            {"name": "FastAPI", "importance": 0.7, "minimum_level": 0.5, "category": "Web"},
        ]
    },
    {
        "name": "Software Engineer",
        "description": "Builds and maintains robust software systems.",
        "skills": [
            {"name": "Python", "importance": 0.9, "minimum_level": 0.6, "category": "Programming"},
            {"name": "Java", "importance": 0.6, "minimum_level": 0.5, "category": "Programming"},
            {"name": "Data Structures & Algorithms", "importance": 1.0, "minimum_level": 0.7, "category": "Computer Science"},
            {"name": "SQL", "importance": 0.9, "minimum_level": 0.6, "category": "Database"},
            {"name": "System Design", "importance": 0.8, "minimum_level": 0.5, "category": "Computer Science"},
            {"name": "Git", "importance": 1.0, "minimum_level": 0.6, "category": "DevOps"},
            {"name": "Docker", "importance": 0.7, "minimum_level": 0.5, "category": "DevOps"},
        ]
    },
    {
        "name": "Data Scientist",
        "description": "Extracts insights from data using statistical and machine learning techniques.",
        "skills": [
            {"name": "Python", "importance": 1.0, "minimum_level": 0.7, "category": "Programming"},
            {"name": "SQL", "importance": 1.0, "minimum_level": 0.7, "category": "Database"},
            {"name": "Statistics", "importance": 1.0, "minimum_level": 0.6, "category": "Math"},
            {"name": "Machine Learning", "importance": 0.9, "minimum_level": 0.6, "category": "AI/ML"},
            {"name": "Data Visualization", "importance": 0.8, "minimum_level": 0.5, "category": "Data"},
            {"name": "Pandas", "importance": 0.9, "minimum_level": 0.6, "category": "Libraries"},
        ]
    }
]

def normalize_name(name: str) -> str:
    return name.lower().strip()

def seed_taxonomy(db: Session):
    """Seeds the canonical CareerRoles, Skills, and RoleSkillRequirements."""
    for role_data in SEED_ROLES:
        role_norm = normalize_name(role_data["name"])
        role = db.exec(select(CareerRole).where(CareerRole.normalized_name == role_norm)).first()
        
        if not role:
            role = CareerRole(
                name=role_data["name"],
                normalized_name=role_norm,
                description=role_data["description"]
            )
            db.add(role)
            db.commit()
            db.refresh(role)
            
        for skill_data in role_data["skills"]:
            skill_norm = normalize_name(skill_data["name"])
            skill = db.exec(select(Skill).where(Skill.normalized_name == skill_norm)).first()
            
            if not skill:
                skill = Skill(
                    name=skill_data["name"],
                    normalized_name=skill_norm,
                    category=skill_data["category"]
                )
                db.add(skill)
                db.commit()
                db.refresh(skill)
                
            # Add requirement
            req = db.exec(
                select(RoleSkillRequirement)
                .where(RoleSkillRequirement.role_id == role.id)
                .where(RoleSkillRequirement.skill_id == skill.id)
            ).first()
            
            if not req:
                req = RoleSkillRequirement(
                    role_id=role.id,
                    skill_id=skill.id,
                    importance=skill_data["importance"],
                    minimum_level=skill_data["minimum_level"]
                )
                db.add(req)
                
    db.commit()
