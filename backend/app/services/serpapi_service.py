import os
import hashlib
import json
import httpx
from datetime import datetime
from sqlmodel import Session, select
from fastapi import HTTPException
from typing import List, Dict, Optional
from app.models.models import Job, MarketSnapshot

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

class SerpApiService:
    @staticmethod
    async def fetch_jobs(role: str, location: str = "India") -> List[Dict]:
        """Fetches real jobs from SerpApi Google Jobs."""
        if not SERPAPI_API_KEY:
            raise HTTPException(status_code=503, detail="SERVICE_UNAVAILABLE: SerpAPI not configured")
            
        url = "https://serpapi.com/search.json"
        params = {
            "engine": "google_jobs",
            "q": f"{role} in {location}",
            "hl": "en",
            "api_key": SERPAPI_API_KEY,
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                return data.get("jobs_results", [])
            except Exception as e:
                print(f"SerpApi Error: {e}")
                raise HTTPException(status_code=503, detail="SERVICE_UNAVAILABLE: SerpAPI failed")

    @staticmethod
    def sync_jobs_to_db(db: Session, jobs_data: List[Dict], role: str) -> List[Job]:
        """Deduplicates and persists jobs, returning the new jobs."""
        new_jobs = []
        for job_data in jobs_data:
            title = job_data.get("title", "")
            company = job_data.get("company_name", "")
            if not title or not company:
                continue
                
            location = job_data.get("location", "")
            description = job_data.get("description", "")
            job_id = job_data.get("job_id", "")
            
            
            existing = None
            if job_id:
                existing = db.exec(select(Job).where((Job.source_job_id == job_id) & (Job.source == "SerpApi"))).first()
            
            content_hash = None
            if not existing:
                content_str = f"{title}-{company}-{location}-{job_id}"
                content_hash = hashlib.sha256(content_str.encode()).hexdigest()
                existing = db.exec(select(Job).where(Job.content_hash == content_hash)).first()

            if not existing:
                new_job = Job(
                    source="SerpApi",
                    source_job_id=job_id,
                    title=title,
                    company=company,
                    location=location,
                    description=description,
                    fetched_at=datetime.utcnow(),
                    content_hash=content_hash
                )
                db.add(new_job)
                new_jobs.append(new_job)
        
        if new_jobs:
            db.commit()
            
        return new_jobs

    
    @staticmethod
    async def generate_market_snapshot(db: Session, role: str, location: str = "India") -> MarketSnapshot:
        """Fetches live data, creates snapshot, handles UNAVAILABLE / STALE states."""
        jobs_data = []
        try:
            jobs_data = await SerpApiService.fetch_jobs(role, location)
        except HTTPException:
            pass

        
        if not jobs_data:
            # Check for stale data
            existing_jobs = db.exec(select(Job).where(Job.title.ilike(f"%{role}%"))).all()
            
            if existing_jobs:
                stale_skills = []
                for j in existing_jobs:
                    desc = (j.description or "").lower()
                    if "python" in desc: stale_skills.append("Python")
                    if "react" in desc: stale_skills.append("React")
                    if "sql" in desc: stale_skills.append("SQL")
                    if "aws" in desc: stale_skills.append("AWS")
                stale_skills = list(set(stale_skills))[:5]
                
                snapshot = MarketSnapshot(
                    role=role,
                    location=location,
                    time_period="Last 30 Days",
                    jobs_analyzed=len(existing_jobs),
                    top_skills=json.dumps(stale_skills),

                    companies=json.dumps(list(set(j.company for j in existing_jobs))[:5]),
                    salary_signals=json.dumps({"min": 0, "max": 0}),
                    demand_signals="STALE",
                    source_metadata="SerpApi (Cached)"
                )
                db.add(snapshot)
                db.commit()
                return snapshot
            else:
                # UNAVAILABLE
                snapshot = MarketSnapshot(
                    role=role,
                    location=location,
                    time_period="Unknown",
                    jobs_analyzed=0,
                    top_skills=json.dumps([]),
                    companies=json.dumps([]),
                    salary_signals=json.dumps({}),
                    demand_signals="UNAVAILABLE",
                    source_metadata="SerpApi"
                )
                return snapshot

        # LIVE Data processing
        new_jobs = SerpApiService.sync_jobs_to_db(db, jobs_data, role)
        
        # Simple extraction logic from real data
        companies = list(set([j.get("company_name", "") for j in jobs_data if j.get("company_name")]))
        skills = []
        for j in jobs_data:
            desc = j.get("description", "").lower()
            if "python" in desc: skills.append("Python")
            if "react" in desc: skills.append("React")
            if "sql" in desc: skills.append("SQL")
            if "aws" in desc: skills.append("AWS")
        
        top_skills = list(set(skills))[:5]
        
        snapshot = MarketSnapshot(
            role=role,
            location=location,
            time_period="Live",
            jobs_analyzed=len(jobs_data),
            top_skills=json.dumps(top_skills),
            companies=json.dumps(companies[:5]),
            salary_signals=json.dumps({"min": 0, "max": 0}),
            demand_signals="LIVE",
            source_metadata="SerpApi"
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot

serpapi_service = SerpApiService()
