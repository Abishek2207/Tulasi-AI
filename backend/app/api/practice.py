import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_session
from app.api.auth import get_current_user
from app.models.models import User, Question, QuestionAttempt, LearningMemory, CareerIntelligenceRoadmap
from app.core.ai_client import ai_client

router = APIRouter()

class AnswerRequest(BaseModel):
    question_id: int
    user_answer: str

class PracticeResponse(BaseModel):
    question: Question
    memory: Optional[LearningMemory]

@router.get("/next-question", response_model=PracticeResponse)
def get_next_question(
    topic: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # 1. Determine the topic if none provided
    if not topic:
        roadmap = session.exec(select(CareerIntelligenceRoadmap).where(CareerIntelligenceRoadmap.user_id == current_user.id)).first()
        if roadmap:
            try:
                data = json.loads(roadmap.roadmap_data)
                topic = data.get("current_focus") or "System Design"
            except:
                topic = "System Design"
        else:
            topic = "System Design"

    # 2. Get Learning Memory for this topic
    memory = session.exec(select(LearningMemory).where(
        LearningMemory.user_id == current_user.id,
        LearningMemory.topic == topic
    )).first()

    if not memory:
        memory = LearningMemory(user_id=current_user.id, topic=topic, mastery_level=1)
        session.add(memory)
        session.commit()
        session.refresh(memory)

    # 3. Generate Question using AI based on mastery level
    prompt = f"""
    You are an AI interviewer and tutor. Generate a single technical interview or practice question about the topic: "{topic}".
    The student's current mastery level is {memory.mastery_level} out of 5 (1=beginner, 5=expert).
    Tailor the difficulty strictly to this level.
    If the level is 1 or 2, ask fundamental/conceptual questions with simple examples.
    If the level is 3 or 4, ask application or coding or system design trade-off questions.
    If the level is 5, ask deep architecture, scaling, or complex algorithmic questions.
    
    Output ONLY the question text. Do not output the answer. Do not include introductory text.
    """
    
    # We use ai_client to generate the question
    question_text = ai_client.get_response(message=prompt, force_model="fast_flash")
    if not question_text or question_text.startswith("No response"):
        question_text = f"Explain the core concepts of {topic} and give a real-world example."

    # 4. Save Question
    q = Question(
        user_id=current_user.id,
        topic=topic,
        content=question_text.strip(),
        difficulty=memory.mastery_level
    )
    session.add(q)
    session.commit()
    session.refresh(q)

    return PracticeResponse(question=q, memory=memory)


class AnswerResponse(BaseModel):
    score: int
    feedback: str
    is_correct: bool
    new_mastery_level: int

@router.post("/answer", response_model=AnswerResponse)
def submit_answer(
    req: AnswerRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # 1. Retrieve the question
    question = session.exec(select(Question).where(
        Question.id == req.question_id, 
        Question.user_id == current_user.id
    )).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # 2. Evaluate Answer with AI
    prompt = f"""
    You are an expert technical interviewer evaluating a candidate's answer.
    Topic: {question.topic}
    Question: {question.content}
    Candidate's Answer: {req.user_answer}
    
    Evaluate the answer. Provide a score from 1 to 100, where >= 70 is correct/passing.
    Provide constructive feedback explaining what was good and what was missing or wrong.
    
    Output MUST be valid JSON in this exact format:
    {{
      "score": 85,
      "feedback": "Your explanation is solid. You correctly identified X, but missed Y.",
      "is_correct": true
    }}
    Do not output any markdown formatting or text outside the JSON.
    """
    
    ai_response = ai_client.get_response(message=prompt, force_model="fast_flash")
    
    # Parse JSON safely
    score = 0
    feedback = "Failed to evaluate answer."
    is_correct = False
    
    try:
        # Strip markdown if present
        clean_json = ai_response.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean_json)
        score = int(data.get("score", 0))
        feedback = data.get("feedback", "No feedback provided.")
        is_correct = bool(data.get("is_correct", False))
    except Exception as e:
        print("Error parsing AI evaluation:", e)
        # Fallback heuristic
        if len(req.user_answer) > 20:
            score = 70
            is_correct = True
            feedback = "Looks like a reasonable attempt, but automated grading failed."
        else:
            score = 30
            is_correct = False
            feedback = "Answer seems too short or automated grading failed."

    # 3. Save Attempt
    attempt = QuestionAttempt(
        question_id=question.id,
        user_id=current_user.id,
        user_answer=req.user_answer,
        ai_score=score,
        ai_feedback=feedback
    )
    session.add(attempt)

    # 4. Update Memory
    memory = session.exec(select(LearningMemory).where(
        LearningMemory.user_id == current_user.id,
        LearningMemory.topic == question.topic
    )).first()

    if memory:
        memory.attempts_count += 1
        memory.last_practiced_at = datetime.now(timezone.utc)
        if is_correct:
            memory.correct_count += 1
            if memory.correct_count % 2 == 0 and memory.mastery_level < 5:
                memory.mastery_level += 1
        else:
            memory.wrong_count += 1
            if memory.wrong_count % 2 == 0 and memory.mastery_level > 1:
                memory.mastery_level -= 1
        
        session.add(memory)
    
    session.commit()
    
    new_level = memory.mastery_level if memory else 1

    return AnswerResponse(
        score=score,
        feedback=feedback,
        is_correct=is_correct,
        new_mastery_level=new_level
    )
