from sqlmodel import Session, select
from typing import Dict, List, Any
from app.models.models import User, Skill, CareerRole, RoleSkillRequirement, UserSkill

class IntelligenceService:
    @staticmethod
    def get_user_skill_gap(db: Session, user_id: int, target_role_name: str) -> Dict[str, Any]:
        """
        Calculates the real skill gap mathematically using the new taxonomy.
        """
        # Normalize target role
        target_role_norm = target_role_name.lower().strip()
        role = db.exec(select(CareerRole).where(CareerRole.normalized_name == target_role_norm)).first()
        
        if not role:
            return {
                "error": True,
                "message": f"Role '{target_role_name}' not found in canonical taxonomy."
            }

        # Get role requirements
        requirements = db.exec(
            select(RoleSkillRequirement, Skill)
            .join(Skill, RoleSkillRequirement.skill_id == Skill.id)
            .where(RoleSkillRequirement.role_id == role.id)
        ).all()

        if not requirements:
            return {
                "error": True,
                "message": f"No skills mapped for role '{target_role_name}'."
            }

        # Get user skills
        user_skills = db.exec(
            select(UserSkill, Skill)
            .join(Skill, UserSkill.skill_id == Skill.id)
            .where(UserSkill.user_id == user_id)
        ).all()
        
        user_skill_map = {skill.id: uskill for uskill, skill in user_skills}

        gaps = []
        strong_skills = []

        total_weight = 0
        achieved_weight = 0

        for req, skill in requirements:
            uskill = user_skill_map.get(skill.id)
            user_prof = uskill.proficiency if uskill else 0.0
            
            # Gap calculation: (required - actual) * importance
            gap_magnitude = req.importance * max(0.0, req.minimum_level - user_prof)
            
            total_weight += req.importance
            # achieved weight for this skill: capped at importance
            achieved = req.importance * min(1.0, user_prof / req.minimum_level if req.minimum_level > 0 else 1.0)
            achieved_weight += achieved

            skill_data = {
                "skill_name": skill.name,
                "skill_category": skill.category,
                "importance": req.importance,
                "required_level": req.minimum_level,
                "user_level": user_prof,
                "gap_score": gap_magnitude,
                "evidence": uskill.evidence if uskill else "No evidence."
            }
            
            if gap_magnitude > 0:
                gaps.append(skill_data)
            else:
                strong_skills.append(skill_data)

        # Sort gaps by magnitude descending (most important to fix first)
        gaps.sort(key=lambda x: x["gap_score"], reverse=True)

        return {
            "error": False,
            "target_role": role.name,
            "readiness_score": (achieved_weight / total_weight) * 100 if total_weight > 0 else 0,
            "gaps": gaps,
            "strong_skills": strong_skills,
            "top_priority": gaps[0] if gaps else None
        }

intelligence_service = IntelligenceService()
