from sqlmodel import Session, select
from app.models.models import UserRoadmap, RoadmapMilestone, ActionTask, UserSkill, RoleSkillRequirement, Goal, Skill
from app.services.intelligence_service import IntelligenceService
from typing import List, Dict, Any
from datetime import datetime, timezone
import json

class ExecutionService:
    @staticmethod
    def generate_roadmap(db: Session, user_id: int, role_id: int) -> UserRoadmap:
        # Check if active roadmap exists
        existing = db.exec(
            select(UserRoadmap).where(UserRoadmap.user_id == user_id, UserRoadmap.role_id == role_id, UserRoadmap.status == 'active')
        ).first()
        if existing:
            return existing

        # Get role name
        from app.models.models import CareerRole
        role = db.exec(select(CareerRole).where(CareerRole.id == role_id)).first()
        if not role:
            raise ValueError("Role not found")

        # Get gap
        gap_analysis = IntelligenceService.get_user_skill_gap(db, user_id, role.name)
        gaps = gap_analysis.get('gaps', [])

        roadmap = UserRoadmap(user_id=user_id, role_id=role_id)
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)

        # Generate milestones based on top gaps
        gaps_sorted = sorted(gaps, key=lambda x: x['gap_score'], reverse=True)
        for i, g in enumerate(gaps_sorted):
            if g['gap_score'] <= 0:
                continue

            skill = db.exec(select(Skill).where(Skill.name == g['skill_name'])).first()
            if not skill:
                continue

            ms = RoadmapMilestone(
                roadmap_id=roadmap.id,
                skill_id=skill.id,
                title=f"Master {g['skill_name']}",
                description=f"Improve from {g['user_level']:.2f} to {g['required_level']:.2f} to meet {role.name} requirements.",
                order_index=i+1,
                status='active' if i == 0 else 'locked'
            )
            db.add(ms)
        db.commit()
        return roadmap

    @staticmethod
    def get_roadmap(db: Session, user_id: int) -> Dict[str, Any]:
        roadmap = db.exec(select(UserRoadmap).where(UserRoadmap.user_id == user_id, UserRoadmap.status == 'active')).first()
        if not roadmap:
            return None
        milestones = db.exec(select(RoadmapMilestone).where(RoadmapMilestone.roadmap_id == roadmap.id).order_by(RoadmapMilestone.order_index)).all()
        return {
            "roadmap": roadmap,
            "milestones": milestones
        }

    @staticmethod
    def generate_daily_tasks(db: Session, user_id: int) -> List[ActionTask]:
        roadmap_data = ExecutionService.get_roadmap(db, user_id)
        if not roadmap_data:
            return []

        # Find first active milestone
        active_ms = next((m for m in roadmap_data["milestones"] if m.status == 'active'), None)
        if not active_ms:
            return []

        # Check existing pending tasks
        pending = db.exec(select(ActionTask).where(ActionTask.user_id == user_id, ActionTask.status == 'pending')).all()
        if pending:
            return pending

        # Generate a new practice task for the active milestone
        task = ActionTask(
            user_id=user_id,
            milestone_id=active_ms.id,
            skill_id=active_ms.skill_id,
            title=f"Practice session for {active_ms.title}",
            description="Complete targeted practice to generate verified skill evidence.",
            difficulty="beginner",
            estimated_minutes=30,
            status="pending"
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return [task]

    @staticmethod
    def complete_task(db: Session, user_id: int, task_id: int) -> ActionTask:
        task = db.exec(select(ActionTask).where(ActionTask.id == task_id, ActionTask.user_id == user_id)).first()
        if not task:
            raise ValueError("Task not found")
        
        task.status = 'completed'
        task.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
        return task
