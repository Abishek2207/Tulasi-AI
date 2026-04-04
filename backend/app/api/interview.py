"""
Tulasi AI — RAG-Powered Interview Evaluation Engine
- Per-question real-time evaluation using Gemini Embeddings + Cosine Similarity
- Adaptive difficulty adjustment based on running performance
- Confidence score heuristics (fluency, keyword density)
- Final Job Readiness Score combining all per-question results
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Dict, Any, List, Optional
import uuid
import json
import re
from datetime import datetime

from app.core.config import settings
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog, PersistentInterviewSession
from app.core.database import get_session
from app.core.rate_limit import limiter
from app.api.activity import log_activity_internal
from app.core.ai_router import get_ai_response

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────────────────────────────────────────

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


# ──────────────────────────────────────────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────────────────────────────────────────

class InterviewStartRequest(BaseModel):
    role: str
    company: str
    interview_type: str = "Technical"
    num_questions: int = 5


class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str


# ──────────────────────────────────────────────────────────────────────────────
# RAG EVALUATOR (Lazy Singleton)
# ──────────────────────────────────────────────────────────────────────────────

class _RAGEvaluator:
    """Lightweight in-process RAG evaluator using Gemini embeddings + NumPy cosine similarity."""
    _dataset: List[Dict] = []
    _embeddings = None          # np.ndarray or None
    _ready: bool = False

    def _ensure_loaded(self):
        if self._ready:
            return
        import os, numpy as np
        import google.generativeai as genai

        dataset_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "data", "rag_interview.json"
        )
        if not os.path.exists(dataset_path):
            print("⚠️  [RAG] Dataset not found – evaluation will use AI-only mode.")
            self._ready = True
            return

        with open(dataset_path, "r", encoding="utf-8") as f:
            self._dataset = json.load(f)

        if not self._dataset or not settings.effective_gemini_key:
            self._ready = True
            return

        import google.generativeai as genai
        genai.configure(api_key=settings.effective_gemini_key)
        texts = [
            f"Question: {item.get('question', '')}\nIdeal Answer: {item.get('ideal_answer', '')}"
            for item in self._dataset
        ]
        try:
            result = genai.embed_content(model="models/gemini-embedding-001", content=texts, task_type="retrieval_document")
            self._embeddings = np.array(result['embedding'])
            print(f"✅ [RAG] Pre-embedded {len(self._dataset)} QA pairs.")
        except Exception as e:
            print(f"❌ [RAG] Embedding failed: {e}")
        self._ready = True

    def retrieve_top_k(self, query: str, k: int = 3) -> List[Dict]:
        self._ensure_loaded()
        if self._embeddings is None or not self._dataset:
            return []
        try:
            import numpy as np
            import google.generativeai as genai
            
            if settings.effective_gemini_key:
                genai.configure(api_key=settings.effective_gemini_key)
                res = genai.embed_content(model="models/gemini-embedding-001", content=query, task_type="retrieval_query")
                q_emb = np.array(res['embedding'])
            else:
                return []
            norms = np.linalg.norm(self._embeddings, axis=1) * np.linalg.norm(q_emb)
            norms = np.where(norms == 0, 1e-9, norms)
            sims = np.dot(self._embeddings, q_emb) / norms
            top_idx = np.argsort(sims)[::-1][:k]
            return [self._dataset[i] for i in top_idx]
        except Exception as e:
            print(f"❌ [RAG] Retrieval error: {e}")
            return []


_rag = _RAGEvaluator()


# ──────────────────────────────────────────────────────────────────────────────
# HELPER — Confidence score heuristic
# ──────────────────────────────────────────────────────────────────────────────

def _compute_confidence_score(answer: str, keywords: List[str]) -> int:
    """
    Heuristic confidence score based on:
      • Answer length (depth indicator)
      • Sentence structure diversity
      • Keyword presence (technical accuracy)
    Returns 1–10.
    """
    words = answer.split()
    word_count = len(words)

    # Length score (0-4)
    if word_count >= 150:
        length_score = 4
    elif word_count >= 80:
        length_score = 3
    elif word_count >= 40:
        length_score = 2
    elif word_count >= 10:
        length_score = 1
    else:
        length_score = 0

    # Sentence structure score (0-3): penalise very short flat sentences
    sentences = [s.strip() for s in re.split(r'[.!?]', answer) if s.strip()]
    avg_words_per_sentence = word_count / max(len(sentences), 1)
    structure_score = 3 if avg_words_per_sentence >= 12 else (2 if avg_words_per_sentence >= 7 else 1)

    # Keyword match score (0-3)
    lower_answer = answer.lower()
    matched = sum(1 for kw in keywords if kw.lower() in lower_answer)
    kw_score = min(3, matched)

    raw = length_score + structure_score + kw_score
    return max(1, min(10, raw))


# ──────────────────────────────────────────────────────────────────────────────
# HELPER — Per-question RAG evaluation
# ──────────────────────────────────────────────────────────────────────────────

def _evaluate_answer_with_rag(
    question: str,
    answer: str,
    role: str,
    interview_type: str,
    difficulty: int,
) -> Dict[str, Any]:
    """
    Retrieve top-3 similar ideal answers, build an anchor prompt, 
    call Gemini for structured evaluation, return parsed dict.
    """
    top_examples = _rag.retrieve_top_k(f"Q: {question}\nA: {answer}", k=3)

    # Build keyword list from retrieved examples
    all_keywords: List[str] = []
    for ex in top_examples:
        all_keywords.extend(ex.get("keywords", []))

    confidence = _compute_confidence_score(answer, all_keywords)

    # Build RAG-anchored prompt
    examples_text = ""
    for i, ex in enumerate(top_examples, 1):
        examples_text += (
            f"\n--- Reference Example {i} ---\n"
            f"Question: {ex.get('question', '')}\n"
            f"Ideal Answer: {ex.get('ideal_answer', '')}\n"
            f"Poor Answer: {ex.get('poor_answer', '')}\n"
            f"Key Concepts: {', '.join(ex.get('keywords', []))}\n"
        )

    prompt = f"""You are an expert {interview_type} interviewer at a top tech company hiring for {role}.
