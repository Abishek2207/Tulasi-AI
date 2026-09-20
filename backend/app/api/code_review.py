from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.ai_router import resilient_ai_response
from app.api.deps import get_current_user
from app.models.models import User
import json

router = APIRouter()

class CodeReviewRequest(BaseModel):
    code_snippet: str

@router.post("/evaluate")
def evaluate_code(
    data: CodeReviewRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    if not data.code_snippet or not data.code_snippet.strip():
        raise HTTPException(status_code=400, detail="Missing code snippet")

    prompt = f"""You are a strict but helpful Senior Staff Engineer doing a code review.

The user has submitted this code snippet for review:
```
{data.code_snippet}
```

Analyze the code for performance, security vulnerabilities, and code quality.
Respond ONLY with a valid JSON object in this exact format (ensure strings are escaped properly):
{{
  "time_complexity": "brief analysis of Big-O time and space complexity",
  "security": "brief analysis of security or edge case vulnerabilities",
  "score": 85,
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "refactored_code": "a brief clean version of the code"
}}"""

    fallback = {
        "time_complexity": "Pending Analysis",
        "security": "Pending Analysis",
        "score": 50,
        "suggestions": ["AI Engine is currently in safe-mode.", "Please try again later."],
        "refactored_code": data.code_snippet
    }

    result = resilient_ai_response(prompt, fallback=fallback)
    
    return result
