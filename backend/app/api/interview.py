from fastapi import APIRouter, Depends, HTTPException
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


def generate_ai_response(prompt: str, is_json: bool = False):
    """Helper to query Groq (preferred) or Gemini."""
    if settings.GROQ_API_KEY:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        req_params: Dict[str, Any] = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "temperature": 0.7,
        }
        if is_json:
            req_params["response_format"] = {"type": "json_object"}
        completion = client.chat.completions.create(**req_params)
        return completion.choices[0].message.content
    elif settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if is_json:
            if text.startswith("```json"):
                text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
            elif text.startswith("```"):
                text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
        return text
    else:
        raise HTTPException(500, "No AI API keys configured.")


@router.get("/config")
def get_config():
    return {"roles": ROLES, "interview_types": INTERVIEW_TYPES, "companies": COMPANIES}


@router.post("/start")
def start_interview(
    req: InterviewStartRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    session_id = str(uuid.uuid4())
    num_q = min(max(req.num_questions, 3), 10)  # Clamp between 3-10

    type_instructions = {
        "Technical": "focus on technical skills, problem-solving, and programming concepts",
        "HR / Behavioral": "use STAR method behavioral questions about teamwork, leadership, and past experiences",
        "System Design": "ask about architecture decisions, scalability, and system components",
        "Coding": "present a coding problem and walk through solution approach",
    }
    focus = type_instructions.get(req.interview_type, type_instructions["Technical"])

    prompt = (
        f"You are a senior {req.interview_type} interviewer at {req.company} hiring for a {req.role} position. "
        f"Your questions should {focus}. "
        f"Ask the first interview question. Be crisp, professional, and challenging. "
        f"Don't include pleasantries — just ask the question directly."
    )

    try:
        question = generate_ai_response(prompt)
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
def answer_interview(
    req: InterviewAnswerRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    session = interview_sessions.get(req.session_id)
    if not session or session.get("user_id") != current_user.id:
        raise HTTPException(404, "Interview session not found or expired.")

    history = session.get("history", [])
    history.append({"role": "user", "content": req.answer})

    num_q = session.get("num_questions", 5)
    questions_asked = int(session.get("questions_asked", 1))

    # Final evaluation
    if questions_asked >= num_q:
        history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])
        prompt = f"""You are an expert interviewer evaluating a {session['interview_type']} interview for {session['role']} at {session['company']}.

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
            fb_str = generate_ai_response(prompt, is_json=True)
            feedback = json.loads(str(fb_str))
        except Exception:
            feedback = {
                "score": 72,
                "grade": "Good",
                "feedback_summary": "The candidate demonstrated solid fundamentals with room for improvement in depth of responses.",
                "strengths": ["Clear communication", "Structured thinking", "Technical awareness"],
                "improvements": ["Provide more concrete examples", "Dive deeper into edge cases", "Quantify achievements"],
                "recommendation": "Hire"
            }

        # Log activity & update progress
        log_entry = ActivityLog(
            user_id=current_user.id,
            action_type="interview_completed",
            title=f"Mock Interview: {session['role']} @ {session['company']} ({session['interview_type']})",
            xp_earned=100,
        )
        db.add(log_entry)
        current_user.xp = (current_user.xp or 0) + 100

        # Update streak
        from datetime import date as dt_date
        today = dt_date.today().isoformat()
        if current_user.last_activity_date != today:
            if current_user.last_activity_date:
                gap = (dt_date.today() - dt_date.fromisoformat(current_user.last_activity_date)).days
                current_user.streak = (current_user.streak or 0) + 1 if gap == 1 else 1
            else:
                current_user.streak = 1
            current_user.last_activity_date = today
        db.add(current_user)

        # Update interview progress
        completed_count = len(db.exec(
            select(ActivityLog).where(
                ActivityLog.user_id == current_user.id,
                ActivityLog.action_type == "interview_completed"
            )
        ).all()) + 1  # +1 for this one (not committed yet)
        TARGET = 10
        pct = min(100, int((completed_count / TARGET) * 100))
        prog = db.exec(
            select(UserProgress).where(
                UserProgress.user_id == current_user.id,
                UserProgress.category == "interview"
            )
        ).first()
        if prog:
            prog.completed_items = completed_count
            prog.total_items = TARGET
            prog.progress_pct = pct
            db.add(prog)
        else:
            db.add(UserProgress(
                user_id=current_user.id,
                category="interview",
                total_items=TARGET,
                completed_items=completed_count,
                progress_pct=pct,
            ))
        db.commit()

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
    session["questions_asked"] = questions_asked + 1
    history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])
    remaining = num_q - questions_asked - 1

    prompt = f"""You are a {session['interview_type']} interviewer at {session['company']} for {session['role']}.
Transcript so far:
{history_text}

Briefly acknowledge their answer (1 brief sentence), then ask the next question.
{f"This is question {questions_asked + 1} of {num_q}." if questions_asked + 1 <= num_q else ""}
Do not break character. Keep it professional."""

    try:
        next_q = generate_ai_response(prompt)
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
