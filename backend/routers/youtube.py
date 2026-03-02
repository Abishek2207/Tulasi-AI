# backend/routers/youtube.py
from fastapi import APIRouter
import httpx
import os

router = APIRouter()
YT_API_KEY = os.getenv("YOUTUBE_API_KEY")  # Free - 10,000 units/day

EDUCATIONAL_KEYWORDS = [
    "programming tutorial", "data structures", "algorithms",
    "machine learning", "system design", "interview preparation",
    "python tutorial", "javascript", "react", "computer science"
]

@router.get("/reels")
async def get_educational_reels(topic: str = "programming", max_results: int = 10):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={
                "part": "snippet",
                "q": f"{topic} tutorial short",
                "type": "video",
                "videoDuration": "short",  # Under 4 minutes (reels-like)
                "maxResults": max_results,
                "key": YT_API_KEY,
                "safeSearch": "strict",
                "relevanceLanguage": "en"
            }
        )
    
    data = response.json()
    reels = []
    
    for item in data.get("items", []):
        reels.append({
            "video_id": item["id"].get("videoId"),
            "title": item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            "channel": item["snippet"]["channelTitle"],
            "embed_url": f"https://www.youtube.com/embed/{item['id'].get('videoId')}"
        })
    
    return {"reels": reels}

@router.get("/channel-feed")
async def get_channel_feed(channel_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={
                "part": "snippet",
                "channelId": channel_id,
                "type": "video",
                "order": "date",
                "maxResults": 20,
                "key": YT_API_KEY
            }
        )
    return response.json()
