"""
ORBIT DAILY — Tulasi AI
Daily challenge system with AI-powered evaluation, XP rewards, streaks, and global leaderboard.
Resets every day at midnight IST. Challenge types: coding | interview | design | behavioral
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from sqlalchemy import func
from typing import List, Optional, Dict, Any
import json, re
from datetime import datetime, timezone, timedelta

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, DailyChallenge, DailyChallengeSubmission, ActivityLog
from app.core.rate_limit import limiter
from app.core.ai_router import get_ai_response

router = APIRouter()

# ── IST helpers ───────────────────────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

def today_ist() -> str:
    return datetime.now(IST).strftime("%Y-%m-%d")

def tomorrow_midnight_ist() -> datetime:
    now = datetime.now(IST)
    tomorrow = now + timedelta(days=1)
    return tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)

def seconds_until_reset() -> int:
    now = datetime.now(IST)
    tomorrow = tomorrow_midnight_ist()
    return int((tomorrow - now).total_seconds())

# ── Challenge bank — rotates daily based on date hash ────────────────────────
CHALLENGE_BANK = [
    {
        "type": "coding",
        "title": "Two Sum — Optimal",
        "question": "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. You may NOT sort the array. Solve it in O(n) time.\n\nExample: nums = [2, 7, 11, 15], target = 9 → [0, 1]",
        "difficulty": "Easy",
        "xp": 40,
        "tags": "DSA,Arrays,HashMap",
        "hint": "A HashMap lets you check for complements in O(1) time.",
    },
    {
        "type": "interview",
        "title": "Tell Me About a Time You Failed",
        "question": "Behavioral question: Describe a significant technical failure in a project you worked on. What happened, what was your role, and most importantly — what did you learn from it?\n\nAnswer using the STAR method (Situation, Task, Action, Result). Minimum 150 words.",
        "difficulty": "Medium",
        "xp": 50,
        "tags": "Behavioral,STAR,Soft Skills",
        "hint": "The 'Result' section must include what changed AFTER the failure — growth > outcome.",
    },
    {
        "type": "design",
        "title": "Design a URL Shortener",
        "question": "Design a production-grade URL shortening service (like bit.ly).\n\nYour answer must cover:\n1. Core API design (endpoints + request/response)\n2. Database schema (which DB and why)\n3. How you generate short codes (collision avoidance)\n4. How you handle 10M+ redirects/day (caching strategy)\n5. One failure scenario and how you mitigate it",
        "difficulty": "Hard",
        "xp": 75,
        "tags": "System Design,Databases,Caching",
        "hint": "Think about read-heavy vs write-heavy. Redirects are pure reads — what does that imply for caching?",
    },
    {
        "type": "coding",
        "title": "Valid Parentheses",
        "question": "Given a string containing only `(`, `)`, `{`, `}`, `[`, `]`, determine if it's valid.\n\nRules:\n- Open brackets must be closed by the same type\n- Open brackets must be closed in the correct order\n\nExample: `()[]{}` → true, `(]` → false, `([)]` → false\n\nWrite the algorithm and explain its time/space complexity.",
        "difficulty": "Easy",
        "xp": 40,
        "tags": "DSA,Stack,Strings",
        "hint": "A stack is perfect for matching pairs in order.",
    },
    {
        "type": "behavioral",
        "title": "Why Do You Want to Work at a FAANG Company?",
        "question": "Imagine you're in a final round interview at Google. The interviewer asks:\n\n\"Beyond salary, why Google specifically? What problems excite you that Google is working on, and how does your background make you the right person to contribute?\"\n\nWrite a compelling, authentic, and specific answer (minimum 200 words). Avoid generic phrases like 'innovative culture'.",
        "difficulty": "Medium",
        "xp": 50,
        "tags": "Behavioral,Career,FAANG",
        "hint": "Specificity wins. Name actual products, research papers, or teams at Google that connect to YOUR work.",
    },
    {
        "type": "coding",
        "title": "Maximum Subarray (Kadane's Algorithm)",
        "question": "Find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nExample: [-2,1,-3,4,-1,2,1,-5,4] → 6 (subarray [4,-1,2,1])\n\nSolve in O(n) time and explain Kadane's Algorithm.",
        "difficulty": "Medium",
        "xp": 55,
        "tags": "DSA,Dynamic Programming,Arrays",
        "hint": "At each index, decide: extend the current subarray or start fresh?",
    },
    {
        "type": "design",
        "title": "Design a Real-Time Chat System",
        "question": "Design WhatsApp's core messaging backend.\n\nCover:\n1. How messages are sent and delivered (WebSockets vs polling)\n2. Message storage strategy (which DB?)\n3. How you handle offline users (message queuing)\n4. End-to-end encryption overview\n5. How do you scale to 500M daily active users?\n\nBegin with a high-level architecture diagram description.",
        "difficulty": "Hard",
        "xp": 80,
        "tags": "System Design,WebSockets,Scale",
        "hint": "Think about the difference between 'sent', 'delivered', and 'read' — each is a different system event.",
    },
]

def get_todays_challenge_template() -> dict:
    """Pick a challenge deterministically based on today's date."""
    from datetime import date
    day_num = (date.today() - date(2025, 1, 1)).days
    return CHALLENGE_BANK[day_num % len(CHALLENGE_BANK)]

