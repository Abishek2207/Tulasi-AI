from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Dict
from datetime import datetime, timedelta

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog, SolvedProblem

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
    Calculates an AG-level Career Readiness Score based on activity, 
    long-term intelligence profile, and FAANG alignment.
    """
    import json
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    
    # Base score using XP and Streak
    base_score = min(60, (current_user.xp // 100) + (current_user.streak * 3))
    
    # Analyze profile depth
    facts_count = len(intelligence.get("facts", []))
    strengths_count = len(intelligence.get("strengths", []))
    profile_bonus = min(20, (facts_count * 2) + (strengths_count * 3))
    
    # Analyze diversity of skills
    profile = get_skill_profile(db, current_user)
    radar_data = profile["radar_data"]
    active_dims = sum(1 for d in radar_data if d["A"] > 20)
    diversity_bonus = min(20, (active_dims / 6) * 40)
    
    final_score = int(min(100, base_score + profile_bonus + diversity_bonus))
    
    # AI-Driven Gap Analysis
    gaps = intelligence.get("gaps", [])
    if not gaps:
        # Fallback to static rules for now
        target = (current_user.target_role or "").lower()
        if "ai" in target or "machine learning" in target:
            gaps = ["Deep Learning & LLM Fine-tuning", "Advanced Python & PyTorch"]
        else:
            gaps = ["Scalable System Architecture", "Production-level Backend Logic"]
            
    # FAANG Alignment logic
    faang_aligned = final_score > 85 and strengths_count > 5
    readiness_label = _get_readiness_label(final_score)
    if faang_aligned: readiness_label = "🏆 FAANG Caliber"

    return {
        "score": final_score,
        "label": readiness_label,
        "user_type": current_user.user_type,
        "target_role": current_user.target_role or "Fullstack Engineer",
        "missing_skills": gaps[:3],
        "strengths": intelligence.get("strengths", [])[:3],
        "readiness_matrix": {
            "technical_depth": min(100, strengths_count * 15),
            "consistency": min(100, current_user.streak * 10),
            "platform_engagement": min(100, (current_user.xp // 50) * 10)
        },
        "next_milestone": f"Acquire '{gaps[0]}' to unlock elite tier status." if gaps else "Keep pushing towards Level 10 architecture."
    }


@router.get("/daily-mission")
def get_daily_mission(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a highly personalized "Daily Engineering Mission" using AI based on user metadata.
    """
    from app.core.config import settings
    import google.generativeai as genai
    import json

    # Context for AI
    context = {
        "user_type": current_user.user_type,
        "department": current_user.department,
        "target_role": current_user.target_role,
        "interests": current_user.interest_areas.split(",") if current_user.interest_areas else []
    }

    prompt = f"""
    You are the Tulasi AI Career Architect. Generate a ONE-SENTENCE engineering mission for the user today.
    The mission must be actionable, specific, and hyper-relevant to their career stage and interests.
    
    User Context: {json.dumps(context)}
    
    Example Missions:
    - "As an aspiring AI Engineer, today's mission is to implement a vector-based semantic search using FAISS and your Gemini API."
    - "As a 2nd-year CS student, today's mission is to optimize a binary search tree using an AVL balancing algorithm."
    
    Return the mission in this JSON format:
    {{
       "mission_title": "Short catchy title",
       "mission_description": "The one-sentence actionable mission",
       "reward_xp": 150,
       "module_link": "/dashboard/chat"
    }}
    """

    try:
        genai.configure(api_key=settings.effective_gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Basic JSON cleanup if markdown is returned
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        mission = json.loads(text)
        return mission
    except Exception as e:
        # Fallback mission if AI fails
        return {
            "mission_title": "Neural Sync",
            "mission_description": f"Focus on mastering one core concept in {current_user.target_role or 'Engineering'} today.",
            "reward_xp": 50,
            "module_link": "/dashboard/chat"
        }


@router.get("/strategic-plan")
def get_strategic_plan(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a 6-month high-fidelity Strategic Career Blueprint using AI.
    Analyzes the user's intelligence profile, streaks, and gaps to build a path to FAANG/Research.
    """
    from app.core.config import settings
    import google.generativeai as genai
    import json

    # Intelligence Context
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    
    prompt = f"""
    You are the Tulasi AI Lead Career Strategist. Generate a 6-month STRATEGIC BLUEPRINT for this user.
    The goal is to reach a world-class level (FAANG/AI Research Scientist).
    
    User Intelligence Profile: {json.dumps(intelligence)}
    User Metadata: {current_user.target_role}, {current_user.xp} XP, Level {current_user.level}
    
    Return a JSON object with:
    1. "master_goal": A high-level ambition (e.g. "Become a Senior AI Research Scientist at DeepMind")
    2. "current_standing": A brief assessment of where they are.
    3. "six_month_roadmap": An array of 6 objects (month, focus, key_milestone).
    4. "immediate_pivot": One specific change they should make TODAY to improve velocity.
    
    Format:
    {{
       "master_goal": "...",
       "current_standing": "...",
       "six_month_roadmap": [
          {{"month": "Month 1", "focus": "...", "milestone": "..."}},
          ...
       ],
       "immediate_pivot": "..."
    }}
    
    Ensure the advice is technical, high-density, and realistic. 
    """

    try:
        genai.configure(api_key=settings.effective_gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash-lite")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        plan = json.loads(text)
        return plan
    except Exception as e:
        return {
            "master_goal": "Awaiting Neural Synchronization...",
            "current_standing": "Platform is still learning your architectural patterns.",
            "six_month_roadmap": [{"month": "Month 1", "focus": "Foundation", "milestone": "Reach Level 5"}],
            "immediate_pivot": "Increase interaction frequency with the Socratic Architect."
        }


def _get_readiness_label(score: int) -> str:
    if score >= 90: return "Industry Vanguard"
    if score >= 75: return "Production Ready"
    if score >= 50: return "Skilled Aspirant"
    if score >= 25: return "Learning Engine"
    return "Foundation Track"
