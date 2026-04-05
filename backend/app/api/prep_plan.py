from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
import json

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.models import User, PrepPlan
from app.core.ai_router import resilient_ai_response

router = APIRouter()


class GeneratePrepRequest(BaseModel):
    role: str
    duration_months: int


def _year_context(user_type: str) -> str:
    """Return a year-specific instruction to force dynamic, personalized output."""
    mapping = {
        "1st_year": (
            "This is a 1st year student. Focus on: programming fundamentals (C++/Python), "
            "basic data structures (arrays, strings, linked lists), simple projects, "
            "competitive programming introduction. NO advanced topics. Keep it achievable."
        ),
        "2nd_year": (
            "This is a 2nd year student. Focus on: DSA mastery (trees, graphs, DP), "
            "web development basics, hackathon participation, first internship preparation, "
            "open source contributions. Introduce system design light."
        ),
        "3rd_year": (
            "This is a 3rd year student ready for internships. Focus on: Advanced DSA (300+ LeetCode), "
            "system design fundamentals (HLD + LLD), real portfolio projects, "
            "internship application strategy, technical interview prep. HIGH intensity."
        ),
        "4th_year": (
            "This is a final year student targeting placements. Focus on: LeetCode 300+ (60% medium), "
            "full system design mastery, FAANG-level mock interviews, campus placement strategy, "
            "offer negotiation, behavioral interview STAR method. MAXIMUM intensity."
        ),
        "professional": (
            "This is a working professional looking to upskill or switch roles. Focus on: "
            "advanced system design, distributed systems, domain specialization, "
            "leadership skills, senior-level interview prep, salary negotiation tactics."
        ),
    }
    return mapping.get(user_type, mapping["3rd_year"])


