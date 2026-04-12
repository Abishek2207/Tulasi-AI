"""
Certification Engine API — curated learning certifications filtered by role + skill level.
Extends existing /dashboard/certificates page.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, UserTypeEnum
from typing import Optional

router = APIRouter()


# ── Certification Data ───────────────────────────────────────────────────────

CERTIFICATIONS = [
    # Google
    {"id": "gc1", "name": "Google Data Analytics Certificate", "provider": "Google",
     "provider_color": "#4285F4", "level": "beginner", "duration": "6 months",
     "url": "https://grow.google/certificates/data-analytics/",
     "tags": ["data", "analytics", "sql"], "roles": ["student", "professional"], "free": False,
     "rating": 4.8, "enrolled": "1.2M+"},

    {"id": "gc2", "name": "Google IT Support Professional", "provider": "Google",
     "provider_color": "#4285F4", "level": "beginner", "duration": "6 months",
     "url": "https://grow.google/certificates/it-support/",
     "tags": ["it", "support", "networking"], "roles": ["student"], "free": False,
     "rating": 4.7, "enrolled": "900K+"},

    {"id": "gc3", "name": "Google Cloud Associate Engineer", "provider": "Google Cloud",
     "provider_color": "#4285F4", "level": "intermediate", "duration": "3-6 months",
     "url": "https://cloud.google.com/certification/cloud-engineer",
     "tags": ["cloud", "gcp", "devops"], "roles": ["professional"], "free": False,
     "rating": 4.9, "enrolled": "500K+"},

    # Microsoft
    {"id": "ms1", "name": "Microsoft Azure Fundamentals (AZ-900)", "provider": "Microsoft",
     "provider_color": "#0078D4", "level": "beginner", "duration": "1-2 months",
     "url": "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/",
     "tags": ["azure", "cloud", "fundamentals"], "roles": ["student", "professional"], "free": True,
     "rating": 4.8, "enrolled": "2M+"},

    {"id": "ms2", "name": "Microsoft AI-900: AI Fundamentals", "provider": "Microsoft",
     "provider_color": "#0078D4", "level": "beginner", "duration": "1-2 months",
     "url": "https://learn.microsoft.com/en-us/certifications/azure-ai-fundamentals/",
     "tags": ["ai", "azure", "machine-learning"], "roles": ["student", "professional"], "free": True,
     "rating": 4.7, "enrolled": "1.5M+"},

    {"id": "ms3", "name": "Microsoft Azure Solutions Architect (AZ-305)", "provider": "Microsoft",
     "provider_color": "#0078D4", "level": "advanced", "duration": "3-4 months",
     "url": "https://learn.microsoft.com/en-us/certifications/azure-solutions-architect/",
     "tags": ["azure", "architecture", "cloud"], "roles": ["professional"], "free": False,
     "rating": 4.9, "enrolled": "300K+"},

    # AWS
    {"id": "aws1", "name": "AWS Cloud Practitioner", "provider": "Amazon AWS",
     "provider_color": "#FF9900", "level": "beginner", "duration": "1-2 months",
     "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
     "tags": ["aws", "cloud", "fundamentals"], "roles": ["student", "professional"], "free": False,
     "rating": 4.8, "enrolled": "3M+"},

    {"id": "aws2", "name": "AWS Solutions Architect Associate", "provider": "Amazon AWS",
     "provider_color": "#FF9900", "level": "intermediate", "duration": "2-3 months",
     "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
     "tags": ["aws", "architecture", "cloud"], "roles": ["professional"], "free": False,
     "rating": 4.9, "enrolled": "2M+"},

    # Meta
    {"id": "meta1", "name": "Meta Front-End Developer Certificate", "provider": "Meta",
     "provider_color": "#1877F2", "level": "beginner", "duration": "7 months",
     "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
     "tags": ["react", "javascript", "frontend"], "roles": ["student"], "free": False,
     "rating": 4.7, "enrolled": "400K+"},

    {"id": "meta2", "name": "Meta Back-End Developer Certificate", "provider": "Meta",
     "provider_color": "#1877F2", "level": "intermediate", "duration": "8 months",
     "url": "https://www.coursera.org/professional-certificates/meta-back-end-developer",
     "tags": ["python", "api", "backend", "django"], "roles": ["student", "professional"], "free": False,
     "rating": 4.6, "enrolled": "200K+"},

    # IBM
    {"id": "ibm1", "name": "IBM Data Science Professional", "provider": "IBM",
     "provider_color": "#006699", "level": "beginner", "duration": "10 months",
     "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
     "tags": ["data-science", "python", "ml"], "roles": ["student", "professional"], "free": False,
     "rating": 4.6, "enrolled": "700K+"},

    {"id": "ibm2", "name": "IBM AI Engineering Professional", "provider": "IBM",
     "provider_color": "#006699", "level": "intermediate", "duration": "8 months",
     "url": "https://www.coursera.org/professional-certificates/ai-engineer",
     "tags": ["ai", "deep-learning", "tensorflow"], "roles": ["professional"], "free": False,
     "rating": 4.7, "enrolled": "300K+"},

    # Free additions
    {"id": "free1", "name": "CS50: Introduction to Programming", "provider": "Harvard/edX",
     "provider_color": "#A51C30", "level": "beginner", "duration": "3-6 months",
     "url": "https://cs50.harvard.edu/", "tags": ["cs", "programming", "fundamentals"],
     "roles": ["student"], "free": True, "rating": 4.9, "enrolled": "4M+"},

    {"id": "free2", "name": "Full Stack Open (React + Node.js)", "provider": "University of Helsinki",
     "provider_color": "#003580", "level": "intermediate", "duration": "4-6 months",
     "url": "https://fullstackopen.com/", "tags": ["react", "nodejs", "fullstack"],
     "roles": ["student", "professional"], "free": True, "rating": 4.9, "enrolled": "300K+"},
]


@router.get("")
async def get_certifications(
    skill_level: Optional[str] = Query(None, description="beginner / intermediate / advanced"),
    role: Optional[str] = Query(None, description="student / professional"),
    tag: Optional[str] = Query(None, description="Filter by tag e.g. 'cloud', 'ai'"),
    free_only: bool = Query(False, description="Show only free certifications"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get curated certifications filtered by user's level and role."""

    # Auto-detect role from user_type if not provided
    if not role:
        role = "student" if current_user.user_type == UserTypeEnum.STUDENT else "professional"

    filtered = CERTIFICATIONS

    if skill_level:
        filtered = [c for c in filtered if c["level"] == skill_level]

    if role:
        filtered = [c for c in filtered if role in c["roles"]]

    if tag:
        filtered = [c for c in filtered if tag.lower() in c["tags"]]

    if free_only:
        filtered = [c for c in filtered if c["free"]]

    # Sort: free first, then by rating
    filtered.sort(key=lambda x: (-int(x["free"]), -x["rating"]))

    # Map to frontend expected format
    formatted = []
    for c in filtered:
        item = dict(c)
        item["cost"] = "Free" if c["free"] else "Paid"
        item["role"] = c["roles"]
        formatted.append(item)

    return {
        "certifications": formatted,
        "total": len(formatted),
        "filters_applied": {
            "skill_level": skill_level,
            "role": role,
            "tag": tag,
            "free_only": free_only
        }
    }


@router.get("/recommended")
async def get_recommended_certifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get top 4 AI-recommended certifications based on user profile."""
    profile = current_user.profile
    is_student = current_user.user_type == UserTypeEnum.STUDENT

    exp = profile.experience_years if profile else 0
    skill_level = profile.skill_level if profile else "beginner"

    # Map skill level string to certification level
    level_map = {"beginner": "beginner", "intermediate": "intermediate",
                 "advanced": "advanced", "expert": "advanced"}
    cert_level = level_map.get((skill_level or "beginner").lower(), "beginner")
    role_filter = "student" if is_student else "professional"

    recommended = [
        c for c in CERTIFICATIONS
        if c["level"] == cert_level and role_filter in c["roles"]
    ][:4]

    if not recommended:
        recommended = CERTIFICATIONS[:4]

    return {
        "recommended": recommended,
        "based_on": {"role": role_filter, "level": cert_level}
    }
