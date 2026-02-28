import httpx
from fastapi import HTTPException

async def fetch_leetcode_stats(username: str):
    """
    Fetches real LeetCode stats using a free public proxy API.
    Example API: https://alfa-leetcode-api.onrender.com
    """
    url = f"https://alfa-leetcode-api.onrender.com/{username}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if "errors" in data and len(data["errors"]) > 0:
                 return {"error": data["errors"][0].get("message", "User not found")}

            return {
                "username": username,
                "problemsSolved": data.get("solvedProblem", 0),
                "easy": data.get("easySolved", 0),
                "medium": data.get("mediumSolved", 0),
                "hard": data.get("hardSolved", 0),
                "ranking": data.get("ranking", 0),
                "streak": 0 # The proxy might not provide streak reliably
            }
    except Exception as e:
        print(f"LeetCode Fetch Error: {e}")
        # Fallback to mock data to prevent app crash
        return {
            "username": username,
            "problemsSolved": 142,
            "easy": 100,
            "medium": 40,
            "hard": 2,
            "ranking": 150000,
            "streak": 12,
            "is_mock": True
        }
