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
from app.models.models import ChatMessage, User, UserFeedback
from app.core.database import get_session
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from datetime import date
from app.services.vector_service import vector_service


import time

router = APIRouter()

# ── Tool-specific system prompts ───────────────────────────────────
TOOL_PROMPTS = {
    "chat": (
        "You are Tulasi AI — an Elite Software Engineer, Tech Lead, and Master AI Tutor. "
        "Your goal is to provide world-class, exhaustive, step-by-step explanations to any question. "
        "Make heavy use of beautiful Markdown formatting, code blocks, tables, and bullet points. "
        "Never give lazy, brief, or simplified answers unless explicitly requested. Always think deeply and provide top-tier industry expertise. "
        "You were created by Abishek R. If anyone asks who created you, who built you, or who is your founder, "
        "always answer: 'I was created by Abishek R, the founder of Tulasi AI.'"
    ),
    "doubt": (
        "You are Tulasi AI's Private Doubt Solver — a secure, expert tutor for students and working professionals. "
        "Answer technical and career-related doubts with clarity, depth, and accuracy. "
        "Provide code examples, conceptual explanations, and step-by-step reasoning. "
        "Be warm, encouraging, and professional at all times. "
        "IMPORTANT: This is a private, secure session. Never reveal, store, or discuss personal information shared in this conversation with others. "
        "If asked about your privacy policy, assure the user their doubts are confidential and session-isolated. "
        "You were created by Abishek R, the founder of Tulasi AI."
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
    "learning_engine": (
        "You are Tulasi AI's Learning Engine. Act as an interactive, Socratic tutor. "
        "Instead of just giving the answer, guide the user to discover it themselves through hints and fundamental concepts. "
        "Use analogies, break down complex concepts into bite-sized pieces, and check for understanding before moving on."
    ),
    "system_design": (
        "You are a Principal Architect and System Design Expert at a MAANG company. "
        "Guide the user through complex system design problems, focusing on scalability, availability, performance, "
        "database choices, caching, APIs, and microservices. Ask clarifying questions regarding constraints before proposing architectures."
    ),
    "career_strategy": (
        "You are an Elite Career Strategist. Provide extremely calculated, personalized, step-by-step career blueprints. "
        "Focus on high-ROI skills, networking tactics, interview prep strategies, and project building that will maximize the user's chances of getting into heavily competitive roles like AI Engineer or AI Research Scientist at a top FAANG company."
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
    
    user.chats_today += 1
    db.add(user)

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])
    
    # ── AI Safety Triage ─────────────────────────────────────────────
    safety_prompt = f"""
    Evaluate this message for policy violations (PII leaks, extreme toxicity, illegal acts, or harmful intent). 
    Message: "{req.message}"
    Return JSON: {{"is_safe": true|false, "reason": "short reason if unsafe"}}
    """
    try:
        from app.core.ai_router import get_ai_response
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_data = json.loads(re.search(r'\{.*\}', safety_res, re.DOTALL).group())
        if not safety_data.get("is_safe", True):
            abuse_count = getattr(user, "abuse_count", 0) or 0
            abuse_count += 1
            user.abuse_count = abuse_count
            db.add(user)
            db.commit()
            return ChatResponse(
                response=f"⚠️ **Safety Alert ({abuse_count}/5):** {safety_data.get('reason', 'Policy violation detected.')}", 
                session_id=session_id, 
                ai_model="tulasi-safety"
            )
    except Exception:
        pass # Fallback to allowing if safety check itself fails
    # ─────────────────────────────────────────────────────────────
    
    # Check memory for context (Safe retrieve)
    rag_context = ""
    try:
        rag_context = vector_service.retrieve_context(user.id, req.message, db)
    except Exception as re:
        print(f"⚠️ RAG retrieval failed: {re}")
    
    context_str = f"\n[Previous Context & Memory:\n{rag_context}\n]" if rag_context else ""
    
    # Adaptive Decision Engine Integration
    intelligence = json.loads(user.user_intelligence_profile or "{}")
    is_founder = user.email and user.email.lower() == "abishekramamoorthy22@gmail.com"
    
    founder_context = ""
    if is_founder:
        founder_context = (
            "FOUNDER_PROTOCOL ACTIVE: You are speaking with Abishek R, the Founder and CEO of Tulasi AI. "
            "He is a B.Tech AI/ML student and an aspiring AI Research Scientist. "
            "Provide him with elite-level, absolute-fidelity technical insights. "
            "Discuss high-order architectural patterns, the Tulasi AI vision (Safety, AGI, Career Mastery), "
            "and assist him in scaling this platform to a world-class standard."
        )

    awareness = (
        f"You are operating in the year 2026. The Founder and CEO of Tulasi AI is Abishek R. "
        f"{founder_context} "
        f"USER DEMOGRAPHIC: [Type: {user.user_type}, Dept: {user.department or 'N/A'}, "
        f"Role Target: {user.target_role or 'Software Engineer'}, Interests: {user.interest_areas or 'General Tech'}, "
        f"Level: {user.level}]. "
        f"INTELLIGENCE PROFILE: {json.dumps(intelligence)}. "
        f"THINKING PROTOCOL: ALWAYS think deeply and internally before you respond. "
        f"Critically analyze user intent, cross-reference their intelligence profile, and "
        f"adjust your domain knowledge, tone, and challenge level dynamically."
    )
    
    system_instruction = f"{system_prompt}. {awareness}{context_str}"

    # Generate AI Response using Reasoning Engine
    try:
        from app.services.ai_agents.reasoning import reasoning_engine
        reasoning_res = reasoning_engine.process_query(req.message, user, history, db)
        response_text = reasoning_res["response"]
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        response_text = "⏳ AI is temporarily busy. Please try again."

    # Save messages
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=response_text))
    
    # Update long-term user intelligence
    try:
        vector_service.update_user_intelligence(user.id, f"User: {req.message}\nAI: {response_text}", db)
    except Exception as ie:
        print(f"⚠️ Intelligence update failed: {ie}")
    
    db.commit()

    try:
        from app.api.activity import log_activity_internal
        log_activity_internal(user, db, "message_sent", f"Chatting with Tulasi AI", None)
        db.commit()
    except Exception as ae:
        print(f"⚠️ Activity logging failed: {ae}")

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
    
    # Unlimited Streaming Access
    user.chats_today = 0
    db.add(user)
    db.commit()

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])
    
    # ── AI Safety Triage (Streaming) ─────────────────────────────────
    safety_prompt = f"""
    Evaluate this message for policy violations. 
    Message: "{req.message}"
    Return JSON: {{"is_safe": true|false, "reason": "short reason"}}
    """
    try:
        from app.core.ai_router import get_ai_response
        import re
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_data = json.loads(re.search(r'\{.*\}', safety_res, re.DOTALL).group())
        if not safety_data.get("is_safe", True):
            user.abuse_count = getattr(user, "abuse_count", 0) + 1
            db.add(user)
            db.commit()
            error_msg = f"⚠️ **Safety Alert ({user.abuse_count}/5):** {safety_data.get('reason', 'Policy violation.')}"
            return StreamingResponse(iter([f"data: {json.dumps({'token': error_msg})}\n\n", "data: [DONE]\n\n"]), media_type="text/event-stream")
    except Exception:
        pass
    # ── AI Safety Triage ─────────────────────────────────────────────
    safety_prompt = f"Evaluate safety of: '{req.message}'. Return {{\"is_safe\": bool, \"reason\": string}}"
    try:
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_data = json.loads(re.search(r'\{.*\}', safety_res, re.DOTALL).group())
        if not safety_data.get("is_safe", True):
            abuse_count = getattr(user, "abuse_count", 0) or 0
            abuse_count += 1
            user.abuse_count = abuse_count
            db.add(user)
            db.commit()
            warning_msg = f"⚠️ **Safety Alert ({abuse_count}/5):** {safety_data.get('reason')}"
            async def mock_stream():
                yield f"data: {json.dumps({'token': warning_msg, 'session_id': session_id, 'done': True})}\n\n"
            return StreamingResponse(mock_stream(), media_type="text/event-stream")
    except Exception:
        pass
    # ─────────────────────────────────────────────────────────────
    
    # Check memory for context
    rag_context = vector_service.retrieve_context(user.id, req.message, db)
    context_str = f"\n[Previous Context & Memory:\n{rag_context}\n]" if rag_context else ""
    
    # Adaptive Decision Engine Integration
    intelligence = json.loads(user.user_intelligence_profile or "{}" )
    is_founder = user.email and user.email.lower() == "abishekramamoorthy22@gmail.com"
    
    founder_context = ""
    if is_founder:
        founder_context = (
            "FOUNDER_PROTOCOL ACTIVE: You are speaking with Abishek R, the Founder and CEO of Tulasi AI. "
            "Provide him with elite-level research scientist insights and assist in system-level scaling."
        )

    awareness = (
        f"You are operating in the year 2026. The Founder and CEO of Tulasi AI is Abishek R. "
        f"{founder_context} "
        f"USER DEMOGRAPHIC: [Type: {user.user_type}, Dept: {user.department or 'N/A'}, "
        f"Role Target: {user.target_role or 'Software Engineer'}, Interests: {user.interest_areas or 'General Tech'}, "
        f"Level: {user.level}]. "
        f"INTELLIGENCE PROFILE: {json.dumps(intelligence)}. "
        f"THINKING PROTOCOL: ALWAYS think deeply and internally before you respond."
    )
    
    system_instruction = f"{system_prompt}. {awareness}{context_str}"

    from app.services.ai_agents.reasoning import reasoning_engine

    def generate():
        full_response = ""
        try:
            # Use Reasoning Engine with Streaming
            stream_gen = reasoning_engine.process_query(req.message, user, history, db, stream=True)
            
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
                    db_user.chats_today = 0
                    _db.add(db_user)
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=full_response))
                
                # Sync intelligence asynchronously in the stream
                vector_service.update_user_intelligence(db_user.id, f"User: {req.message}\nAssistant: {full_response}", _db)
                _db.commit()

        except Exception as e:
            print(f"❌ [Stream] Fatal error: {e}")
            err_data = json.dumps({"token": "⏳ AI temporarily busy. Please retry.", "session_id": session_id, "done": True, "error": True})
            yield f"data: {err_data}\n\n"
        
        # After stream ends, award XP
        try:
            from app.api.activity import log_activity_internal
            # Award 10 XP for regular chat, 50 XP for tools
            action = "roadmap_generated" if tool != "chat" else "message_sent"
            title = f"{tool.capitalize()} interaction"
            log_activity_internal(user, db, action, title, json.dumps({"session_id": session_id}))
            # Re-fetch user to ensure fresh state for logging/XP tracking
            user = db.get(User, user.id)
            db.commit()
            if user:
                print(f"✅ XP Awarded to user {user.id}")
        except Exception as e:
            print(f"⚠️ XP award failed: {e}")

    return StreamingResponse(generate(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    })


