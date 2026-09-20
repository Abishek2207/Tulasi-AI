import os
import json
import re
from typing import Dict, Any, List
from collections import Counter
from datetime import datetime, timezone
from sqlalchemy import func

from app.core.ai_router import get_ai_response
from app.models.models import Job, MarketSnapshot, JobSkillRequirement, Skill
from app.core.database import engine
from sqlmodel import Session, select
from app.core.logger import logger

def aggregate_skills_from_db(role: str, location: str, db: Session) -> Dict[str, Any]:
    # Use real relational structure Job -> JobSkillRequirement -> Skill
    jobs_query = select(Job.id).where(Job.title.ilike(f"%{role}%"))
    if location and location != "Global":
        jobs_query = jobs_query.where(Job.location.ilike(f"%{location}%"))
        
    job_ids = db.exec(jobs_query).all()
    if not job_ids:
        return {"total_analyzed": 0, "top_skills": []}

    total = len(job_ids)
    
    # Aggregate skills
    statement = (
        select(Skill.name, func.count(JobSkillRequirement.job_id).label("job_count"))
        .join(JobSkillRequirement, Skill.id == JobSkillRequirement.skill_id)
        .where(JobSkillRequirement.job_id.in_(job_ids))
        .group_by(Skill.name)
        .order_by(func.count(JobSkillRequirement.job_id).desc())
        .limit(10)
    )
    
    results = db.exec(statement).all()
    
    top_skills = []
    for name, count in results:
        percentage = round((count / total) * 100, 1)
        top_skills.append({"skill": name, "count": count, "percentage": percentage})

    return {"total_analyzed": total, "top_skills": top_skills}


def fetch_market_trends(current_role: str, target_role: str, location: str = "Global") -> Dict[str, Any]:
    with Session(engine) as db:
        try:
            stats = aggregate_skills_from_db(target_role, location, db)
            
            if stats["total_analyzed"] == 0:
                return {
                    "status": "NO_DATA",
                    "reason": "No jobs found for this criteria in the database. Run ingestion first.",
                    "data": []
                }

            snapshot = MarketSnapshot(
                role=target_role,
                location=location,
                time_period=datetime.now(timezone.utc).strftime("%Y-%m"),
                jobs_analyzed=stats["total_analyzed"],
                top_skills=json.dumps(stats["top_skills"]),
                companies=json.dumps([]),
                salary_signals=json.dumps({"confidence": "LOW"}),
                demand_signals="Moderate",
                source_metadata="Relational PostgreSQL"
            )
            db.add(snapshot)
            db.commit()

            return {
                "status": "LIVE",
                "role": target_role,
                "location": location,
                "jobs_analyzed": stats["total_analyzed"],
                "top_skills": stats["top_skills"],
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            logger.error(f"Market Trends Error: {e}")
            return {
                "status": "ERROR",
                "reason": str(e),
                "data": []
            }


def _parse_json(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            pass
    return {}


def analyze_career_risk(current_role: str, experience_years: int, current_skills: List[str]) -> Dict[str, Any]:
    skills_str = ", ".join(current_skills)
    prompt = f'''
    Analyze career risk for '{current_role}' with {experience_years} years experience and skills: {skills_str}.
    Calculate an automation_risk_score (0-100) based on how many routine tasks can be automated vs architectural thinking.
    Return JSON ONLY:
    {{
      "automation_risk_score": 50,
      "layoff_vulnerability_score": 50,
      "factors": ["factor 1"],
      "mitigation_actions": ["action 1"]
    }}
    '''
    try:
        raw = get_ai_response(prompt)
        res = _parse_json(raw)
        return {
            "status": "LIVE",
            "automation_risk_score": res.get("automation_risk_score", 50),
            "layoff_vulnerability_score": res.get("layoff_vulnerability_score", 50),
            "confidence": "Medium",
            "evidence_count": 0, # Remove hallucinated evidence_count per prompt rules
            "factors": res.get("factors", []),
            "mitigation_actions": res.get("mitigation_actions", []),
            "disclaimer": "This is an analytical estimate based on skill trends, not an individual layoff prediction.",
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
         return {"status": "ERROR", "reason": str(e)}

def get_career_directions(current_role: str, current_skills: List[str]) -> Dict[str, Any]:
    skills_str = ", ".join(current_skills)
    prompt = f'''
    Recommend 3 logical career directions for a '{current_role}' with skills {skills_str}.
    Return JSON array named 'directions':
    {{
      "directions": [
        {{
          "target": "Role Title",
          "reason": "Why based on skills",
          "difficulty": "Medium",
          "required_skills": ["Skill1"],
          "skill_gaps": ["Gap1"]
        }}
      ]
    }}
    Note: Do not invent salary boosts.
    '''
    try:
        raw = get_ai_response(prompt)
        res = _parse_json(raw)
        return {
            "status": "LIVE",
            "directions": res.get("directions", []),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {"status": "ERROR", "directions": []}
