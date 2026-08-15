import json
import re
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, FocusSession
from app.core.ai_router import get_ai_response
from app.api.activity import log_activity_internal

router = APIRouter()

class FocusStartRequest(BaseModel):
    topic: str
    duration_minutes: int = 25

class FocusCompleteRequest(BaseModel):
    session_id: int

@router.post("/start")
def start_focus_session(
    req: FocusStartRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Starts a new Pomodoro focus session."""
    session = FocusSession(
        user_id=current_user.id,
        topic=req.topic,
        duration_minutes=req.duration_minutes,
        status="active"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    log_activity_internal(
        current_user, db, "focus_started", 
        f"Started {req.duration_minutes}m focus session on: {req.topic}", ""
    )
    return session

@router.post("/complete")
def complete_focus_session(
    req: FocusCompleteRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Marks a focus session as completed."""
    session = db.get(FocusSession, req.session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(404, "Session not found")
        
    session.status = "completed"
    db.add(session)
    
    log_activity_internal(
        current_user, db, "focus_completed", 
        f"Completed focus session on: {session.topic}", ""
    )
    db.commit()
    return {"status": "success"}

@router.get("/game")
def get_focus_game(
    topic: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Generates a structured brain-training mini game based on the topic."""
    
    prompt = f"""You are a cognitive learning engine. 
The user is studying: "{topic}". They are taking a 'Brain Break'.
Generate a 3-question mini-game to test their understanding and reinforce memory.
Types of questions to use: 'Predict the output', 'Concept matching', 'Find the bug', 'True/False'.

Return STRICT JSON ONLY with this structure:
{{
  "questions": [
    {{
      "type": "Predict the output",
      "context": "x = 5\\ny = 10\\nprint(x + y)",
      "question": "What is the output?",
      "options": ["5", "10", "15", "510"],
      "correct_answer": "15",
      "explanation": "Integer addition applies here."
    }}
  ]
}}
"""
    try:
        raw = get_ai_response(prompt)
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(raw)
    except Exception as e:
        print(f"Error generating brain game: {e}")
        return {
            "questions": [
                {
                    "type": "Concept Check",
                    "context": f"Topic: {topic}",
                    "question": "Are you feeling confident about this topic?",
                    "options": ["Yes, completely", "Somewhat", "Not really", "No"],
                    "correct_answer": "Yes, completely",
                    "explanation": "Confidence comes with practice!"
                }
            ]
        }