Current interview difficulty is {difficulty}/10.

You have access to these retrieved reference examples to anchor your evaluation:
{examples_text or "(No reference examples available — use your expert knowledge)"}

Evaluate this candidate response:
QUESTION: {question}
CANDIDATE ANSWER: {answer}

Provide a structured evaluation. Return ONLY valid JSON with EXACTLY these keys:
{{
  "score": <integer 1-10>,
  "clarity": <integer 1-10>,
  "relevance": <integer 1-10>,
  "structure": <integer 1-10>,
  "depth": <integer 1-10>,
  "strengths": [<2-3 specific strength strings>],
  "weaknesses": [<2-3 specific weakness strings>],
  "missing_keywords": [<2-4 key concepts the candidate should have mentioned>],
  "improvement_tip": "<one actionable improvement sentence>",
  "improved_answer": "<a complete, perfect example answer to the question based on reference examples>",
  "summary": "<2 sentence overall evaluation>"
}}

Be precise and specific. Base all feedback on the reference examples above. No generic statements."""

    try:
        raw = get_ai_response(prompt)
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        result = json.loads(match.group() if match else raw)
    except Exception as e:
        print(f"❌ [RAG Eval] Parse failed: {e}")
        result = {
            "score": 5, "clarity": 5, "relevance": 5, "structure": 5, "depth": 5,
            "strengths": ["Attempted the question", "Showed some understanding"],
            "weaknesses": ["Response lacked depth", "Missing technical specifics"],
            "missing_keywords": all_keywords[:3],
            "improvement_tip": "Study the core concepts more deeply and use structured answer formats.",
            "improved_answer": "A truly strong answer would provide deep technical specifics and structured formatting.",
            "summary": "The candidate provided a partial answer. More depth and technical specificity is needed."
        }

    # Inject our heuristic confidence score
    result["confidence_score"] = confidence
    return result


# ──────────────────────────────────────────────────────────────────────────────
# HELPER — Adaptive difficulty
# ──────────────────────────────────────────────────────────────────────────────

def _adapt_difficulty(current: int, score: int) -> int:
    if score >= 8:
        return min(10, current + 1)
    elif score <= 4:
        return max(1, current - 1)
    return current


# ──────────────────────────────────────────────────────────────────────────────
# HELPER — Compute final job readiness
# ──────────────────────────────────────────────────────────────────────────────

def _compute_job_readiness(scores_dict: Dict) -> Dict:
    """Aggregate per-question scores into a final job readiness report."""
    if not scores_dict:
        return {"job_readiness_score": 50, "grade": "Average", "recommendation": "Hire"}

    all_scores = list(scores_dict.values())
    avg_score = sum(s.get("score", 5) for s in all_scores) / len(all_scores)
    avg_confidence = sum(s.get("confidence_score", 5) for s in all_scores) / len(all_scores)
    avg_depth = sum(s.get("depth", 5) for s in all_scores) / len(all_scores)

    # Weighted composite: 50% score, 30% depth, 20% confidence
    composite = (avg_score * 0.5 + avg_depth * 0.3 + avg_confidence * 0.2)
    job_readiness = round(composite * 10)  # Scale 0-100

    grade = (
        "Excellent" if job_readiness >= 85 else
        "Good" if job_readiness >= 70 else
        "Average" if job_readiness >= 55 else
        "Needs Improvement"
    )
    recommendation = (
        "Strong Hire" if job_readiness >= 85 else
        "Hire" if job_readiness >= 65 else
        "No Hire"
    )

    return {
        "job_readiness_score": job_readiness,
        "avg_score": round(avg_score, 1),
        "avg_confidence": round(avg_confidence, 1),
        "avg_depth": round(avg_depth, 1),
        "grade": grade,
        "recommendation": recommendation,
    }


# ──────────────────────────────────────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/config")
def get_config():
    return {"roles": ROLES, "interview_types": INTERVIEW_TYPES, "companies": COMPANIES}


@router.post("/start")
@limiter.limit("10/minute")
def start_interview(
    request: Request,
    req: InterviewStartRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    session_id = str(uuid.uuid4())
    num_q = min(max(req.num_questions, 3), 10)

    type_instructions = {
        "Technical": "focus on deep domain knowledge, language-specific nuances, and framework expertise",
        "HR / Behavioral": "use STAR method behavioral questions about teamwork, leadership, conflict resolution",
        "System Design": "ask about architecture decisions, scalability tradeoffs, and database design",
        "Coding": "present an algorithmic or data structure problem and ask for the solution approach",
    }
    role_instructions = {
        "Frontend Developer": "Ask about React, Next.js, CSS architecture, performance optimization.",
        "Backend Developer": "Ask about database design, APIs, caching (Redis), and concurrency.",
        "AI Engineer": "Ask about LLMs, RAG, model deployment, and data pipelines.",
        "ML Engineer": "Ask about model training, evaluation metrics, and ML system design.",
        "Full Stack Developer": "Ask about frontend/backend integration, state management, and REST/GraphQL.",
        "DevOps Engineer": "Ask about CI/CD, Kubernetes, Docker, and Infrastructure as Code.",
    }

    focus = type_instructions.get(req.interview_type, type_instructions["Technical"])
    role_focus = role_instructions.get(req.role, "")

    prompt = (
        f"You are a senior {req.interview_type} interviewer at {req.company} hiring for a {req.role} position.\n"
        f"Your questions should {focus}. {role_focus}\n"
        f"Ask the FIRST interview question. Be crisp, professional, and challenging.\n"
        f"Do NOT include pleasantries — just ask the question directly."
    )

    try:
        raw_question = get_ai_response(prompt)
        question = raw_question
    except Exception as fallback_e:
        print(f"⚠️ [Interview Start Fallback] AI Error: {fallback_e}")
        question = f"Let's begin the interview. Can you walk me through a complex {req.interview_type.lower()} problem you've solved recently relevant to a {req.role} role, and how you approached it?"

    try:
        session_obj = PersistentInterviewSession(
            session_id=session_id,
            user_id=current_user.id,
            role=req.role,
            company=req.company,
            interview_type=req.interview_type,
            num_questions=num_q,
            questions_asked=1,
            history_json=json.dumps([{"role": "ai", "content": question}]),
            scores_json="{}",
            current_difficulty=5,
            status="in_progress",
        )
        db.add(session_obj)
        db.commit()

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
        db.rollback()
        raise HTTPException(500, f"Database Error starting interview: {str(e)}")


@router.post("/answer")
@limiter.limit("15/minute")
def answer_interview(
    request: Request,
    req: InterviewAnswerRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(PersistentInterviewSession).where(
        PersistentInterviewSession.session_id == req.session_id,
        PersistentInterviewSession.user_id == current_user.id,
    )
    interview_session = db.exec(query).first()

    if not interview_session:
        raise HTTPException(404, "Interview session not found or expired.")
    if interview_session.status == "completed":
        return {"status": "completed", "feedback": json.loads(interview_session.feedback_json or "{}")}

    history: List[Dict] = json.loads(interview_session.history_json)
    scores: Dict = json.loads(interview_session.scores_json or "{}")

    # Get the last AI question
    last_question = next(
        (m["content"] for m in reversed(history) if m["role"] == "ai"), "Interview question"
    )

    history.append({"role": "user", "content": req.answer})

    num_q = interview_session.num_questions
    questions_asked = interview_session.questions_asked
    current_difficulty = interview_session.current_difficulty

    # ── 🧠 RAG EVALUATION ──────────────────────────────────────────────────────
    eval_result = _evaluate_answer_with_rag(
        question=last_question,
        answer=req.answer,
        role=interview_session.role,
        interview_type=interview_session.interview_type,
        difficulty=current_difficulty,
    )

    # Store the per-question score
    scores[str(questions_asked)] = eval_result

    # Adapt difficulty for next question
    new_difficulty = _adapt_difficulty(current_difficulty, eval_result.get("score", 5))
    interview_session.current_difficulty = new_difficulty

    history_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])

    # ── FINAL QUESTION → produce final evaluation ──────────────────────────────
    if questions_asked >= num_q:
        readiness = _compute_job_readiness(scores)

        # Generate a comprehensive final feedback from Gemini
        final_prompt = f"""You are an expert {interview_session.interview_type} interviewer at {interview_session.company} evaluating a {interview_session.role} candidate.