# ── Schemas ───────────────────────────────────────────────────────────────────
class SubmitAnswerRequest(BaseModel):
    answer: str

# ── ROUTES ────────────────────────────────────────────────────────────────────

@router.get("/today")
def get_today_challenge(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return today's challenge. Auto-seeds if not yet in DB."""
    today = today_ist()
    challenge = db.exec(select(DailyChallenge).where(DailyChallenge.date == today)).first()

    if not challenge:
        template = get_todays_challenge_template()
        challenge = DailyChallenge(
            date=today,
            challenge_type=template["type"],
            title=template["title"],
            question=template["question"],
            difficulty=template["difficulty"],
            xp_reward=template["xp"],
            tags=template["tags"],
            hint=template["hint"],
        )
        db.add(challenge)
        db.commit()
        db.refresh(challenge)

    # Check if the current user already submitted today
    submission = db.exec(
        select(DailyChallengeSubmission).where(
            DailyChallengeSubmission.user_id == current_user.id,
            DailyChallengeSubmission.date == today,
        )
    ).first()

    # Count total submissions today for leaderboard preview
    submissions_today = db.exec(
        select(func.count(DailyChallengeSubmission.id)).where(
            DailyChallengeSubmission.date == today,
            DailyChallengeSubmission.completed == True,
        )
    ).one()

    return {
        "challenge": {
            "id": challenge.id,
            "date": challenge.date,
            "type": challenge.challenge_type,
            "title": challenge.title,
            "question": challenge.question,
            "difficulty": challenge.difficulty,
            "xp_reward": challenge.xp_reward,
            "tags": challenge.tags.split(",") if challenge.tags else [],
            "hint": challenge.hint,
        },
        "already_submitted": submission is not None,
        "submission": {
            "score": submission.score,
            "ai_feedback": submission.ai_feedback,
            "strengths": json.loads(submission.strengths or "[]"),
            "improvements": json.loads(submission.improvements or "[]"),
            "xp_awarded": submission.xp_awarded,
        } if submission else None,
        "submitters_today": submissions_today,
        "seconds_until_reset": seconds_until_reset(),
    }


@router.post("/submit")
@limiter.limit("5/minute")
def submit_challenge(
    request: Request,
    body: SubmitAnswerRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Submit an answer to today's challenge. AI evaluates instantly and awards XP."""
    today = today_ist()

    # Guard: already submitted?
    existing = db.exec(
        select(DailyChallengeSubmission).where(
            DailyChallengeSubmission.user_id == current_user.id,
            DailyChallengeSubmission.date == today,
        )
    ).first()
    if existing:
        raise HTTPException(400, "You already submitted today's challenge. Come back tomorrow!")

    # Get challenge
    challenge = db.exec(select(DailyChallenge).where(DailyChallenge.date == today)).first()
    if not challenge:
        raise HTTPException(404, "Today's challenge not found. Try refreshing the page.")

    # ── AI Evaluation ──────────────────────────────────────────────────────────
    eval_prompt = f"""You are an expert technical evaluator for the TulasiAI ORBIT DAILY challenge.

CHALLENGE TYPE: {challenge.challenge_type.upper()}
CHALLENGE TITLE: {challenge.title}
DIFFICULTY: {challenge.difficulty}
QUESTION:
{challenge.question}

CANDIDATE ANSWER:
{body.answer}

Evaluate the answer strictly and return ONLY valid JSON with EXACTLY these keys:
{{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence overall verdict>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "verdict": "<Excellent|Good|Average|Needs Work>"
}}

Scoring guide:
- 90-100: Near-perfect, production-grade answer
- 70-89: Good answer with minor gaps
- 50-69: Average, missing key concepts
- 0-49: Incomplete or incorrect

Be strict but fair. No generic feedback. Return ONLY the JSON object."""

    try:
        raw = get_ai_response(eval_prompt)
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        eval_result = json.loads(match.group() if match else raw)
    except Exception:
        eval_result = {
            "score": 60,
            "feedback": "Your answer showed effort. The evaluation engine encountered a minor issue — full marks partial credit applied.",
            "strengths": ["Attempted the challenge", "Showed initiative"],
            "improvements": ["Add more technical depth", "Include examples or pseudocode"],
            "verdict": "Average"
        }

    score = max(0, min(100, int(eval_result.get("score", 60))))

    # ── XP Calculation ─────────────────────────────────────────────────────────
    base_xp = challenge.xp_reward
    score_multiplier = score / 100
    difficulty_bonus = {"Easy": 0, "Medium": 10, "Hard": 25}.get(challenge.difficulty, 0)
    xp_earned = max(10, int(base_xp * score_multiplier) + (difficulty_bonus if score >= 70 else 0))

    # ── Persist Submission ─────────────────────────────────────────────────────
    submission = DailyChallengeSubmission(
        user_id=current_user.id,
        challenge_id=challenge.id,
        date=today,
        answer=body.answer,
        score=score,
        ai_feedback=eval_result.get("feedback", ""),
        strengths=json.dumps(eval_result.get("strengths", [])),
        improvements=json.dumps(eval_result.get("improvements", [])),
        xp_awarded=xp_earned,
        completed=True,
    )
    db.add(submission)

    # Award XP to user
    current_user.xp = (current_user.xp or 0) + xp_earned
    db.add(current_user)

    # Log activity
    activity = ActivityLog(
        user_id=current_user.id,
        action_type="daily_challenge_completed",
        title=f"ORBIT DAILY: {challenge.title} — Score {score}/100",
        xp_earned=xp_earned,
    )
    db.add(activity)
    db.commit()

    return {
        "success": True,
        "score": score,
        "verdict": eval_result.get("verdict", "Good"),
        "feedback": eval_result.get("feedback", ""),
        "strengths": eval_result.get("strengths", []),
        "improvements": eval_result.get("improvements", []),
        "xp_awarded": xp_earned,
        "total_xp": current_user.xp,
        "sample_answer": challenge.sample_answer,
    }


@router.get("/leaderboard")
def get_daily_leaderboard(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Top 20 scorers for today's challenge."""
    today = today_ist()

    results = db.exec(
        select(DailyChallengeSubmission, User.name, User.email, User.avatar)
        .join(User, DailyChallengeSubmission.user_id == User.id)
        .where(DailyChallengeSubmission.date == today, DailyChallengeSubmission.completed == True)
        .order_by(DailyChallengeSubmission.score.desc(), DailyChallengeSubmission.submitted_at.asc())
        .limit(20)
    ).all()

    leaderboard = []
    for rank, (sub, name, email, avatar) in enumerate(results, 1):
        is_me = sub.user_id == current_user.id
        leaderboard.append({
            "rank": rank,
            "user_name": name or email.split("@")[0],
            "avatar": avatar,
            "score": sub.score,
            "xp_awarded": sub.xp_awarded,
            "submitted_at": sub.submitted_at.isoformat(),
            "is_me": is_me,
        })

    # Find current user's rank if not in top 20
    my_rank = None
    my_position = next((e for e in leaderboard if e["is_me"]), None)
    if not my_position:
        my_sub = db.exec(
            select(DailyChallengeSubmission).where(
                DailyChallengeSubmission.user_id == current_user.id,
                DailyChallengeSubmission.date == today,
            )
        ).first()
        if my_sub:
            better_count = db.exec(
                select(func.count(DailyChallengeSubmission.id)).where(
                    DailyChallengeSubmission.date == today,
                    DailyChallengeSubmission.score > my_sub.score,
                    DailyChallengeSubmission.completed == True,
                )
            ).one()
            my_rank = better_count + 1

    return {
        "date": today,
        "leaderboard": leaderboard,
        "my_rank": my_rank,
        "total_participants": len(leaderboard),
    }


@router.get("/streak")
def get_daily_streak(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Calculate the current user's ORBIT DAILY streak."""
    subs = db.exec(
        select(DailyChallengeSubmission.date)
        .where(
            DailyChallengeSubmission.user_id == current_user.id,
            DailyChallengeSubmission.completed == True,
        )
        .order_by(DailyChallengeSubmission.date.desc())
    ).all()

    completed_dates = sorted(set(subs), reverse=True)
    if not completed_dates:
        return {"streak": 0, "longest_streak": 0, "total_completed": 0, "completed_dates": []}

    # Calculate streak
    from datetime import date
    streak = 0
    current_date = date.today()

    for i, d in enumerate(completed_dates):
        expected = (current_date - timedelta(days=i)).strftime("%Y-%m-%d")
        if d == expected:
            streak += 1
        else:
            break

    # Longest streak
    longest = 1
    current_run = 1
    for i in range(1, len(completed_dates)):
        prev = datetime.strptime(completed_dates[i - 1], "%Y-%m-%d").date()
        curr = datetime.strptime(completed_dates[i], "%Y-%m-%d").date()
        if (prev - curr).days == 1:
            current_run += 1
            longest = max(longest, current_run)
        else:
            current_run = 1

    return {
        "streak": streak,
        "longest_streak": longest,
        "total_completed": len(completed_dates),
        "completed_dates": completed_dates[:30],
    }


@router.get("/history")
def get_challenge_history(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Last 10 challenge submissions for this user."""
    subs = db.exec(
        select(DailyChallengeSubmission, DailyChallenge.title, DailyChallenge.challenge_type, DailyChallenge.difficulty)
        .join(DailyChallenge, DailyChallengeSubmission.challenge_id == DailyChallenge.id)
        .where(DailyChallengeSubmission.user_id == current_user.id)
        .order_by(DailyChallengeSubmission.submitted_at.desc())
        .limit(10)
    ).all()

    return {
        "history": [
            {
                "date": sub.date,
                "title": title,
                "type": challenge_type,
                "difficulty": difficulty,
                "score": sub.score,
                "xp_awarded": sub.xp_awarded,
                "submitted_at": sub.submitted_at.isoformat(),
            }
            for sub, title, challenge_type, difficulty in subs
        ]
    }
