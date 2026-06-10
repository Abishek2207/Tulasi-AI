import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List

from app.api.deps import get_current_user
from app.models.models import User, AgentLog
from app.core.database import get_session
from sqlmodel import Session
from app.core.ai_router import get_ai_response

router = APIRouter()

def require_ai_key():
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=503, detail="Gemini API key not configured")

class DSAQuery(BaseModel):
    message: str
    context: Optional[str] = None

@router.post("/dsa")
async def dsa_agent(query: DSAQuery, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    require_ai_key()
    
    prompt = f"You are a DSA expert tutor. The user says: {query.message}\nContext: {query.context}\nProvide a helpful, educational response."
    response = await get_ai_response(prompt)
    
    # Log the action
    log = AgentLog(user_id=current_user.id, agent_name="dsa", action="query", data_source="AI")
    db.add(log)
    db.commit()
    
    return {"success": True, "reply": response}

class CommQuery(BaseModel):
    message: str
    prompt_id: Optional[str] = None

@router.post("/communication")
async def communication_agent(query: CommQuery, current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    require_ai_key()
    
    prompt = f"Evaluate the following user response for grammar and confidence: '{query.message}'. Return JSON with 'feedback', 'grammar_score', and 'confidence_score'."
    response = await get_ai_response(prompt)
    
    log = AgentLog(user_id=current_user.id, agent_name="communication", action="evaluate", data_source="AI")
    db.add(log)
    db.commit()
    
    return {"success": True, "reply": response}
