from sqlmodel import Session, select
from app.models.models import UserProject, ProjectSkill, Skill
from app.services.skill_engine import update_skill_proficiency
from typing import List, Dict, Any
from datetime import datetime, timezone

class ProjectService:
    @staticmethod
    def create_project(db: Session, user_id: int, title: str, description: str, project_url: str, skill_ids: List[int]) -> UserProject:
        project = UserProject(
            user_id=user_id,
            title=title,
            description=description,
            project_url=project_url,
            status='active'
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        for sid in skill_ids:
            ps = ProjectSkill(
                project_id=project.id,
                skill_id=sid,
                evidence_text=f"Demonstrated in project: {title}"
            )
            db.add(ps)
        db.commit()
        return project

    @staticmethod
    def complete_project(db: Session, user_id: int, project_id: int) -> UserProject:
        project = db.exec(select(UserProject).where(UserProject.id == project_id, UserProject.user_id == user_id)).first()
        if not project:
            raise ValueError("Project not found")

        project.status = 'completed'
        project.completion_date = datetime.now(timezone.utc)
        
        project_skills = db.exec(select(ProjectSkill).where(ProjectSkill.project_id == project.id)).all()
        for ps in project_skills:
            # Generate highly confident evidence for completing a project
            update_skill_proficiency(
                user_id=user_id,
                skill_id=ps.skill_id,
                evidence_type='project',
                evidence_score=1.0, 
                confidence=0.9, # Projects are strong evidence
                source_id=f"proj_{project.id}",
                db=db
            )

        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_user_projects(db: Session, user_id: int) -> List[UserProject]:
        return db.exec(select(UserProject).where(UserProject.user_id == user_id)).all()
