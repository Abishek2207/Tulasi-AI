from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Dict, Any, List, Optional
import uuid
import json
from datetime import datetime

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User, ActivityLog, UserProgress
from app.core.database import get_session
from app.core.rate_limit import limiter
from app.api.activity import log_activity_internal
from app.core.ai_router import get_ai_response

router = APIRouter()

# In-memory session store for interview sessions
interview_sessions: Dict[str, dict] = {}

ROLES = [
    "Software Engineer", "AI Engineer", "Data Scientist", "Backend Developer",
    "Frontend Developer", "DevOps Engineer", "Product Manager", "QA Engineer",
    "Cybersecurity Engineer", "Full Stack Developer", "ML Engineer", "Cloud Engineer",
]

INTERVIEW_TYPES = ["Technical", "HR / Behavioral", "System Design", "Coding"]

COMPANIES = [
    "Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft", "Startup",
    "Any Company", "TCS", "Infosys", "Wipro", "Deloitte", "IBM"
]


class InterviewStartRequest(BaseModel):
    role: str
    company: str
    interview_type: str = "Technical"
    num_questions: int = 5


class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str





@router.get("/config")
def get_config():
    return {"roles": ROLES, "interview_types": INTERVIEW_TYPES, "companies": COMPANIES}


@router.post("/start")
@limiter.limit("10/minute")
def start_interview(
    request: Request,
    req: InterviewStartRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    session_id = str(uuid.uuid4())
    num_q = min(max(req.num_questions, 3), 10)  # Clamp between 3-10

    type_instructions = {
        "Technical": "focus on deep domain knowledge, language-specific nuances, and framework expertise",
        "HR / Behavioral": "use STAR method behavioral questions about teamwork, leadership, conflict resolution, and past experiences",
        "System Design": "ask about architecture decisions, scalability tradeoffs, database design, and distributed systems components",
        "Coding": "present a hands-on algorithmic or data structure coding problem and ask the candidate to talk through their solution approach",
    }
    focus = type_instructions.get(req.interview_type, type_instructions["Technical"])
    
    role_instructions = {
        "Frontend Developer": "Specifically ask about React, Next.js, CSS architecture, performance optimization, and browser APIs.",
        "Backend Developer": "Specifically ask about database design, building scalable APIs, caching (Redis), background jobs, and concurrency.",
        "AI Engineer": "Specifically ask about model training workflows, LLMs, Retrieval-Augmented Generation (RAG), deploying ML models, and data pipelines.",
        "ML Engineer": "Specifically ask about model training workflows, LLMs, Retrieval-Augmented Generation (RAG), deploying ML models, and data pipelines.",
        "Full Stack Developer": "Specifically ask about frontend/backend communication, state management, REST/GraphQL design, and deployment pipelines.",
        "DevOps Engineer": "Specifically ask about CI/CD, Kubernetes, Docker, Infrastructure as Code, and monitoring/logging."
    }
    role_focus = role_instructions.get(req.role, "")

    prompt = (
        f"You are a senior {req.interview_type} interviewer at {req.company} hiring for a {req.role} position.\n"
        f"Your questions should {focus}. {role_focus}\n"
        f"Ask the first interview question. Be crisp, professional, and challenging.\n"
        f"Do NOT include pleasantries or conversational filler — just ask the question directly."
    )

    try:
        question = get_ai_response(prompt, force_model="complex_reasoning")
        interview_sessions[session_id] = {
            "role": req.role,
            "company": req.company,
            "interview_type": req.interview_type,
            "num_questions": num_q,
            "questions_asked": 1,
            "history": [{"role": "ai", "content": question}],
            "user_id": current_user.id,
            "started_at": datetime.utcnow().isoformat(),
        }
        return {
            "session_id": session_id,
            "question": question,
            "interview_type": req.interview_type,
            "role": req.role,
            "company": req.company,
            "total_questions": num_q,
            "question_number": 1,
        }
    except Exception as e:
        raise HTTPException(500, f"Error starting interview: {str(e)}")


@router.post("/answer")
@limiter.limit("10/minute")
def answer_interview(
    request: Request,
    req: InterviewAnswerRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    interview_session = interview_sessions.get(req.session_id)
    if not interview_session:
        raise HTTPException(404, "Interview session not found or expired.")
    if interview_session.get("user_id") != current_user.id:
        raise HTTPException(403, "Not authorized for this session.")

    history = interview_session.get("history", [])
    history.append({"role": "user", "content": req.answer})

    num_q = interview_session.get("num_questions", 5)
    questions_asked = int(interview_session.get("questions_asked", 1))

    # Final evaluation
    if questions_asked >= num_q:
        history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])
        prompt = f"""You are an expert interviewer evaluating a {interview_session['interview_type']} interview for {interview_session['role']} at {interview_session['company']}.

Interview Transcript:
{history_text}

Provide structured evaluation as JSON with EXACTLY these keys:
- "score": integer 0-100 
- "grade": one of "Excellent", "Good", "Average", "Needs Improvement"
- "feedback_summary": 2-3 sentence overall review
- "strengths": array of 3 specific strengths observed
- "improvements": array of 3 specific areas to improve
- "recommendation": "Strong Hire" | "Hire" | "No Hire"

Return ONLY valid JSON, no markdown."""

        try:
            fb_str = get_ai_response(prompt, force_model="complex_reasoning")
            import re
            match = re.search(r'\{.*\}', fb_str, re.DOTALL)
            if match:
                feedback = json.loads(match.group())
            else:
                feedback = json.loads(fb_str)
        except Exception:
            feedback = {
                "score": 72,
                "grade": "Good",
                "feedback_summary": "The candidate demonstrated solid fundamentals with room for improvement in depth of responses.",
                "strengths": ["Clear communication", "Structured thinking", "Technical awareness"],
                "improvements": ["Provide more concrete examples", "Dive deeper into edge cases", "Quantify achievements"],
                "recommendation": "Hire"
            }

        # Use centralized activity logging
        log_activity_internal(
            current_user, db, "interview_completed", 
            f"Mock Interview: {interview_session['role']} @ {interview_session['company']} ({interview_session['interview_type']})",
            req.session_id
        )
        db.commit()

        # Get updated count for the return
        completed_count = len(db.exec(
            select(ActivityLog).where(
                ActivityLog.user_id == current_user.id,
                ActivityLog.action_type == "interview_completed"
            )
        ).all())
        TARGET = 10
        pct = min(100, int((completed_count / TARGET) * 100))

        # Clean up session
        interview_sessions.pop(req.session_id, None)

        return {
            "status": "completed",
            "feedback": feedback,
            "interview_count": completed_count,
            "interview_progress_pct": pct,
            "xp_earned": 100,
        }

    # Next question
    interview_session["questions_asked"] = questions_asked + 1
    history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])
    remaining = num_q - questions_asked - 1

    role_instructions = {
        "Frontend Developer": "Focus on React, Next.js, CSS architecture, performance optimization, and browser APIs.",
        "Backend Developer": "Focus on database design, building scalable APIs, caching (Redis), background jobs, and concurrency.",
        "AI Engineer": "Focus on model training workflows, LLMs, Retrieval-Augmented Generation (RAG), deploying ML models, and data pipelines.",
        "ML Engineer": "Focus on model training workflows, LLMs, Retrieval-Augmented Generation (RAG), deploying ML models, and data pipelines.",
        "Full Stack Developer": "Focus on frontend/backend communication, state management, REST/GraphQL design, and deployment pipelines.",
        "DevOps Engineer": "Focus on CI/CD, Kubernetes, Docker, Infrastructure as Code, and monitoring/logging."
    }
    role_focus = role_instructions.get(interview_session.get('role', ''), '')

    prompt = f"""You are a {interview_session['interview_type']} interviewer at {interview_session['company']} for {interview_session['role']}.
{role_focus}
Transcript so far:
{history_text}

Briefly acknowledge their answer (1 brief sentence), then ask the next question.
{f"This is question {questions_asked + 1} of {num_q}." if questions_asked + 1 <= num_q else ""}
Do not break character. Keep it professional."""

    try:
        next_q = get_ai_response(prompt, force_model="complex_reasoning")
        history.append({"role": "ai", "content": next_q})
        return {
            "status": "in_progress",
            "question": next_q,
            "question_number": questions_asked + 1,
            "total_questions": num_q,
            "remaining": remaining,
        }
    except Exception as e:
        raise HTTPException(500, f"Error generating next question: {str(e)}")
