import os
import httpx
from fastapi import HTTPException

async def get_educational_videos(query: str = "software engineering tutorial", limit: int = 10):
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    if not YOUTUBE_API_KEY:
        # Fallback dummy data if key is missing
        return [{"id": "dQw4w9WgXcQ", "title": "Please configure YOUTUBE_API_KEY", "channel": "TulasiAI Admin", "thumbnail": ""}]
    
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults={limit}&q={query}&type=video&videoCategoryId=27&key={YOUTUBE_API_KEY}"
    
    async with httpx.AsyncClient() as client:
        try {
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            videos = []
            for item in data.get("items", []):
                videos.append({
                    "id": item["id"]["videoId"],
                    "title": item["snippet"]["title"],
                    "description": item["snippet"]["description"],
                    "channel": item["snippet"]["channelTitle"],
                    "thumbnail": item["snippet"]["thumbnails"]["high"]["url"]
                })
            return videos
        except Exception as e:
            print(f"YouTube Fetch Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch YouTube videos")
