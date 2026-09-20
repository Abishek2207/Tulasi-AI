import json
import hashlib
import re
from typing import List, Dict, Any
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.models.models import Job, JobEmbedding, JobSkillRequirement, Skill
from app.core.ai_router import get_ai_response, get_embedding
from app.core.logger import logger

class JobIngestionService:
    @staticmethod
    def _extract_skills(description: str) -> List[str]:
        if not description or len(description) < 50:
            return []
        
        prompt = f'''
        Extract technical skills (programming languages, tools, frameworks, concepts) required in this job description.
        Return ONLY a JSON array of strings. Do not invent skills that are not mentioned.
        Job Description: {description[:3000]}
        '''
        try:
            raw = get_ai_response(prompt)
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                extracted = json.loads(match.group())
                return [s.strip().title() for s in extracted if isinstance(s, str)]
        except Exception as e:
            logger.error(f"Skill extraction error: {e}")
        return []

    @staticmethod
    def process_jobs(db: Session, raw_jobs: List[Dict[str, Any]]) -> int:
        added_count = 0
        for raw in raw_jobs:
            title = raw.get("title", "")
            company = raw.get("company", "")
            location = raw.get("location", "")
            if not title or not company:
                continue

            content_str = f"{title}-{company}-{location}"
            content_hash = hashlib.sha256(content_str.encode()).hexdigest()

            # Deduplicate
            existing = db.exec(select(Job).where(Job.content_hash == content_hash)).first()
            if existing:
                continue

            # Create Job
            job = Job(
                source=raw.get("source", "API"),
                source_job_id=raw.get("source_job_id"),
                title=title,
                company=company,
                location=location,
                description=raw.get("description", ""),
                experience_requirements=raw.get("experience_requirements"),
                salary_min=raw.get("salary_min"),
                salary_max=raw.get("salary_max"),
                salary_currency=raw.get("salary_currency", "USD"),
                employment_type=raw.get("employment_type"),
                application_url=raw.get("application_url"),
                content_hash=content_hash,
                fetched_at=datetime.now(timezone.utc)
            )
            db.add(job)
            db.commit()
            db.refresh(job)
            added_count += 1

            # Embed
            if job.description:
                try:
                    embedding = get_embedding(job.description)
                    if embedding:
                        db.add(JobEmbedding(job_id=job.id, embedding=embedding))
                        db.commit()
                except Exception as e:
                    logger.error(f"Embedding error: {e}")
                    db.rollback()
                
                # Extract and map skills
                skills = JobIngestionService._extract_skills(job.description)
                for s in skills:
                    skill_obj = db.exec(select(Skill).where(Skill.name.ilike(s))).first()
                    if not skill_obj:
                        skill_obj = Skill(name=s, category="General", normalized_name=s.lower())
                        db.add(skill_obj)
                        db.commit()
                        db.refresh(skill_obj)
                    
                    existing_jsr = db.exec(select(JobSkillRequirement).where(JobSkillRequirement.job_id == job.id, JobSkillRequirement.skill_id == skill_obj.id)).first()
                    if not existing_jsr:
                        try:
                            db.add(JobSkillRequirement(job_id=job.id, skill_id=skill_obj.id, importance=1.0))
                            db.commit()
                        except Exception:
                            db.rollback() 
        return added_count
