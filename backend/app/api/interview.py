from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import uuid
import json

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter()

# In-memory session store for interview MVP
interview_sessions: Dict[str, Any] = {}

class InterviewStartRequest(BaseModel):
    role: str
    company: str

class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str

def generate_ai_response(prompt: str, is_json: bool = False):
    """Helper to query Groq (preferred) or Gemini."""
    if settings.GROQ_API_KEY:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        kwargs = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024,
            "temperature": 0.7
        }
        if is_json:
            kwargs["response_format"] = {"type": "json_object"}
            
        completion = client.chat.completions.create(**kwargs)
        return completion.choices[0].message.content
        
    elif settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if is_json:
            if text.startswith("```json"): text = text[7:-3]
            elif text.startswith("```"): text = text[3:-3]
        return text
    else:
        raise HTTPException(500, "No AI API keys configured.")


@router.post("/start")
def start_interview(req: InterviewStartRequest, current_user: User = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    
    prompt = f"You are a technical hiring manager at {req.company} interviewing a candidate for a {req.role} position. Ask the very first interview question. It should be a crisp, challenging behavioral or technical question. Do not include pleasantries, just ask the question."
    
    try:
        question = generate_ai_response(prompt)
        
        interview_sessions[session_id] = {
            "role": req.role,
            "company": req.company,
            "questions_asked": 1,
            "history": [{"role": "ai", "content": question}],
            "user_id": current_user.id
        }
        
        return {"session_id": session_id, "question": question}
    except Exception as e:
        raise HTTPException(500, f"Error starting interview: {str(e)}")


@router.post("/answer")
def answer_interview(req: InterviewAnswerRequest, current_user: User = Depends(get_current_user)):
    session = interview_sessions.get(req.session_id)
    if not session or session["user_id"] != current_user.id:
        raise HTTPException(404, "Interview session not found or expired.")
        
    # Append user answer
    session["history"].append({"role": "user", "content": req.answer})
    
    # Check if we should end the interview (e.g. after 3 questions for MVP)
    if session["questions_asked"] >= 3:
        # Generate final score and feedback
        history_text = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in session["history"]])
        prompt = f"""You are a hiring manager. The interview is over. Evaluate the candidate's answers.
        
Context: Interviewing for {session['role']} at {session['company']}.
Transcript:
{history_text}

Output strictly as a valid JSON object with the following keys:
- "score": A number out of 100 representing overall performance.
- "feedback_summary": A 2-3 sentence overall review.
- "strengths": Array of 2-3 strings highlighting what they did well.
- "improvements": Array of 2-3 strings highlighting areas to improve.

Return ONLY raw JSON."""
        
        try:
            feedback_json_str = generate_ai_response(prompt, is_json=True)
            feedback_data = json.loads(feedback_json_str)
            return {"status": "completed", "feedback": feedback_data}
        except Exception as e:
            # Fallback if AI fails to format
            return {"status": "completed", "feedback": {"score": 75, "feedback_summary": "Good effort but AI failed to parse specific feedback.", "strengths": ["Completed interview"], "improvements": ["Review system error"]}}
            
    # Otherwise, ask the next question
    session["questions_asked"] += 1
    history_text = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in session["history"]])
    
    prompt = f"""You are a technical hiring manager at {session['company']} interviewing for {session['role']}.
This is the transcript so far:
{history_text}

Acknowledge their last answer briefly (1 sentence), and then ask the next technical or behavioral question. Do not break character."""

    try:
        next_question = generate_ai_response(prompt)
        session["history"].append({"role": "ai", "content": next_question})
        return {"status": "in_progress", "question": next_question}
    except Exception as e:
         raise HTTPException(500, f"Error generating next question: {str(e)}")
