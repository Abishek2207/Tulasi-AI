from sqlmodel import Session, select
from app.models.models import CareerRole, RoleSkillRequirement, UserSkill, CareerReadinessLog
from typing import Dict, Any

class CareerReadinessService:
    @staticmethod
    def calculate_readiness(db: Session, user_id: int, role_id: int) -> Dict[str, Any]:
        """
        Deterministic career readiness calculation:
        (Sum of min(user_proficiency, required_level) * importance) / (Sum of required_level * importance)
        """
        role = db.exec(select(CareerRole).where(CareerRole.id == role_id)).first()
        if not role:
            raise ValueError("Role not found")

        requirements = db.exec(select(RoleSkillRequirement).where(RoleSkillRequirement.role_id == role_id)).all()
        if not requirements:
            return {"score": 0.0, "details": [], "message": "No requirements found for this role."}

        total_required_weight = 0.0
        total_achieved_weight = 0.0
        details = []

        for req in requirements:
            user_skill = db.exec(select(UserSkill).where(UserSkill.user_id == user_id, UserSkill.skill_id == req.skill_id)).first()
            user_level = user_skill.proficiency if user_skill else 0.0
            
            # Cap the user's effective level at the required level to prevent 
            # over-indexing on one skill masking a deficiency in another
            effective_level = min(user_level, req.minimum_level)
            
            achieved = effective_level * req.importance
            required = req.minimum_level * req.importance

            total_achieved_weight += achieved
            total_required_weight += required

            details.append({
                "skill_id": req.skill_id,
                "importance": req.importance,
                "required_level": req.minimum_level,
                "user_level": user_level,
                "effective_level": effective_level,
                "achieved_weight": achieved,
                "required_weight": required,
                "ready": user_level >= req.minimum_level
            })

        score = (total_achieved_weight / total_required_weight) if total_required_weight > 0 else 0.0
        
        # Log the snapshot
        log = CareerReadinessLog(user_id=user_id, role_id=role_id, readiness_score=score)
        db.add(log)
        db.commit()

        return {
            "score": score,
            "role_name": role.name,
            "details": details
        }