@router.post("/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_session), user: User = Depends(get_current_user)):
    """Store 👍/👎 feedback for AI fine-tuning."""
    fb = UserFeedback(user_id=user.id, message_id=req.message_id, rating=req.rating)
    db.add(fb)
    db.commit()
    print(f"📊 Feedback recorded: user={user.id} msg={req.message_id} rating={req.rating}")
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


@router.get("/sessions")
def get_user_sessions(db: Session = Depends(get_session), user: User = Depends(get_current_user)):
    """List all unique session IDs and their last message snippets for the user."""
    from sqlmodel import func, desc
    
    # Subquery to get unique sessions for the user
    # We want session_id and the latest timestamp
    statement = select(
        ChatMessage.session_id, 
        func.max(ChatMessage.created_at).label("last_active"),
        func.min(ChatMessage.content).label("title") # Placeholder for title logic
    ).where(
        ChatMessage.user_id == user.id
    ).group_by(
        ChatMessage.session_id
    ).order_by(
        desc("last_active")
    )
    
    results = db.exec(statement).all()
    
    sessions = []
    for row in results:
        # Get the first user message as a title if possible
        first_msg = db.exec(
            select(ChatMessage)
            .where(ChatMessage.session_id == row[0], ChatMessage.role == "user")
            .order_by(ChatMessage.created_at)
        ).first()
        
        title = first_msg.content[:40] + "..." if first_msg else "New Chat"
        
        sessions.append({
            "session_id": row[0],
            "last_active": row[1].isoformat() if row[1] else None,
            "title": title
        })
        
    return {"sessions": sessions}