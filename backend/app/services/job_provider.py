import os
import requests
import hashlib
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Job
from app.core.logger import logger

class SerpApiJobProvider:
    def __init__(self):
        self.api_key = os.environ.get("SERPAPI_API_KEY")
        self.base_url = "https://serpapi.com/search"

    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key.strip() != "" and "optional" not in self.api_key.lower())

    def fetch_jobs(self, role: str, location: str, max_pages: int = 3) -> List[Dict[str, Any]]:
        if not self.is_available():
            raise ValueError("SERPAPI_API_KEY is not configured")

        query = f"{role} jobs in {location}"
        all_jobs = []
        next_page_token = None

        for page in range(max_pages):
            params = {
                "engine": "google_jobs",
                "q": query,
                "api_key": self.api_key,
                "num": 20
            }
            if next_page_token:
                params["start"] = next_page_token

            try:
                res = requests.get(self.base_url, params=params, timeout=15)
                if res.status_code == 429:
                    logger.warning("SerpApi rate limit reached.")
                    break
                res.raise_for_status()
                data = res.json()
            except Exception as e:
                logger.error(f"SerpApi request failed: {e}")
                break

            jobs_results = data.get("jobs_results", [])
            for job in jobs_results:
                all_jobs.append(self._normalize_job(job))

            next_page_token = data.get("serpapi_pagination", {}).get("next")
            if not next_page_token:
                break
                
        return all_jobs

    def _normalize_job(self, job_data: dict) -> dict:
        title = job_data.get("title", "")
        company = job_data.get("company_name", "")
        loc = job_data.get("location", "")
        description = job_data.get("description", "")
        
        # Deduplication hash
        hash_input = f"{title}|{company}|{loc}".lower()
        content_hash = hashlib.sha256(hash_input.encode('utf-8')).hexdigest()

        return {
            "source": "google_jobs",
            "source_job_id": job_data.get("job_id"),
            "title": title,
            "company": company,
            "location": loc,
            "description": description,
            "source_url": job_data.get("share_link", ""),
            "content_hash": content_hash,
            "salary_min": None,  # Can be extracted via LLM later
            "salary_max": None,
            "salary_currency": None,
            "employment_type": next(iter(job_data.get("detected_extensions", {}).get("schedule_type", [])), None)
        }

    def persist_jobs(self, db: Session, jobs: List[dict]):
        saved_count = 0
        for job_dict in jobs:
            existing = db.query(Job).filter(Job.content_hash == job_dict["content_hash"]).first()
            if not existing:
                new_job = Job(**job_dict)
                db.add(new_job)
                saved_count += 1
        
        if saved_count > 0:
            db.commit()
            
        return saved_count
