from sqlmodel import Session, select
from typing import Dict, Any
from app.models.models import User, FocusSession
from app.services.skill_graph_service import skill_graph_service

class PlacementReadinessService:
    @staticmethod
    async def calculate_readiness(db: Session, user: User) -> Dict[str, Any]:
        """
        Calculates placement readiness purely on evidence:
        - Actual focus sessions completed
        - Real skill gap vs Market Snapshot
        - Projects/certifications (if available)
        """
        # 1. Fetch Skill Gap (Real Market Data)
        skill_gap = await skill_graph_service.get_skill_gap(db, user)
        
        # 2. Fetch Actual Work Done (Focus Sessions)
        completed_sessions = db.exec(
            select(FocusSession)
            .where(FocusSession.user_id == user.id)
            .where(FocusSession.status == "completed")
        ).all()
        
        total_focus_minutes = sum([s.duration_minutes for s in completed_sessions])
        
        # 3. Calculate Score
        # 50% based on Skill Match, 50% based on verified work (e.g. 2000 minutes = max)
        skill_score = skill_gap.get("readiness_score", 0)
        work_score = min(total_focus_minutes / 2000 * 100, 100)
        
        overall_score = (skill_score + work_score) / 2
        
        evidence = []
        if skill_score > 0:
            evidence.append(f"Matched {len(skill_gap.get('matched_skills', []))} skills required by the real market.")
        if total_focus_minutes > 0:
            evidence.append(f"Completed {total_focus_minutes} minutes of verified focus work.")
        else:
            evidence.append("No verified focus work completed yet. Start a session to build readiness.")
            
        return {
            "status": skill_gap.get("status", "UNAVAILABLE"),
            "overall_score": int(overall_score),
            "skill_score": int(skill_score),
            "work_score": int(work_score),
            "evidence": evidence
        }
        
class NextBestActionService:
    @staticmethod
    async def get_next_action(db: Session, user: User) -> Dict[str, Any]:
        """
        Generates NBA from actual highest-priority skill gap.
        """
        skill_gap = await skill_graph_service.get_skill_gap(db, user)
        missing_skills = skill_gap.get("missing_skills", [])
        
        if not missing_skills:
            # If no missing skills or no data, fall back to Focus Work
            return {
                "action_type": "FOCUS_WORK",
                "title": "Start a Focus Session",
                "description": "Your skills align with the market. Build project evidence.",
                "evidence": "No critical skill gaps detected."
            }
            
        # Target the top missing skill
        top_missing = missing_skills[0]
        
        return {
            "action_type": "LEARN_SKILL",
            "title": f"Master {top_missing}",
            "description": f"Market intelligence shows {top_missing} is highly requested for your target role.",
            "evidence": f"Found in real job postings for {skill_gap.get('target_role')}.",
            "target_skill": top_missing
        }

placement_readiness_service = PlacementReadinessService()
next_best_action_service = NextBestActionService()
