import json
import requests
from sqlmodel import Session, select
from typing import List, Dict, Any
from datetime import datetime, timezone
from app.models.models import User, Job, Skill, JobSkillRequirement, UserSkill

class SmartJobMatchService:
    @staticmethod
    def sync_remotive_jobs(db: Session, target_role: str):
        """Fetches live jobs, persists them, and extracts JobSkillRequirements."""
        try:
            remotive_url = "https://remotive.com/api/remote-jobs?search=" + target_role
            resp = requests.get(remotive_url, timeout=5)
            if resp.status_code != 200:
                return
            
            jobs_data = resp.json().get("jobs", [])[:10]
            
            # Get all canonical skills for fast extraction
            all_skills = db.exec(select(Skill)).all()
            
            for item in jobs_data:
                source_job_id = f"remotive_{item.get('id')}"
                existing_job = db.exec(select(Job).where(Job.source_job_id == source_job_id)).first()
                if existing_job:
                    continue # Skip if already synced
                    
                title = item.get("title", "")
                desc = item.get("description", "")
                
                # Persist job
                new_job = Job(
                    source="Remotive",
                    source_job_id=source_job_id,
                    title=title,
                    company=item.get("company_name", "Unknown"),
                    location=item.get("candidate_required_location", "Remote"),
                    employment_type=item.get("job_type", ""),
                    description=desc,
                    source_url=item.get("url", ""),
                    content_hash=str(hash(desc))[:15],
                    fetched_at=datetime.now(timezone.utc)
                )
                db.add(new_job)
                db.commit()
                db.refresh(new_job)
                
                # Extract structured skills from description
                desc_lower = desc.lower()
                for skill in all_skills:
                    if skill.normalized_name in desc_lower:
                        req = JobSkillRequirement(
                            job_id=new_job.id,
                            skill_id=skill.id,
                            importance=1.0 # Default importance
                        )
                        db.add(req)
                
                db.commit()
        except Exception as e:
            print(f"Failed to sync remotive jobs: {e}")

    @staticmethod
    def get_matched_jobs(db: Session, user_id: int, target_role: str) -> Dict[str, Any]:
        """
        Calculates explainable match score using structured skill matches.
        """
        # Ensure we have recent jobs
        SmartJobMatchService.sync_remotive_jobs(db, target_role)
        
        # Get user skills
        user_skills = db.exec(
            select(UserSkill, Skill)
            .join(Skill, UserSkill.skill_id == Skill.id)
            .where(UserSkill.user_id == user_id)
        ).all()
        user_skill_map = {skill.id: uskill for uskill, skill in user_skills}
        
        # Get jobs for this role
        jobs = db.exec(
            select(Job)
            .where(Job.title.ilike(f"%{target_role}%"))
            .order_by(Job.fetched_at.desc())
            .limit(10)
        ).all()
        
        matches = []
        for job in jobs:
            # Get job requirements
            reqs = db.exec(
                select(JobSkillRequirement, Skill)
                .join(Skill, JobSkillRequirement.skill_id == Skill.id)
                .where(JobSkillRequirement.job_id == job.id)
            ).all()
            
            matched_details = []
            missing_details = []
            
            total_importance = sum(r.importance for r, s in reqs)
            score_achieved = 0.0
            
            for req, skill in reqs:
                uskill = user_skill_map.get(skill.id)
                if uskill and uskill.proficiency > 0.0: # Even minor proficiency counts as matched for now
                    matched_details.append(skill.name)
                    score_achieved += req.importance
                else:
                    missing_details.append(skill.name)
            
            match_score = (score_achieved / total_importance * 100) if total_importance > 0 else 50.0
            
            matches.append({
                "job": {
                    "id": job.id,
                    "title": job.title,
                    "company": job.company,
                    "location": job.location,
                    "description": job.description[:200] + "..." if job.description else "",
                    "apply_link": job.source_url
                },
                "match_score": round(match_score, 1),
                "matched_skills": matched_details,
                "missing_skills": missing_details
            })
            
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return {"matches": matches}

smart_job_match_service = SmartJobMatchService()
