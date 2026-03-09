from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()

# Curated free resources
CODE_RESOURCES = [
    {"name": "LeetCode", "url": "https://leetcode.com", "desc": "Premier platform for DSA problems with company-tagged questions.", "icon": "🧩", "difficulty": "All levels", "tag": "dsa"},
    {"name": "HackerRank", "url": "https://hackerrank.com", "desc": "Practice coding challenges and earn skill certifications.", "icon": "🏅", "difficulty": "Beginner-Advanced", "tag": "dsa"},
    {"name": "Codeforces", "url": "https://codeforces.com", "desc": "Competitive programming with rated contests and editorial discussions.", "icon": "⚡", "difficulty": "Intermediate-Expert", "tag": "competitive"},
    {"name": "GeeksforGeeks", "url": "https://geeksforgeeks.org", "desc": "Comprehensive tutorials, articles, and problems for CS concepts.", "icon": "🌱", "difficulty": "All levels", "tag": "learn"},
    {"name": "AtCoder", "url": "https://atcoder.jp", "desc": "Japan's top programming contests, excellent for competitive practice.", "icon": "🎯", "difficulty": "Intermediate-Expert", "tag": "competitive"},
    {"name": "CodeChef", "url": "https://codechef.com", "desc": "Monthly contests, practice problems, and rating system.", "icon": "👨‍🍳", "difficulty": "All levels", "tag": "competitive"},
    {"name": "Project Euler", "url": "https://projecteuler.net", "desc": "Math-based programming challenges. Perfect for building number theory skills.", "icon": "🔢", "difficulty": "Intermediate-Expert", "tag": "math"},
    {"name": "Exercism", "url": "https://exercism.io", "desc": "Practice programming in 50+ languages with mentor feedback.", "icon": "💪", "difficulty": "All levels", "tag": "learn"},
    {"name": "Edabit", "url": "https://edabit.com", "desc": "Gamified coding challenges for beginners and intermediates.", "icon": "🎮", "difficulty": "Beginner-Intermediate", "tag": "learn"},
    {"name": "CodeWars", "url": "https://codewars.com", "desc": "Kata-based challenges that improve your coding skills progressively.", "icon": "⚔️", "difficulty": "All levels", "tag": "dsa"},
]

PRACTICE_TRACKS = [
    {"id": "dsa", "title": "Data Structures & Algorithms", "problems": 150, "solved": 0, "icon": "🧮"},
    {"id": "web", "title": "Web Development", "problems": 80, "solved": 0, "icon": "🌐"},
    {"id": "sql", "title": "SQL & Databases", "problems": 60, "solved": 0, "icon": "🗄️"},
    {"id": "python", "title": "Python Mastery", "problems": 100, "solved": 0, "icon": "🐍"},
]


class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    stdin: Optional[str] = None


@router.get("/resources")
def get_resources():
    return {"resources": CODE_RESOURCES}


@router.get("/tracks")
def get_tracks(current_user: User = Depends(get_current_user)):
    return {"tracks": PRACTICE_TRACKS}


import subprocess
import os
import tempfile

@router.post("/run")
def run_code(req: CodeRequest, current_user: User = Depends(get_current_user)):
    if req.language != "python":
        return {"output": f"Language {req.language} is not supported in this offline mock yet.", "status": "error"}
    
    # Save code to a temp file and execute it safely with a timeout
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(req.code)
            temp_path = f.name
        
        result = subprocess.run(
            ["python3", temp_path],
            capture_output=True,
            text=True,
            timeout=3.0 # Prevents infinite loops like while True
        )
        
        os.remove(temp_path)
        
        output = result.stdout
        if result.stderr:
            output += f"\nError:\n{result.stderr}"
            
        return {"output": output or "Executed successfully (no output)", "status": "success"}
    except subprocess.TimeoutExpired:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return {"output": "Error: Code execution timed out (limit: 3 seconds). Check for infinite loops.", "status": "error"}
    except Exception as e:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return {"output": f"Execution Error: {str(e)}", "status": "error"}
