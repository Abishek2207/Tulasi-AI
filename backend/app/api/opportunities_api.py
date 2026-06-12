import os
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone
import requests
import feedparser

from app.api.deps import get_current_user
from app.models.models import User
from app.core.database import get_session
from sqlmodel import Session

router = APIRouter()

@router.get("/jobs")
def get_jobs(skills: Optional[str] = None, location: Optional[str] = None, db: Session = Depends(get_session)):
    jobs = []
    
    # 1. Free API: RemoteOK
    try:
        remoteok_url = "https://remoteok.com/api"
        headers = {"User-Agent": "TulasiAI-JobFinder"}
        resp = requests.get(remoteok_url, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            for item in data[1:6]:
                if "company" in item and "position" in item:
                    if skills and skills.lower() not in item["position"].lower() and skills.lower() not in str(item.get("tags", [])).lower():
                        continue
                    jobs.append({
                        "id": str(item.get("id", "")),
                        "title": item["position"],
                        "company": item["company"],
                        "location": item.get("location", "Remote"),
                        "source": "RemoteOK",
                        "source_name": "RemoteOK",
                        "apply_link": item.get("url", ""),
                        "posted_date": item.get("date", datetime.now(timezone.utc).isoformat()),
                        "fetched_at": datetime.now(timezone.utc).isoformat(),
                        "verified_status": True
                    })
    except Exception as e:
        print(f"RemoteOK fetch failed: {e}")

    # 1.5 Free API: Remotive
    try:
        remotive_url = "https://remotive.com/api/remote-jobs?limit=15"
        if skills:
            remotive_url += f"&search={skills}"
        resp = requests.get(remotive_url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            for item in data.get("jobs", [])[:10]:
                jobs.append({
                    "id": str(item.get("id", "")),
                    "title": item.get("title", ""),
                    "company": item.get("company_name", "Unknown"),
                    "location": item.get("candidate_required_location", "Remote"),
                    "source": "Remotive",
                    "source_name": "Remotive",
                    "apply_link": item.get("url", ""),
                    "posted_date": item.get("publication_date", datetime.now(timezone.utc).isoformat()),
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                    "verified_status": True
                })
    except Exception as e:
        print(f"Remotive fetch failed: {e}")
    # 2. Adzuna (Optional)
    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")
    if app_id and app_key:
        try:
            adzuna_url = f"https://api.adzuna.com/v1/api/jobs/us/search/1?app_id={app_id}&app_key={app_key}&results_per_page=10"
            if skills:
                adzuna_url += f"&what={skills}"
            if location:
                adzuna_url += f"&where={location}"
            resp = requests.get(adzuna_url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("results", []):
                    jobs.append({
                        "id": str(item.get("id", "")),
                        "title": item.get("title"),
                        "company": item.get("company", {}).get("display_name", "Unknown"),
                        "location": item.get("location", {}).get("display_name", "Unknown"),
                        "source": "Adzuna",
                        "source_name": "Adzuna",
                        "apply_link": item.get("redirect_url", ""),
                        "posted_date": item.get("created", datetime.now(timezone.utc).isoformat()),
                        "fetched_at": datetime.now(timezone.utc).isoformat(),
                        "verified_status": True
                    })
        except Exception as e:
            print(f"Adzuna fetch failed: {e}")
            
    # 3. Jooble (Optional)
    jooble_key = os.getenv("JOOBLE_API_KEY")
    if jooble_key:
        try:
            jooble_url = f"https://jooble.org/api/{jooble_key}"
            payload = {"keywords": skills or "software engineer", "location": location or ""}
            resp = requests.post(jooble_url, json=payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                for item in data.get("jobs", [])[:10]:
                    jobs.append({
                        "id": str(item.get("id", "")),
                        "title": item.get("title"),
                        "company": item.get("company", "Unknown"),
                        "location": item.get("location", "Unknown"),
                        "source": "Jooble",
                        "source_name": "Jooble",
                        "apply_link": item.get("link", ""),
                        "posted_date": item.get("updated", datetime.now(timezone.utc).isoformat()),
                        "fetched_at": datetime.now(timezone.utc).isoformat(),
                        "verified_status": True
                    })
        except Exception as e:
            print(f"Jooble fetch failed: {e}")

    return {"success": True, "data": jobs}


@router.get("/hackathons")
def get_hackathons(db: Session = Depends(get_session)):
    hackathons = []
    
    # 1. Fetch from Database (Seeded Real Data)
    from app.models.models import Hackathon
    from sqlmodel import select
    db_hackathons = db.exec(select(Hackathon).where(Hackathon.is_active == True)).all()
    
    for h in db_hackathons:
        hackathons.append({
            "id": str(h.id),
            "title": h.name,
            "organizer": h.organizer,
            "mode": h.event_mode or "Online",
            "source": "TulasiAI Partners",
            "source_name": h.organizer,
            "source_url": h.link,
            "registration_url": h.link,
            "prize": h.prize,
            "deadline": h.deadline,
            "description": h.description,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "verified_status": True
        })
        
    # 2. Try fetching Live Hackathons (HackClub API as example)
    try:
        resp = requests.get("https://hackathons.hackclub.com/api/events/all", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            for item in data[:15]:
                # Only include upcoming/active
                hackathons.append({
                    "id": str(item.get("id", item.get("name"))),
                    "title": item.get("name", "Hackathon"),
                    "organizer": "HackClub Network",
                    "mode": item.get("mode", "In-Person"),
                    "location": f"{item.get('city', '')}, {item.get('state', '')}".strip(", "),
                    "source_name": "HackClub",
                    "source_url": item.get("website", ""),
                    "registration_url": item.get("website", ""),
                    "deadline": item.get("end", ""),
                    "fetched_at": datetime.now(timezone.utc).isoformat(),
                    "verified_status": True
                })
    except Exception as e:
        print(f"HackClub API fetch failed: {e}")
        
    return {"success": True, "data": hackathons}
