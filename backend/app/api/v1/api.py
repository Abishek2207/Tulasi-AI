from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, ai, coding, interview, roadmaps, metrics,
    notes, streak, certificates, hackathons
)

api_router = APIRouter()

# Existing routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(coding.router, prefix="/code", tags=["coding"])
api_router.include_router(interview.router, prefix="/interview", tags=["interview"])
api_router.include_router(roadmaps.router, prefix="/roadmaps", tags=["roadmaps"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])

# New routers
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(streak.router, prefix="/streak", tags=["streak"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(hackathons.router, prefix="/hackathons", tags=["hackathons"])
