from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog, SolvedProblem
from app.core.rate_limit import limiter
from app.core.ai_router import resilient_ai_response

router = APIRouter()

SKILL_MAP = {
    "coding": ["code_solved", "hackathon_joined"],
    "system_design": ["roadmap_step", "resume_generated"],
    "ai_ml": ["message_sent", "startup_saved"],
    "professionalism": ["interview_completed", "resume_generated"],
    "projects": ["course_completed", "roadmap_completed", "startup_saved"],
    "theory": ["video_watched", "reel_watched"]
}

DIMENSIONS = ["Coding", "System Design", "AI/ML", "Professionalism", "Projects", "Theory"]

@router.get("/skill-profile")
def get_skill_profile(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Normalizes ActivityLog into 6 skill dimensions for radar chart visualization.
    Scores are on a scale of 0-100.
    """
    # Fetch all activity logs for this user
    logs = db.exec(
        select(ActivityLog).where(ActivityLog.user_id == current_user.id)
    ).all()

    # Initialize scores
    scores = {dim: 0 for dim in DIMENSIONS}
    
    # Weight per action type
    weights = {
        "Coding": {"code_solved": 5, "hackathon_joined": 15},
        "System Design": {"roadmap_step": 8, "resume_generated": 10},
        "AI/ML": {"message_sent": 2, "startup_saved": 15},
        "Professionalism": {"interview_completed": 20, "resume_generated": 10},
        "Projects": {"course_completed": 25, "roadmap_completed": 30, "startup_saved": 10},
        "Theory": {"video_watched": 4, "reel_watched": 2}
    }

    # Aggregate scores
    for log in logs:
        for dim, action_weights in weights.items():
            if log.action_type in action_weights:
                scores[dim] += action_weights[log.action_type]

    # Normalize to 0-100 (cap at 100 for visual consistency)
    results = []
    for dim in DIMENSIONS:
        val = min(100, scores[dim])
        # If user is level 1, ensure at least a base "starting" shape for visualization
        if val == 0: val = 10 
        results.append({"subject": dim, "A": val, "fullMark": 100})

    return {"radar_data": results, "user_level": current_user.level}


@router.get("/career-readiness")
def get_career_readiness(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Calculates an AGI-level Career Readiness Score based on structured intelligence, 
    technical depth, and industry-standard milestones.
    """
    import json
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    
    # Weights for AGI-level scoring
    # 1. Base Consistency (XP & Streaks) - 30%
    base_consistency = min(100, (current_user.xp // 50) + (current_user.streak * 5))
    
    # 2. Technical Depth (Structured Profile) - 35%
    tech_depth = intelligence.get("technical_depth", 30)
    
    # 3. Career Velocity (Growth Rate) - 35%
    velocity = intelligence.get("career_velocity", 50)
    
    final_score = int((base_consistency * 0.3) + (tech_depth * 0.35) + (velocity * 0.35))
    final_score = min(100, final_score)
    
    # Role-Specific Gap Analysis
    target = (current_user.target_role or "AI Engineer").lower()
    gaps = intelligence.get("gaps", [])
    if not gaps:
        if "ai" in target:
            gaps = ["Transformer Architectures", "Vector Embedding Optimization"]
        else:
            gaps = ["Distributed Systems", "High-Concurrency Backend Design"]
            
    # FAANG/Research Caliber Logic
    is_elite = final_score > 85 and tech_depth > 70
    readiness_label = _get_readiness_label(final_score)
    if is_elite: readiness_label = "💎 FAANG / AI Research Caliber"

    return {
        "score": final_score,
        "label": readiness_label,
        "user_type": current_user.user_type,
        "target_role": current_user.target_role or "AI Engineer",
        "metrics": {
            "technical_depth": tech_depth,
            "career_velocity": velocity,
            "consistency": base_consistency
        },
        "missing_skills": gaps[:3],
        "strengths": intelligence.get("strengths", [])[:3],
        "next_milestone": f"Master '{gaps[0]}' to accelerate your {current_user.user_type.replace('_', ' ')} trajectory."
    }


@router.get("/daily-mission")
@limiter.limit("15/minute")
def get_daily_mission(
    request: Request,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a hyper-personalized engineering mission using AI.
    Differentiates between students (foundations) and professionals (architecture/scale).
    """
    from app.core.config import settings
    import google.generativeai as genai
    import json
    
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")

    prompt = f"""
    You are the Tulasi AI Career Architect. Generate a high-stakes engineering mission for today.
    
    User Context:
    - Stage: {current_user.user_type} ({current_user.department})
    - Target: {current_user.target_role}
    - Technical Depth: {intelligence.get('technical_depth', 30)}/100
    - Strengths: {intelligence.get('strengths', [])}
    
    RULES:
    - For 1st/2nd years: Focus on elite foundations (DSA, Systems).
    - For 3rd/4th years: Focus on projects, system design, and internship readiness.
    - For Professionals: Focus on architectural trade-offs, scaling, and leadership.
    
    Return JSON:
    {{
       "mission_title": "Short catchy title",
       "mission_description": "Specific, actionable one-sentence mission",
       "reward_xp": 250,
       "module_link": "/dashboard/chat"
    }}
    """

    fallback = {
        "mission_title": "Neural Optimization",
        "mission_description": "Bridge the gap in your current target role expertise by mastering one core design pattern.",
        "reward_xp": 100,
        "module_link": "/dashboard/chat"
    }

    return resilient_ai_response(prompt, fallback=fallback)


@router.get("/next-best-action")
def get_next_best_action(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    The AGI-like Decision Engine. Suggests the single most impactful action the user can take 
    at this exact moment to improve their career trajectory.
    """
    import json
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    depth = intelligence.get("technical_depth", 30)
    gaps = intelligence.get("gaps", [])
    
    # Heuristic-based logic for immediate feedback (AI-enhanced in future)
    if not current_user.is_onboarded:
        return {"action": "Complete Onboarding", "reason": "Align your neural profile with our career engines.", "link": "/dashboard/profile"}
    
    if depth < 40:
        return {"action": "Strengthen Foundations", "reason": "Your technical depth is below industry baseline for FAANG.", "link": "/dashboard/chat?mode=learning_engine"}
    
    if gaps:
        return {"action": f"Bridge Gap: {gaps[0]}", "reason": "This is currently your most significant technical blind spot.", "link": "/dashboard/chat?mode=doubt"}
    
    return {"action": "Simulate System Design", "reason": "You are ready for mid-senior architectural challenges.", "link": "/dashboard/system-design"}


@router.get("/strategic-plan")
@limiter.limit("5/minute")
def get_strategic_plan(
    request: Request,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a Year-Wise Strategic Blueprint.
    """
    from app.core.config import settings
    import google.generativeai as genai
    import json

    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    
    prompt = f"""
    You are the Tulasi AI Lead Career Strategist. Generate a world-class STRATEGIC BLUEPRINT.
    
    User Profile:
    - Stage: {current_user.user_type}
    - Role Target: {current_user.target_role}
    - Technical Depth: {intelligence.get('technical_depth', 30)}
    - Gaps: {intelligence.get('gaps', [])}
    
    The plan must be specific to their graduation year/professional stage.
    
    Format JSON:
    {{
       "master_goal": "...",
       "current_standing": "...",
       "six_month_roadmap": [...],
       "immediate_pivot": "..."
    }}
    """
    fallback = {
        "master_goal": "Awaiting Model Warmup...", 
        "current_standing": "Analyzing profile...", 
        "six_month_roadmap": [
            {"month": "1-2", "focus": "Core Fundamentals", "milestone": "Master programming concepts"},
            {"month": "3-4", "focus": "Project Sprint", "milestone": "Build 2 portfolio apps"},
            {"month": "5-6", "focus": "Interview Ready", "milestone": "Clear mock technical loops"}
        ], 
        "immediate_pivot": "Interact more with the AI Chat to sharpen your profile."
    }
    
    return resilient_ai_response(prompt, fallback=fallback)


@router.get("/daily-routine")
@limiter.limit("5/minute")
def get_daily_routine(
    request: Request,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a structured hour-by-hour personalized learning schedule using AI.
    Optimizes for the user's specific role, technical gaps, and intensity level.
    """
    from app.core.config import settings
    import google.generativeai as genai
    import json
    
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    
    prompt = f"""
    You are the Tulasi AI Personalized Learning Optimizer. 
    Task: Generate a high-performance daily learning routine for a {current_user.user_type}.
    Role Target: {current_user.target_role or "Full-Stack Developer"}
    Strengths: {intelligence.get('strengths', [])[:3]}
    Gaps: {intelligence.get('gaps', [])[:3]}

    Generate a 9 AM to 9 PM schedule in intervals.
    Include: Focus Time, Break, Hands-on Project, and AI-Powered Learning segments.

    Return JSON list:
    [
      {{"time": "09:00", "task": "Title", "topic": "Brief description", "intensity": "Focus|Chill|Deep Work"}}
    ]
    """
    fallback = {
        "routine": [
            {"time": "09:00", "task": "Neural Warmup", "topic": "Algorithm practice on LeetCode", "intensity": "Focus"},
            {"time": "11:00", "task": "Core Mastery", "topic": "Diving into System Design patterns", "intensity": "Deep Work"},
            {"time": "14:00", "task": "Project Sprint", "topic": "Building out your master portfolio", "intensity": "Deep Work"},
            {"time": "17:00", "task": "AI Sync", "topic": "Reviewing latest AI Research Papers", "intensity": "Chill"},
            {"time": "20:00", "task": "Reflection", "topic": "Logging daily wins and XP updates", "intensity": "Chill"}
        ],
        "is_fallback": True
    }
    
    return resilient_ai_response(prompt, fallback=fallback)


def _get_readiness_label(score: int) -> str:
    if score >= 90: return "Industry Vanguard"
    if score >= 75: return "Production Ready"
    if score >= 50: return "Skilled Aspirant"
    if score >= 25: return "Learning Engine"
    return "Foundation Track"
