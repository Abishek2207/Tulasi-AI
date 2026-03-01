from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/code", tags=["Code Lab & IDE"])

class ExecutionRequest(BaseModel):
    code: str
    language: str = "python"

@router.post("/execute")
async def execute_code(request: ExecutionRequest):
    # Logic to execute code in a sandbox (Piston API or similar)
    return {"status": "success", "output": "Hello, TulasiAI!"}

@router.get("/challenges")
async def get_coding_challenges():
    return [{"id": 1, "title": "Palindrome Check", "difficulty": "Easy"}]
