from fastapi import APIRouter, HTTPException
from services.youtube import get_educational_videos

router = APIRouter(prefix="/api/youtube", tags=["YouTube"])

@router.get("/search")
async def search_videos(query: str = "software engineering tutorial", limit: int = 10):
    try:
        videos = await get_educational_videos(query, limit)
        return videos
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
