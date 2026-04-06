"""
Tulasi AI — Streaming Chat Router
Adds a SSE streaming endpoint and AI tools mode routing (Chat / Resume / Interview / Cover Letter)
"""
import re
import uuid
import json
import time
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select, func, desc

from app.core.ai_router import get_ai_response, GOOGLE_API_KEY, FALLBACK_MODELS
from app.models.models import ChatMessage, User, UserFeedback
from app.core.database import get_session
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.vector_service import vector_service


router = APIRouter()

# ── Tool-specific system prompts ───────────────────────────────────────────────
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
        "database choices, caching, APIs, and microservices. Ask clarifying questions regarding constraints before proposing architectures. "
        "Always use diagrams described in markdown, trade-off tables, and reference real-world systems (Twitter, Netflix, Uber, etc.)."
    ),
    "career_strategy": (
        "You are an Elite Career Strategist. Provide extremely calculated, personalized, step-by-step career blueprints. "
        "Focus on high-ROI skills, networking tactics, interview prep strategies, and project building that will maximize "
        "the user's chances of getting into heavily competitive roles like AI Engineer or AI Research Scientist at a top FAANG company."
    ),
}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    image_base64: Optional[str] = None
    tool: Optional[str] = "chat"


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
def chat(
    request: Request,
    req: ChatRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    session_id = req.session_id or str(uuid.uuid4())
    tool = req.tool or "chat"

    # Fetch history
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
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

    # Enforce Daily Limitations
    today = date.today().isoformat()
    if user.last_reset_date != today:
        user.chats_today = 0
        user.last_reset_date = today

    user.chats_today += 1
    db.add(user)

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])

    # ── Safety Triage (single, non-duplicated block) ──────────────────────────
    try:
        safety_prompt = (
            f"Evaluate this message for policy violations (PII leaks, extreme toxicity, illegal acts). "
            f"Message: \"{req.message}\"\n"
            f"Return JSON: {{\"is_safe\": true/false, \"reason\": \"short reason if unsafe\"}}"
        )
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_match = re.search(r"\{.*\}", safety_res, re.DOTALL)
        if safety_match:
            safety_data = json.loads(safety_match.group())
            if not safety_data.get("is_safe", True):
                abuse_count = (getattr(user, "abuse_count", 0) or 0) + 1
                user.abuse_count = abuse_count
                db.add(user)
                db.commit()
                return ChatResponse(
                    response=f"⚠️ **Safety Alert ({abuse_count}/5):** {safety_data.get('reason', 'Policy violation detected.')}",
                    session_id=session_id,
                    ai_model="tulasi-safety",
                )
    except Exception:
        pass  # If safety check itself fails, allow through

    # ── RAG Memory Retrieval ──────────────────────────────────────────────────
    rag_context = ""
    try:
        rag_context = vector_service.retrieve_context(user.id, req.message, db)
    except Exception as rag_err:
        print(f"⚠️ RAG retrieval failed: {rag_err}")

    context_str = f"\n[Previous Context & Memory:\n{rag_context}\n]" if rag_context else ""

    # ── User Intelligence Context ─────────────────────────────────────────────
    intelligence = json.loads(user.user_intelligence_profile or "{}")
    is_founder = bool(user.email and user.email.lower() == "abishekramamoorthy22@gmail.com")

    founder_context = (
        "FOUNDER_PROTOCOL ACTIVE: You are speaking with Abishek R, the Founder and CEO of Tulasi AI. "
        "Provide elite-level, absolute-fidelity technical insights and assist him in scaling this platform. "
        if is_founder else ""
    )

    awareness = (
        f"You are operating in the year 2026. The Founder and CEO of Tulasi AI is Abishek R. "
        f"{founder_context}"
        f"USER DEMOGRAPHIC: [Type: {user.user_type}, Dept: {user.department or 'N/A'}, "
        f"Role Target: {user.target_role or 'Software Engineer'}, Interests: {user.interest_areas or 'General Tech'}, "
        f"Level: {user.level}]. "
        f"INTELLIGENCE PROFILE: {json.dumps(intelligence)}. "
        f"THINKING PROTOCOL: ALWAYS think deeply and internally before you respond."
    )

    system_instruction = f"{system_prompt}. {awareness}{context_str}"

    # ── Generate AI Response via Reasoning Engine ─────────────────────────────
    response_text = ""
    try:
        from app.services.ai_agents.reasoning import reasoning_engine
        reasoning_res = reasoning_engine.process_query(
            req.message, user, history, db, system_instruction=system_instruction
        )
        response_text = reasoning_res.get("response", "")
    except Exception as e:
        print(f"❌ Chat Error: {e}")

    # Final safety net — use direct AI if reasoning engine failed
    if not response_text or len(response_text) < 10:
        try:
            response_text = get_ai_response(
                req.message,
                history=history,
                system_instruction=system_instruction,
            )
        except Exception as e2:
            print(f"❌ Direct AI fallback failed: {e2}")
            response_text = _get_inline_fallback(req.message, tool)

    # ── Persist messages ──────────────────────────────────────────────────────
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=response_text))

    # Update long-term intelligence
    try:
        vector_service.update_user_intelligence(
            user.id, f"User: {req.message}\nAI: {response_text}", db
        )
    except Exception as ie:
        print(f"⚠️ Intelligence update failed: {ie}")

    db.commit()

    # Award XP
    try:
        from app.api.activity import log_activity_internal
        log_activity_internal(user, db, "message_sent", "Chatting with Tulasi AI", None)
        db.commit()
    except Exception as ae:
        print(f"⚠️ Activity logging failed: {ae}")

    return ChatResponse(response=response_text, session_id=session_id, ai_model="tulasi-ai")


