import math
from typing import List, Dict, Any, Tuple
from sqlmodel import Session, select
from app.models.models import User, Job, JobEmbedding, UserJobMatch, SkillMastery, JobSkillRequirement
from app.core.ai_router import get_embedding
from sqlalchemy.orm import selectinload

class MatchingService:
    @staticmethod
    def _cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(x * y for x, y in zip(v1, v2))
        norm_v1 = math.sqrt(sum(x * x for x in v1))
        norm_v2 = math.sqrt(sum(y * y for y in v2))
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return dot_product / (norm_v1 * norm_v2)

    @staticmethod
    def _calculate_skill_match(user_skills: Dict[int, float], job_skills: List[JobSkillRequirement]) -> float:
        if not job_skills:
            return 0.5  # Neutral if no skills extracted
        
        total_importance = sum(req.importance for req in job_skills)
        if total_importance == 0:
            return 0.5
            
        score = 0.0
        for req in job_skills:
            user_level = user_skills.get(req.skill_id, 0.0)
            # user_level is 0.0 to 1.0, importance is weight
            score += (user_level * req.importance)
            
        return score / total_importance

    @staticmethod
    def calculate_matches_for_user(db: Session, user_id: int) -> int:
        user = db.get(User, user_id)
        if not user:
            return 0
            
        # Get user's active resume embedding if any, else synthesize from profile
        # For simplicity, we'll synthesize an embedding from their target role + skills
        user_skills_objs = db.exec(select(SkillMastery).where(SkillMastery.user_id == user_id)).all()
        user_skills = {s.skill_id: s.mastery_score for s in user_skills_objs if hasattr(s, 'skill_id')} 
        # Fallback if skill_id is not directly on SkillMastery (it uses skill_name string in Phase 3, we should map it)
        # Wait, SkillMastery has skill_name, not skill_id. 
        from app.models.models import Skill
        skill_names = [s.skill_name for s in user_skills_objs]
        skill_map = {}
        if skill_names:
            skills = db.exec(select(Skill).where(Skill.name.in_(skill_names))).all()
            for s in skills:
                # Find matching mastery
                mastery = next((m.mastery_score for m in user_skills_objs if m.skill_name == s.name), 0.0)
                skill_map[s.id] = mastery

        target = user.target_role or "Software Engineer"
        user_profile_text = f"Role: {target}. Skills: {', '.join(skill_names)}."
        user_embedding = get_embedding(user_profile_text)
        if not user_embedding:
            return 0
            
        # Get jobs with embeddings
        jobs = db.exec(select(Job)).all()
        matched_count = 0
        
        for job in jobs:
            job_emb = db.exec(select(JobEmbedding).where(JobEmbedding.job_id == job.id)).first()
            if not job_emb or not job_emb.embedding:
                continue
                
            semantic_score = MatchingService._cosine_similarity(user_embedding, job_emb.embedding)
            
            job_reqs = db.exec(select(JobSkillRequirement).where(JobSkillRequirement.job_id == job.id)).all()
            skill_score = MatchingService._calculate_skill_match(skill_map, job_reqs)
            
            total_score = (semantic_score * 0.6) + (skill_score * 0.4)
            
            match = db.exec(select(UserJobMatch).where(UserJobMatch.user_id == user_id, UserJobMatch.job_id == job.id)).first()
            if not match:
                match = UserJobMatch(
                    user_id=user_id,
                    job_id=job.id,
                    semantic_score=semantic_score,
                    skill_gap_score=skill_score,
                    total_match_score=total_score
                )
                db.add(match)
            else:
                match.semantic_score = semantic_score
                match.skill_gap_score = skill_score
                match.total_match_score = total_score
                
            matched_count += 1
            
        db.commit()
        return matched_count