Interview Transcript:
{history_text}

Individual Question Scores: {json.dumps({k: v.get('score', 5) for k, v in scores.items()})}
Average Score: {readiness['avg_score']}/10
Job Readiness: {readiness['job_readiness_score']}/100

Provide the final evaluation as JSON with EXACTLY these keys:
{{
  "score": {readiness['job_readiness_score']},
  "grade": "{readiness['grade']}",
  "feedback_summary": "<3 sentence overall evaluation>",
  "strengths": [<3 specific career-level strengths>],
  "improvements": [<3 specific improvements>],
  "recommendation": "{readiness['recommendation']}"
}}

Return ONLY valid JSON, no markdown."""

        try:
            fb_str = get_ai_response(final_prompt)
            match = re.search(r'\{.*\}', fb_str, re.DOTALL)
            feedback = json.loads(match.group() if match else fb_str)
        except Exception:
            feedback = {
                "score": readiness["job_readiness_score"],
                "grade": readiness["grade"],
                "feedback_summary": "The candidate demonstrated solid understanding across multiple domains.",
                "strengths": ["Technical awareness", "Clear communication", "Structured thinking"],
                "improvements": ["Deepen domain expertise", "Provide concrete examples", "Quantify impact"],
                "recommendation": readiness["recommendation"],
            }

        # Merge job readiness metrics into final feedback
        feedback.update(readiness)
        feedback["per_question_scores"] = scores

        interview_session.status = "completed"
        interview_session.feedback_json = json.dumps(feedback)
        interview_session.history_json = json.dumps(history)
        interview_session.scores_json = json.dumps(scores)
        interview_session.updated_at = datetime.utcnow()
        db.add(interview_session)

        log_activity_internal(
            current_user, db, "interview_completed",
            f"Mock Interview: {interview_session.role} @ {interview_session.company} ({interview_session.interview_type})",
            req.session_id,
        )
        db.commit()

        # 📧 Send interview result notification
        import threading
        from app.services.email import email_service
        threading.Thread(
            target=email_service.send_interview_complete_email,
            args=(
                current_user.email,
                current_user.name or "Engineer",
                interview_session.role,
                feedback.get("job_readiness_score", readiness["job_readiness_score"]),
                feedback.get("grade", readiness["grade"]),
            ),
            daemon=True
        ).start()

        completed_count = len(db.exec(
            select(ActivityLog).where(
                ActivityLog.user_id == current_user.id,
                ActivityLog.action_type == "interview_completed",
            )
        ).all())
        TARGET = 10
        pct = min(100, int((completed_count / TARGET) * 100))

        return {
            "status": "completed",
            "eval": eval_result,          # Final question evaluation
            "feedback": feedback,
            "interview_count": completed_count,
            "interview_progress_pct": pct,
            "xp_earned": 100,
        }

    # ── NOT YET FINAL → ask next adaptive question ─────────────────────────────
    interview_session.questions_asked = questions_asked + 1
    interview_session.scores_json = json.dumps(scores)
    interview_session.history_json = json.dumps(history)

    difficulty_instruction = (
        "Ask a more challenging, advanced question."
        if new_difficulty > current_difficulty
        else "Ask a clearer, more guided question to help the candidate."
        if new_difficulty < current_difficulty
        else "Continue at the same difficulty level."
    )

    role_instructions = {
        "Frontend Developer": "Focus on React, Next.js, CSS architecture, performance.",
        "Backend Developer": "Focus on database design, APIs, caching, and concurrency.",
        "AI Engineer": "Focus on LLMs, RAG, model deployment, data pipelines.",
        "ML Engineer": "Focus on model training, evaluation, and ML system design.",
        "Full Stack Developer": "Focus on frontend/backend integration, state management, REST/GraphQL.",
        "DevOps Engineer": "Focus on CI/CD, Kubernetes, Docker, and Infrastructure as Code.",
    }
    role_focus = role_instructions.get(interview_session.role, "")

    next_q_prompt = f"""You are a {interview_session.interview_type} interviewer at {interview_session.company} for {interview_session.role}.
{role_focus}

Difficulty level: {new_difficulty}/10. {difficulty_instruction}

Transcript so far:
{history_text}

Briefly acknowledge their last answer (1 short sentence), then ask question {interview_session.questions_asked} of {num_q}.
Do not break character. Keep it professional. Do not repeat previous questions."""

    try:
        raw_next = get_ai_response(next_q_prompt)
        next_q = raw_next
    except Exception as fallback_e:
        print(f"⚠️ [Interview Next Fallback] AI Error: {fallback_e}")
        next_q = "Understood, that's a valid approach. Moving forward, could you discuss how you would ensure this implementation scales efficiently under heavy load, taking into account potential bottlenecks?"

    try:
        history.append({"role": "ai", "content": next_q})

        interview_session.history_json = json.dumps(history)
        interview_session.updated_at = datetime.utcnow()
        db.add(interview_session)
        db.commit()

        return {
            "status": "in_progress",
            "eval": eval_result,           # Per-question feedback
            "question": next_q,
            "question_number": interview_session.questions_asked,
            "total_questions": num_q,
            "remaining": num_q - interview_session.questions_asked,
            "difficulty": new_difficulty,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Database Error saving next question: {str(e)}")
