import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime, timezone

from app.api.deps import get_current_user
from app.models.models import User
from app.core.database import get_session
from sqlmodel import Session

router = APIRouter()

@router.get("/github")
def get_github_portfolio(username: str, current_user: User = Depends(get_current_user)):
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "TulasiAI-Agent"
    }
    
    # Optional token if the user happens to have one
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        response = requests.get(f"https://api.github.com/users/{username}/repos?per_page=10&sort=updated", headers=headers, timeout=10)
        
        if response.status_code == 403 or response.status_code == 429:
            raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded. Please try again later.")
        elif response.status_code == 404:
            return {"success": True, "data": []}
            
        response.raise_for_status()
        repos = response.json()
        
        formatted_repos = []
        for repo in repos:
            formatted_repos.append({
                "name": repo.get("name"),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count"),
                "url": repo.get("html_url"),
                "source_name": "GitHub Public API",
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "verified_status": True
            })
            
        return {"success": True, "data": formatted_repos}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch GitHub data: {str(e)}")
