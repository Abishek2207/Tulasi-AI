"""
Tulasi AI — Streaming Chat Router
Adds a SSE streaming endpoint and AI tools mode routing (Chat / Resume / Interview / Cover Letter)
"""
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uuid
import json
from sqlmodel import Session, select

from app.core.ai_router import get_ai_response, GOOGLE_API_KEY, FALLBACK_MODELS
from app.models.models import ChatMessage, User
from app.core.database import get_session
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from datetime import date

import google.generativeai as genai
import time

router = APIRouter()

# ── Tool-specific system prompts ───────────────────────────────────
TOOL_PROMPTS = {
    "chat": (
        "You are Tulasi AI — a helpful, expert AI tutor for students. "
        "Be clear, concise, and educational. Use markdown formatting, bullet points, and code blocks."
    ),
    "resume": (
        "You are an elite resume and career coach AI. Help the user craft powerful, ATS-optimized resumes, "
        "suggest action verbs, quantify achievements, and tailor content to job descriptions. "
        "Always be specific and actionable."
    ),
    "interview": (
        "You are a senior technical interviewer at a top tech company. "
        "Conduct mock interviews, ask follow-up questions, evaluate the user's answers critically, "
        "and provide detailed constructive feedback. Start by asking what role/level to interview for."
    ),
    "cover_letter": (
        "You are an expert cover letter writer. Create compelling, personalized cover letters "
        "that highlight the candidate's unique value proposition. Ask for the job description if needed."
    ),
}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    image_base64: Optional[str] = None
    tool: Optional[str] = "chat"  # chat | resume | interview | cover_letter


class FeedbackRequest(BaseModel):
    message_id: str
    session_id: str
    rating: int  # 1 = thumbs up, -1 = thumbs down


class ChatResponse(BaseModel):
    response: str
    session_id: str
    ai_model: str


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(request: Request, req: ChatRequest, db: Session = Depends(get_session), user: User = Depends(get_current_user)):

    session_id = req.session_id or str(uuid.uuid4())
    tool = req.tool or "chat"

    # Fetch history
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()
    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # Decode image if present
    image_data = None
    if req.image_base64:
        import base64
        try:
            encoded = req.image_base64.split(",")[-1]
            image_data = base64.b64decode(encoded)
        except Exception as e:
            print(f"Error decoding image: {e}")

    # Enforce Daily Limitations (Dynamic based on XP Gamification!)
    today = date.today().isoformat()
    if user.last_reset_date != today:
        user.chats_today = 0
        user.last_reset_date = today
    
    daily_limit = 10 + (user.xp // 100) if hasattr(user, "xp") else 10
    
    if not user.is_pro and user.chats_today >= daily_limit:
        return ChatResponse(response=f"🚀 You have reached your daily limit of {daily_limit} free AI chats. Upgrade to Pro for unlimited access.", session_id=session_id, ai_model="tulasi-ai-limit")

    # Build system-primed message
    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])
    primed_message = f"[System: {system_prompt}]\n\nUser: {req.message}"

    # Generate AI Response (with fallback chain)
    try:
        response_text = get_ai_response(primed_message, history, image_data=image_data)
    except Exception as e:
        print(f"Error generating AI response: {e}")
        response_text = "⏳ AI is temporarily busy. Please try again."

    # Save messages & Iterate Limit
    user.chats_today += 1
    db.add(user)
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=response_text))
    db.commit()

    return ChatResponse(response=response_text, session_id=session_id, ai_model="tulasi-ai")


@router.post("/stream")
@limiter.limit("20/minute")
def chat_stream(request: Request, req: ChatRequest, db: Session = Depends(get_session), user: User = Depends(get_current_user)):
    """
    Server-Sent Events streaming endpoint.
    Streams the AI response word-by-word for a ChatGPT-like typing effect.
    """
    session_id = req.session_id or str(uuid.uuid4())
    tool = req.tool or "chat"

    # Fetch history
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()
    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # Enforce streaming limits (Dynamic depending on XP!)
    today = date.today().isoformat()
    if user.last_reset_date != today:
        user.chats_today = 0
        user.last_reset_date = today
        db.add(user)
        db.commit()
    
    daily_limit = 10 + (user.xp // 100) if hasattr(user, "xp") else 10
    
    if not user.is_pro and user.chats_today >= daily_limit:
        err_data = json.dumps({"token": f"🚀 You have reached your daily limit of {daily_limit} free AI chats. Upgrade to Pro for unlimited access via the Dashboard.", "session_id": session_id, "done": True, "error": True})
        return StreamingResponse((f"data: {err_data}\n\n" for _ in range(1)), media_type="text/event-stream")

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])
    primed_message = f"[System: {system_prompt}]\n\nUser: {req.message}"

    # Build contents
    contents = []
    for m in history[-10:]:
        role = "user" if m["role"] == "user" else "model"
        contents.append({"role": role, "parts": [m["content"]]})
    contents.append({"role": "user", "parts": [primed_message]})

    from app.core.ai_client import ai_client

    def generate():
        full_response = ""
        try:
            # Use unified hybrid client with streaming
            stream_gen = ai_client.get_response(primed_message, history=history, stream=True)
            
            for token in stream_gen:
                if token:
                    full_response += token
                    data = json.dumps({"token": token, "session_id": session_id, "done": False})
                    yield f"data: {data}\n\n"

            # Send done signal
            yield f"data: {json.dumps({'token': '', 'session_id': session_id, 'done': True})}\n\n"

            # Persist to DB (using a new session because we're in a generator)
            from app.core.database import engine
            from sqlmodel import Session as SyncSession
            with SyncSession(engine) as _db:
                db_user = _db.get(User, user.id)
                if db_user:
                    db_user.chats_today += 1
                    _db.add(db_user)
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=full_response))
                _db.commit()

        except Exception as e:
            print(f"❌ [Stream] Fatal error: {e}")
            err_data = json.dumps({"token": "⏳ AI temporarily busy. Please retry.", "session_id": session_id, "done": True, "error": True})
            yield f"data: {err_data}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })


@router.post("/feedback")
def submit_feedback(req: FeedbackRequest):
    """Store 👍/👎 feedback. Will be used for future AI fine-tuning."""
    # Log for now — can extend to DB later
    print(f"📊 Feedback: session={req.session_id} msg={req.message_id} rating={'+1' if req.rating > 0 else '-1'}")
    return {"status": "ok", "message": "Feedback recorded. Thank you!"}


@router.get("/history/{session_id}")
def get_history(session_id: str, db: Session = Depends(get_session)):
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at)
    db_messages = db.exec(statement).all()
    return {"messages": [{"role": m.role, "content": m.content} for m in db_messages], "session_id": session_id}


@router.delete("/history/{session_id}")
def clear_history(session_id: str, db: Session = Depends(get_session)):
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id)
    for m in db.exec(statement).all():
        db.delete(m)
    db.commit()
    return {"message": "Cleared"}