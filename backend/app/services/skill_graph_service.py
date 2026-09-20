import json
from sqlmodel import Session, select
from typing import Dict, List, Any
from app.models.models import User, Profile, Job, MarketSnapshot
from app.services.serpapi_service import serpapi_service

class SkillGraphService:
    @staticmethod
    async def get_skill_gap(db: Session, user: User) -> Dict[str, Any]:
        """
        Calculates skill gap using:
        1. User Profile skills
        2. Real target-role requirements (MarketSnapshot)
        3. Real job evidence (Job table)
        """
        # Ensure user has a profile and target role
        profile = getattr(user, "profile", None)
        target_role = profile.target_role if profile else getattr(user, "target_role", "Software Engineer")
        
        # Parse user's current skills
        user_skills_raw = profile.current_skills if profile else getattr(user, "skills", "")
        user_skills = []
        try:
            # Check if JSON
            if user_skills_raw and user_skills_raw.startswith("["):
                skills_data = json.loads(user_skills_raw)
                user_skills = [s.get("name", "").lower() for s in skills_data if isinstance(s, dict)]
            else:
                user_skills = [s.strip().lower() for s in (user_skills_raw or "").split(",") if s.strip()]
        except:
            user_skills = []

        # 1. Fetch Market Snapshot for Target Role
        # Attempt to get a live snapshot to ensure real job evidence
        snapshot = await serpapi_service.generate_market_snapshot(db, target_role, "India")
        
        # 2. Extract real top skills from the market data
        try:
            market_skills = json.loads(snapshot.top_skills)
        except:
            market_skills = []
            
        market_skills_lower = [s.lower() for s in market_skills]
        
        # 3. Calculate Gaps
        missing_skills = [s for s in market_skills if s.lower() not in user_skills]
        matched_skills = [s for s in market_skills if s.lower() in user_skills]
        
        # 4. Extract Real Job Evidence (links to real jobs requiring the missing skills)
        evidence = []
        if missing_skills:
            # Find jobs for this role
            recent_jobs = db.exec(
                select(Job)
                .where(Job.title.ilike(f"%{target_role}%"))
                .order_by(Job.fetched_at.desc())
                .limit(10)
            ).all()
            
            for missing in missing_skills:
                # Find a real job that mentions this skill
                for job in recent_jobs:
                    if job.description and missing.lower() in job.description.lower():
                        evidence.append({
                            "missing_skill": missing,
                            "evidence_job_title": job.title,
                            "evidence_company": job.company,
                        })
                        break # One piece of evidence per missing skill is enough

        # If we have no market data (UNAVAILABLE)
        if snapshot.demand_signals == "UNAVAILABLE":
            return {
                "status": "UNAVAILABLE",
                "message": "No real market data available to calculate skill gaps.",
                "target_role": target_role,
                "market_skills": [],
                "user_skills": user_skills,
                "missing_skills": [],
                "matched_skills": [],
                "evidence": []
            }

        return {
            "status": snapshot.demand_signals, # LIVE or STALE
            "target_role": target_role,
            "market_skills": market_skills,
            "user_skills": user_skills,
            "missing_skills": missing_skills,
            "matched_skills": matched_skills,
            "evidence": evidence,
            "readiness_score": len(matched_skills) / len(market_skills) * 100 if market_skills else 0
        }

skill_graph_service = SkillGraphService()