@router.post("/stream")
@limiter.limit("20/minute")
def chat_stream(
    request: Request,
    req: ChatRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Server-Sent Events streaming endpoint."""
    session_id = req.session_id or str(uuid.uuid4())
    tool = req.tool or "chat"

    # Fetch history
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    db_messages = db.exec(statement).all()
    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # Reset daily limit
    today = date.today().isoformat()
    if user.last_reset_date != today:
        user.chats_today = 0
        user.last_reset_date = today
        db.add(user)
        db.commit()

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])

    # ── Safety Triage (stream) ────────────────────────────────────────────────
    try:
        safety_prompt = (
            f"Evaluate safety of: '{req.message}'. "
            "Return {\"is_safe\": bool, \"reason\": string}"
        )
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_match = re.search(r"\{.*\}", safety_res, re.DOTALL)
        if safety_match:
            safety_data = json.loads(safety_match.group())
            if not safety_data.get("is_safe", True):
                user.abuse_count = (getattr(user, "abuse_count", 0) or 0) + 1
                db.add(user)
                db.commit()
                warning_msg = f"⚠️ **Safety Alert ({user.abuse_count}/5):** {safety_data.get('reason')}"
                return StreamingResponse(
                    iter([
                        f"data: {json.dumps({'token': warning_msg, 'session_id': session_id, 'done': True})}\n\n"
                    ]),
                    media_type="text/event-stream",
                )
    except Exception:
        pass

    # ── RAG Context ───────────────────────────────────────────────────────────
    rag_context = ""
    try:
        rag_context = vector_service.retrieve_context(user.id, req.message, db)
    except Exception:
        pass

    context_str = f"\n[Previous Context & Memory:\n{rag_context}\n]" if rag_context else ""

    intelligence = json.loads(user.user_intelligence_profile or "{}")
    is_founder = bool(user.email and user.email.lower() == "abishekramamoorthy22@gmail.com")
    founder_context = (
        "FOUNDER_PROTOCOL ACTIVE: Speak directly with Abishek R (Founder & CEO of Tulasi AI). Elite mode active. "
        if is_founder else ""
    )
    awareness = (
        f"Year: 2026. Founder: Abishek R. {founder_context}"
        f"USER: [Type: {user.user_type}, Dept: {user.department or 'N/A'}, "
        f"Target: {user.target_role or 'Software Engineer'}, Level: {user.level}]. "
        f"PROFILE: {json.dumps(intelligence)}{context_str}"
    )
    system_instruction = f"{system_prompt}. {awareness}"

    def generate():
        full_response = ""
        try:
            from app.services.ai_agents.reasoning import reasoning_engine
            stream_gen = reasoning_engine.process_query(
                req.message, user, history, db, stream=True, system_instruction=system_instruction
            )

            for token in stream_gen:
                if token:
                    full_response += token
                    data = json.dumps({
                        "token": token,
                        "session_id": session_id,
                        "done": False,
                    })
                    yield f"data: {data}\n\n"

            # If reasoning engine returned nothing, try direct AI
            if not full_response or len(full_response) < 10:
                direct = get_ai_response(req.message, history=history, system_instruction=system_instruction)
                full_response = direct
                yield f"data: {json.dumps({'token': direct, 'session_id': session_id, 'done': False})}\n\n"

        except Exception as e:
            print(f"❌ [Stream] Error: {e}")
            fallback = _get_inline_fallback(req.message, tool)
            full_response = fallback
            yield f"data: {json.dumps({'token': fallback, 'session_id': session_id, 'done': False})}\n\n"

        # Always send done signal
        yield f"data: {json.dumps({'token': '', 'session_id': session_id, 'done': True})}\n\n"

        # Persist to DB with a fresh session
        try:
            from app.core.database import engine
            from sqlmodel import Session as SyncSession
            with SyncSession(engine) as _db:
                db_user = _db.get(User, user.id)
                if db_user:
                    db_user.chats_today = (db_user.chats_today or 0) + 1
                    _db.add(db_user)
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=full_response))
                vector_service.update_user_intelligence(
                    user.id, f"User: {req.message}\nAssistant: {full_response}", _db
                )
                _db.commit()
        except Exception as persist_err:
            print(f"⚠️ Stream DB persist failed: {persist_err}")

        # XP award
        try:
            from app.api.activity import log_activity_internal
            action = "roadmap_generated" if tool != "chat" else "message_sent"
            log_activity_internal(user, db, action, f"{tool.capitalize()} interaction", None)
            db.commit()
        except Exception as xp_err:
            print(f"⚠️ XP award failed: {xp_err}")

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def _get_inline_fallback(message: str, tool: str) -> str:
    """Returns a smart inline fallback when all AI is unavailable."""
    msg = message.lower()
    if tool == "system_design" or any(k in msg for k in ["design", "architecture", "scale"]):
        return (
            "### 🏗️ System Design Framework\n\n"
            "**Step 1 — Requirements Gathering**\n- Functional vs Non-functional requirements\n- Estimate scale: DAU, QPS, storage\n\n"
            "**Step 2 — High Level Architecture**\n- Client → Load Balancer → API Servers → Cache (Redis) → Database\n\n"
            "**Step 3 — Component Deep Dive**\n- DB: SQL for ACID, NoSQL for scale\n- Cache: LRU eviction, write-through vs write-back\n- Queue: Kafka for async, high-throughput\n\n"
            "> ⚡ Full AI mentor temporarily at capacity. Retry in 30s for a personalized deep-dive."
        )
    elif tool == "interview" or "interview" in msg:
        return (
            "### 🎤 Mock Interview — Let's Begin\n\n"
            "**Question 1 (Technical):**\n> *What is the time complexity of QuickSort in the average vs worst case? How would you avoid the worst case?*\n\n"
            "Take your time. Structure your answer: define the algorithm → analyze → propose optimization.\n\n"
            "> ⚡ AI interviewer restarting. Your question is live!"
        )
    else:
        return (
            "### 🤖 Tulasi AI — Temporarily Recalibrating\n\n"
            "I'm momentarily at capacity, but I'm still here for you!\n\n"
            "**Quick Actions while I restart:**\n"
            "- 🧩 Try a **Coding Problem** in the Code Arena\n"
            "- 🗂️ Review your **Flashcards**\n"
            "- 📋 Check your **Daily Challenge**\n\n"
            "> ⚡ Please retry your question in 30 seconds for a full AI response."
        )


@router.post("/feedback")
def submit_feedback(
    req: FeedbackRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Store 👍/👎 feedback for AI fine-tuning."""
    fb = UserFeedback(user_id=user.id, message_id=req.message_id, rating=req.rating)
    db.add(fb)
    db.commit()
    return {"status": "ok", "message": "Feedback recorded. Thank you!"}


@router.get("/history/{session_id}")
def get_history(session_id: str, db: Session = Depends(get_session)):
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    db_messages = db.exec(statement).all()
    return {
        "messages": [{"role": m.role, "content": m.content} for m in db_messages],
        "session_id": session_id,
    }


@router.delete("/history/{session_id}")
def clear_history(session_id: str, db: Session = Depends(get_session)):
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id)
    for m in db.exec(statement).all():
        db.delete(m)
    db.commit()
    return {"message": "Cleared"}


@router.get("/sessions")
def get_user_sessions(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """List all unique session IDs with their last message snippets."""
    statement = (
        select(
            ChatMessage.session_id,
            func.max(ChatMessage.created_at).label("last_active"),
        )
        .where(ChatMessage.user_id == user.id)
        .group_by(ChatMessage.session_id)
        .order_by(desc("last_active"))
    )
    results = db.exec(statement).all()

    sessions = []
    for row in results:
        first_msg = db.exec(
            select(ChatMessage)
            .where(ChatMessage.session_id == row[0], ChatMessage.role == "user")
            .order_by(ChatMessage.created_at)
        ).first()
        title = (first_msg.content[:40] + "...") if first_msg else "New Chat"
        sessions.append({
            "session_id": row[0],
            "last_active": row[1].isoformat() if row[1] else None,
            "title": title,
        })

    return {"sessions": sessions}