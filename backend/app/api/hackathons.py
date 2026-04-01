from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_session
from app.models.models import Hackathon, HackathonBookmark
from app.api.deps import get_current_user, get_admin_user
from app.models.models import User

router = APIRouter()


def hackathon_to_dict(h: Hackathon, bookmarked: bool = False, applied: bool = False, application_status: str = "Not Applied") -> dict:
    """Normalize hackathon model → consistent JSON the frontend expects."""
    return {
        "id": h.id,
        "title": h.name,
        "organizer": h.organizer,
        "description": h.description,
        "prize_pool": h.prize_pool or h.prize or "Contact Organizer",
        "deadline": h.deadline,
        "registration_link": h.registration_link or h.link or "",
        "tags": h.tags,
        "image_url": h.image_url or "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
        "participants_count": h.participants_count,
        "status": h.status,
        "is_active": h.is_active,
        "bookmarked": bookmarked,
        "applied": applied,
        "application_status": application_status,
        # New Metadata
        "mode": h.event_mode,
        "difficulty": h.difficulty,
        "team_size": h.team_size,
        "start_date": h.start_date,
        "end_date": h.end_date,
        "registration_deadline": h.registration_deadline,
        "domains": h.domains,
        "currency": h.currency,
        "location": h.location,
    }


@router.get("")
def get_hackathons(
    tag: Optional[str] = None,
    status: Optional[str] = None,
    difficulty: Optional[str] = None,
    mode: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 12,
    offset: int = 0,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from app.models.models import HackathonApplication
    statement = select(Hackathon).where(Hackathon.is_active == True)

    if tag and tag.lower() not in ("all", ""):
        statement = statement.where(Hackathon.tags.contains(tag.lower()))
    if status and status.lower() not in ("all", ""):
        statement = statement.where(Hackathon.status == status)
    if difficulty and difficulty.lower() not in ("all", ""):
        statement = statement.where(Hackathon.difficulty == difficulty)
    if mode and mode.lower() not in ("all", ""):
        statement = statement.where(Hackathon.event_mode == mode)
    if q:
        statement = statement.where(
            (Hackathon.name.contains(q)) | (Hackathon.organizer.contains(q)) | (Hackathon.description.contains(q))
        )

    # Get total count before slicing
    all_results = session.exec(statement).all()
    total_count = len(all_results)
    
    # Apply pagination and sorting (newest/deadline first)
    statement = statement.order_by(Hackathon.id.desc()).offset(offset).limit(limit)
    results = session.exec(statement).all()

    # Get user's bookmarks
    bookmarks = session.exec(
        select(HackathonBookmark).where(HackathonBookmark.user_id == current_user.id)
    ).all()
    bookmarked_ids = {b.hackathon_id for b in bookmarks}

    # Get user's applications
    apps = session.exec(
        select(HackathonApplication).where(HackathonApplication.user_id == current_user.id)
    ).all()
    app_map = {a.hackathon_id: a.status for a in apps}

    return {
        "hackathons": [
            hackathon_to_dict(
                h, 
                h.id in bookmarked_ids, 
                h.id in app_map, 
                app_map.get(h.id, "Not Applied")
            ) for h in results
        ],
        "total": total_count,
        "offset": offset,
        "limit": limit
    }

@router.get("/recommend")
def recommend_hackathons(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Simple AI recommendation based on user skills."""
    if not current_user.skills:
        return {"recommendations": []}
    
    from app.models.models import HackathonApplication
    skills = [s.strip().lower() for s in current_user.skills.split(",")]
    
    # Get all active hackathons
    all_h = session.exec(select(Hackathon).where(Hackathon.is_active == True)).all()
    
    recommendations = []
    for h in all_h:
        h_tags = (h.tags + "," + (h.domains or "")).lower()
        score = 0
        for skill in skills:
            if skill in h_tags:
                score += 1
        
        if score > 0:
            recommendations.append((h, score))
    
    # Sort by score
    recommendations.sort(key=lambda x: x[1], reverse=True)
    
    # Bookmarks/Apps context
    bookmarks = {b.hackathon_id for b in session.exec(select(HackathonBookmark).where(HackathonBookmark.user_id == current_user.id)).all()}
    apps = {a.hackathon_id: a.status for a in session.exec(select(HackathonApplication).where(HackathonApplication.user_id == current_user.id)).all()}
    
    return {
        "recommendations": [
            hackathon_to_dict(
                r[0], 
                r[0].id in bookmarks, 
                r[0].id in apps, 
                apps.get(r[0].id, "Not Applied")
            ) for r in recommendations[:5]
        ]
    }


@router.get("/bookmarked")
def get_bookmarked_hackathons(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    bookmarks = session.exec(
        select(HackathonBookmark).where(HackathonBookmark.user_id == current_user.id)
    ).all()
    result = []
    for b in bookmarks:
        h = session.get(Hackathon, b.hackathon_id)
        if h:
            result.append(hackathon_to_dict(h, bookmarked=True))
    return {"hackathons": result, "total": len(result)}


@router.post("/{hackathon_id}/bookmark")
def bookmark_hackathon(
    hackathon_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    hackathon = session.get(Hackathon, hackathon_id)
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    existing_bookmark = session.exec(
        select(HackathonBookmark)
        .where(HackathonBookmark.user_id == current_user.id)
        .where(HackathonBookmark.hackathon_id == hackathon_id)
    ).first()

    if existing_bookmark:
        return {"message": "Hackathon already bookmarked"}

    bookmark = HackathonBookmark(user_id=current_user.id, hackathon_id=hackathon_id)
    session.add(bookmark)
    session.commit()
    session.refresh(bookmark)
    return {"message": "Hackathon bookmarked successfully", "bookmark_id": bookmark.id}


@router.delete("/{hackathon_id}/bookmark")
def unbookmark_hackathon(
    hackathon_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    bookmark = session.exec(
        select(HackathonBookmark)
        .where(HackathonBookmark.user_id == current_user.id)
        .where(HackathonBookmark.hackathon_id == hackathon_id)
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    session.delete(bookmark)
    session.commit()
    return {"message": "Hackathon unbookmarked successfully"}


@router.post("/{hackathon_id}/apply")
def apply_hackathon(
    hackathon_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from app.models.models import HackathonApplication
    query = select(Hackathon).where(Hackathon.id == hackathon_id)
    result = session.exec(query)
    h = result.first()
    if not h:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    query = select(HackathonApplication).where(HackathonApplication.user_id == current_user.id, HackathonApplication.hackathon_id == hackathon_id)
    result = session.exec(query)
    existing = result.first()

    if existing:
        return {"message": "Already applied", "status": existing.status}

    app = HackathonApplication(user_id=current_user.id, hackathon_id=hackathon_id)
    session.add(app)
    session.commit()
    return {"message": "Applied successfully", "status": "Applied"}


@router.get("/{hackathon_id}")
def get_hackathon(hackathon_id: int, session: Session = Depends(get_session)):
    h = session.get(Hackathon, hackathon_id)
    if not h:
        raise HTTPException(404, "Hackathon not found")
    return hackathon_to_dict(h)


class HackathonCreate(BaseModel):
    title: str
    organizer: str
    description: str
    prize_pool: str = ""
    deadline: str
    registration_link: str = ""
    tags: str = ""
    image_url: str = ""
    participants_count: int = 0
    status: str = "Open"
    # Metadata
    mode: str = "Online"
    difficulty: str = "Beginner"
    team_size: str = "1-4 builders"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    registration_deadline: Optional[str] = None
    domains: str = ""
    currency: str = "USD"
    location: Optional[str] = None


@router.post("")
def create_hackathon(
    req: HackathonCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    h = Hackathon(
        name=req.title,
        organizer=req.organizer,
        description=req.description,
        prize=req.prize_pool,
        prize_pool=req.prize_pool,
        deadline=req.deadline,
        link=req.registration_link,
        registration_link=req.registration_link,
        tags=req.tags,
        image_url=req.image_url,
        participants_count=req.participants_count,
        status=req.status,
        # Metadata
        mode=req.mode,
        difficulty=req.difficulty,
        team_size=req.team_size,
        start_date=req.start_date,
        end_date=req.end_date,
        registration_deadline=req.registration_deadline,
        domains=req.domains,
        currency=req.currency,
        location=req.location,
    )
    session.add(h)
    session.commit()
    session.refresh(h)
    return hackathon_to_dict(h)

@router.post("/seed")
def seed_hackathons_endpoint(
    session: Session = Depends(get_session),
    admin: User = Depends(get_current_user)  # Temporarily allow any user to trigger the massive seed
):
    import sys
    import os
    script_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    script_path = os.path.join(script_dir, "scripts")
    if script_path not in sys.path:
        sys.path.append(script_path)
    
    from seed_hackathons import seed
    added_count = seed(session)
    return {"message": f"Successfully seeded {added_count} hackathons", "added_count": added_count}