@router.post("/generate")
def generate_prep_plan(
    req: GeneratePrepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    target = req.role or current_user.target_role or "Software Engineering"
    year_ctx = _year_context(current_user.user_type or "3rd_year")
    xp_ctx = f"User has {current_user.xp} platform XP and a {current_user.streak}-day streak."

    prompt = f"""You are TulasiAI's Preparation Architect — an elite career mentor.

STUDENT PROFILE:
- Target Role: {target}
- Preparation Duration: {req.duration_months} months
- Academic Stage: {current_user.user_type or '3rd year student'}
- Context: {year_ctx}
- Platform Stats: {xp_ctx}

Generate a HYPER-SPECIFIC, week-by-week preparation plan for this exact profile.
Every week must have concrete, actionable tasks with specific resources (e.g., "Solve 15 LeetCode medium DP problems — use Neetcode playlist").
The plan difficulty MUST match their academic stage — do NOT give the same plan to a 1st year and a 4th year.

Return ONLY valid JSON matching this schema exactly:
{{
  "title": "Prep Plan: {target} — {req.duration_months} Month Sprint",
  "overview": "2-3 sentence strategic overview for this specific stage",
  "weeks": [
    {{
      "week": 1,
      "focus": "Specific topic/theme for the week",
      "goal": "Measurable outcome by end of week",
      "tasks": [
        "Specific Task 1 with resource",
        "Specific Task 2 with resource",
        "Specific Task 3 with resource"
      ],
      "daily_time_hours": 2
    }}
  ],
  "milestones": [
    {{"month": 1, "target": "What should be achieved by month 1"}},
    {{"month": {req.duration_months}, "target": "Final readiness target"}}
  ],
  "key_resources": ["Resource 1", "Resource 2", "Resource 3"]
}}
Return ONLY the raw JSON object, nothing else."""

    # Build a year-specific fallback (not generic)
    fallback_plan = _make_fallback_plan(target, req.duration_months, current_user.user_type)

    try:
        plan_data = resilient_ai_response(
            prompt, fallback=fallback_plan, force_model="complex_reasoning"
        )

        new_plan = PrepPlan(
            user_id=current_user.id,
            role=req.role,
            duration=f"{req.duration_months} Months",
            plan_json=json.dumps(plan_data),
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        return {"plan": plan_data, "id": new_plan.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error generating plan: {str(e)}")


def _make_fallback_plan(role: str, months: int, user_type: str) -> dict:
    """Year-specific fallback plan — never the same for different user stages."""
    stage_weeks = {
        "1st_year": [
            {"week": 1, "focus": "Programming Fundamentals", "goal": "Write 20+ programs in Python/C++",
             "tasks": ["Learn variables, loops, functions in Python (Codecademy Python)", "Solve 10 HackerRank Easy problems", "Set up local dev environment (VS Code + Git)"], "daily_time_hours": 1.5},
            {"week": 2, "focus": "Basic Data Structures", "goal": "Implement arrays, strings, stacks from scratch",
             "tasks": ["Implement Stack and Queue in Python", "Solve 10 LeetCode Easy (Array/String category)", "Watch: CS50 Week 3 on Algorithms"], "daily_time_hours": 2},
            {"week": 3, "focus": "First Project", "goal": "Deploy a working web app",
             "tasks": ["Build a To-Do app with HTML/CSS/JS", "Push to GitHub", "Deploy on Vercel (free)"], "daily_time_hours": 2},
            {"week": 4, "focus": "Competitive Programming Intro", "goal": "Solve 20 Codeforces problems",
             "tasks": ["Register on Codeforces and solve Div 3 problems", "Learn Big-O notation", "Solve 5 LeetCode Easy Daily Challenges"], "daily_time_hours": 1.5},
        ],
        "4th_year": [
            {"week": 1, "focus": "DSA Intensive", "goal": "Complete Neetcode 75 core problems",
             "tasks": ["Solve 15 LeetCode Medium (Arrays + Sliding Window)", "Review Two Pointer & HashMap patterns", "1 Mock Interview on Pramp"], "daily_time_hours": 4},
            {"week": 2, "focus": "System Design Basics", "goal": "Design 3 real systems confidently",
             "tasks": ["Study: Design URL Shortener, Design Twitter Feed", "Read Grokking System Design Ch 1-3", "Practice estimations: QPS, Storage, Bandwidth"], "daily_time_hours": 4},
            {"week": 3, "focus": "Behavioral Interview Prep", "goal": "Have 10 STAR stories ready",
             "tasks": ["Write 10 STAR method stories", "Practice leadership + conflict stories", "Research target company culture + values"], "daily_time_hours": 3},
            {"week": 4, "focus": "Full Mock Interview Loop", "goal": "Pass a simulated full interview loop",
             "tasks": ["2 Technical mock interviews (Pramp/Exponent)", "1 System Design mock interview", "1 HR/Behavioral mock interview"], "daily_time_hours": 4},
        ],
        "professional": [
            {"week": 1, "focus": "Role Gap Analysis", "goal": "Identify top 5 skill gaps for target role",
             "tasks": [f"Research 20 JDs for {role} and list top 5 skills", "Assess current expertise vs requirements", "Create a personal learning roadmap"], "daily_time_hours": 2},
            {"week": 2, "focus": "Advanced System Design", "goal": "Design one distributed system end-to-end",
             "tasks": ["Design: Distributed Rate Limiter", "Study: CAP Theorem + PACELC", "Read: Designing Data-Intensive Applications Ch 1"], "daily_time_hours": 2},
            {"week": 3, "focus": "Leadership Signals", "goal": "Prepare senior-level behavioral narratives",
             "tasks": ["Write 5 leadership stories with business impact", "Quantify achievements from current role", "Practice: 'Tell me about a system you built at scale'"], "daily_time_hours": 2},
            {"week": 4, "focus": "Interview Simulation", "goal": "Complete 3 full senior interview simulations",
             "tasks": ["Senior mock technical interview", "System design mock at staff level", "Compensation research + negotiation prep"], "daily_time_hours": 2},
        ],
    }

    # Default to 3rd_year if not found
    weeks_template = stage_weeks.get(user_type, stage_weeks.get("4th_year"))

    # Repeat/trim weeks to match requested months
    target_weeks = months * 4
    extended = []
    while len(extended) < target_weeks:
        for wk in weeks_template:
            if len(extended) >= target_weeks:
                break
            extended.append({**wk, "week": len(extended) + 1})

    return {
        "title": f"Prep Plan: {role} — {months} Month Sprint",
        "overview": f"A structured {months}-month preparation plan for a {user_type.replace('_', ' ')} targeting a {role} role. Built for consistent daily practice.",
        "weeks": extended[:target_weeks],
        "milestones": [
            {"month": 1, "target": "Core fundamentals solid, 50+ problems solved"},
            {"month": months, "target": f"Interview-ready for {role} positions"},
        ],
        "key_resources": [
            "Neetcode.io — DSA roadmap",
            "Grokking the System Design Interview — educative.io",
            "Pramp.com — Free mock interviews",
            "LinkedIn Jobs — Track target companies",
        ],
    }


@router.get("/my-plans")
def get_my_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    plans = db.exec(select(PrepPlan).where(PrepPlan.user_id == current_user.id)).all()
    return {
        "plans": [
            {
                "id": p.id,
                "role": p.role,
                "duration": p.duration,
                "plan": json.loads(p.plan_json),
            }
            for p in plans
        ]
    }


@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    plan = db.get(PrepPlan, plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(404, "Plan not found")
    db.delete(plan)
    db.commit()
    return {"success": True}
