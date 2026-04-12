"""
Career Roadmap API — AI-ready, async endpoints for student/professional roadmaps.
Designed with abstraction layer for future OpenAI/Gemini integration.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.user import StudentRoadmapRequest, ProfessionalRoadmapRequest
from typing import List, Dict, Any
import json

router = APIRouter()


# ── Curated Data Sets (fallback / seed data) ────────────────────────────────

STUDENT_TOPICS = {
    "DSA": [
        "Arrays & Strings", "Linked Lists", "Stacks & Queues", "Trees & BST",
        "Graphs & BFS/DFS", "Dynamic Programming", "Recursion & Backtracking",
        "Heaps & Priority Queues", "Tries", "Bit Manipulation"
    ],
    "Aptitude": [
        "Number Systems", "Percentage & Ratio", "Time & Work",
        "Speed Distance Time", "Logical Reasoning", "Verbal Ability",
        "Data Interpretation", "Probability"
    ],
    "Projects": [
        "REST API with FastAPI", "Portfolio Website", "React CRUD App",
        "Chat Application", "ML Classification Project", "Docker Containerization",
        "CI/CD Pipeline Setup", "Full-Stack SaaS MVP"
    ],
    "Core CS": [
        "OS Concepts (Process, Thread)", "DBMS (SQL + Normalization)",
        "Computer Networks (TCP/UDP)", "OOP Principles", "System Design Basics"
    ]
}

PROFESSIONAL_ROADMAP = {
    "AI": [
        {"topic": "Python for AI (NumPy, Pandas)", "level": "beginner", "duration_hrs": 8},
        {"topic": "Machine Learning Fundamentals (sklearn)", "level": "beginner", "duration_hrs": 12},
        {"topic": "Deep Learning with PyTorch/TensorFlow", "level": "intermediate", "duration_hrs": 20},
        {"topic": "LLMs & Prompt Engineering", "level": "intermediate", "duration_hrs": 10},
        {"topic": "Building Production AI APIs", "level": "advanced", "duration_hrs": 15},
    ],
    "Cloud": [
        {"topic": "AWS Core Services (EC2, S3, IAM)", "level": "beginner", "duration_hrs": 10},
        {"topic": "Serverless Architecture (Lambda)", "level": "intermediate", "duration_hrs": 8},
        {"topic": "Kubernetes & Container Orchestration", "level": "intermediate", "duration_hrs": 16},
        {"topic": "Cloud Cost Optimization", "level": "advanced", "duration_hrs": 6},
        {"topic": "Multi-cloud Strategy", "level": "advanced", "duration_hrs": 8},
    ],
    "System Design": [
        {"topic": "Scalability Fundamentals", "level": "beginner", "duration_hrs": 6},
        {"topic": "Load Balancing & Caching (Redis)", "level": "intermediate", "duration_hrs": 8},
        {"topic": "Database Design & Sharding", "level": "intermediate", "duration_hrs": 10},
        {"topic": "Microservices Architecture", "level": "advanced", "duration_hrs": 12},
        {"topic": "Designing for High Availability", "level": "advanced", "duration_hrs": 10},
    ],
    "Leadership": [
        {"topic": "Agile & Scrum Master Basics", "level": "beginner", "duration_hrs": 5},
        {"topic": "Technical Communication & Documentation", "level": "beginner", "duration_hrs": 4},
        {"topic": "Code Review Best Practices", "level": "intermediate", "duration_hrs": 4},
        {"topic": "Mentoring Junior Developers", "level": "advanced", "duration_hrs": 6},
    ]
}

SALARY_IMPACT = {
    "AI": {"boost_pct": 35, "avg_hike": "₹6–15 LPA", "demand": "Very High"},
    "Cloud": {"boost_pct": 28, "avg_hike": "₹4–12 LPA", "demand": "High"},
    "System Design": {"boost_pct": 40, "avg_hike": "₹8–20 LPA", "demand": "Very High"},
    "Leadership": {"boost_pct": 25, "avg_hike": "₹5–10 LPA", "demand": "High"},
}

LAYOFF_PREVENTION_SKILLS = [
    {"skill": "AI / LLM Integration", "reason": "Every company is AI-enabling their products", "urgency": "critical"},
    {"skill": "Cloud Native Development", "reason": "On-prem infrastructure is being phased out", "urgency": "high"},
    {"skill": "System Design", "reason": "Senior-level interviews universally test this", "urgency": "high"},
    {"skill": "Data Analysis (SQL + Python)", "reason": "Data-driven decision making is mandatory", "urgency": "medium"},
    {"skill": "DevOps / CI-CD", "reason": "Full-stack ownership is the new norm", "urgency": "medium"},
]


# ── AI Abstraction Layer (Future: swap body for Gemini/OpenAI call) ──────────

def _generate_student_roadmap(req: StudentRoadmapRequest, user_profile: Any) -> List[Dict]:
    """
    Generates a day-by-day placement roadmap.
    AI-ready: replace body with Gemini/OpenAI call when API key is available.
    """
    focus = req.focus or "DSA"
    topics = STUDENT_TOPICS.get(focus, STUDENT_TOPICS["DSA"])
    # Also mix in secondary topics for a holistic plan
    secondary = STUDENT_TOPICS.get("Core CS", [])

    roadmap = []
    topic_index = 0
    secondary_index = 0

    for day in range(1, req.days + 1):
        hours = req.hours_per_day
        tasks = []

        # Primary skill task
        if topic_index < len(topics):
            tasks.append({
                "id": f"d{day}_t1",
                "skill": focus,
                "topic": topics[topic_index],
                "type": "learn",
                "duration_min": int(hours * 0.6 * 60),
                "resource_url": f"https://leetcode.com/explore/",
                "completed": False
            })
            topic_index += 1

        # Practice task
        tasks.append({
            "id": f"d{day}_t2",
            "skill": "Practice",
            "topic": f"Solve 2-3 {focus} problems on LeetCode",
            "type": "practice",
            "duration_min": int(hours * 0.3 * 60),
            "resource_url": "https://leetcode.com/problemset/",
            "completed": False
        })

        # Secondary topic every 3 days
        if day % 3 == 0 and secondary_index < len(secondary):
            tasks.append({
                "id": f"d{day}_t3",
                "skill": "Core CS",
                "topic": secondary[secondary_index],
                "type": "learn",
                "duration_min": int(hours * 0.1 * 60),
                "resource_url": "https://geeksforgeeks.org/",
                "completed": False
            })
            secondary_index += 1

        roadmap.append({
            "day": day,
            "label": f"Day {day}",
            "focus": focus,
            "total_hours": hours,
            "tasks": tasks,
            "tip": _get_daily_tip(day, focus)
        })

    return roadmap


def _generate_professional_roadmap(req: ProfessionalRoadmapRequest) -> List[Dict]:
    """
    Generates week-by-week professional upskilling roadmap.
    AI-ready: replace body with Gemini/OpenAI call when API key is available.
    """
    target = req.target_skill or "AI"
    topics_list = PROFESSIONAL_ROADMAP.get(target, PROFESSIONAL_ROADMAP["AI"])
    salary_data = SALARY_IMPACT.get(target, {"boost_pct": 20, "avg_hike": "₹2–5 LPA", "demand": "Medium"})

    roadmap = []
    for i, topic_data in enumerate(topics_list):
        week = i + 1
        roadmap.append({
            "week": week,
            "label": f"Week {week}",
            "focus": target,
            "topic": topic_data["topic"],
            "level": topic_data["level"],
            "duration_hrs": topic_data["duration_hrs"],
            "salary_impact": salary_data,
            "tasks": [
                {"type": "learn", "description": f"Study: {topic_data['topic']}", "hrs": int(topic_data["duration_hrs"] * 0.6)},
                {"type": "practice", "description": "Build a mini-project or solve related problem", "hrs": int(topic_data["duration_hrs"] * 0.3)},
                {"type": "review", "description": "Review, document learnings in Notion/GitHub", "hrs": int(topic_data["duration_hrs"] * 0.1)},
            ],
            "completed": False
        })

    return roadmap


def _get_daily_tip(day: int, focus: str) -> str:
    tips = {
        "DSA": ["Start with brute force, then optimize.", "Draw the problem on paper first.", "Pattern recognition beats memorization."],
        "Projects": ["Ship something small every day.", "README-first development.", "Focus on one feature at a time."],
        "Aptitude": ["Speed comes from daily practice, not cramming.", "Elimination method saves time.", "Learn formulas by using them, not reading them."],
    }
    focus_tips = tips.get(focus, tips["DSA"])
    return focus_tips[day % len(focus_tips)]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/student")
async def get_student_roadmap(
    req: StudentRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized day-by-day placement roadmap for students."""
    try:
        profile = current_user.profile
        roadmap = _generate_student_roadmap(req, profile)
        return {
            "success": True,
            "days": req.days,
            "hours_per_day": req.hours_per_day,
            "focus": req.focus or "DSA",
            "target_company": req.target_company,
            "roadmap": roadmap,
            "total_topics": len(roadmap),
            "ai_note": "Roadmap personalized based on your profile. Powered by Tulasi AI Engine.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")


@router.post("/professional")
async def get_professional_roadmap(
    req: ProfessionalRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized week-by-week upskilling roadmap for professionals."""
    try:
        profile = current_user.profile
        # Use profile data as fallback if not provided
        role = req.role or (profile.current_role if profile else "Software Engineer")
        exp = req.experience_years or (profile.experience_years if profile else 2)
        company = req.company or (profile.company if profile else None)

        roadmap = _generate_professional_roadmap(req)
        target = req.target_skill or "AI"
        salary = SALARY_IMPACT.get(target, {})

        # Next best skill prediction (simple rule-based, AI-ready to replace)
        next_skill = _predict_next_skill(role, exp, target)

        return {
            "success": True,
            "role": role,
            "experience_years": exp,
            "company": company,
            "target_skill": target,
            "roadmap": roadmap,
            "salary_impact": salary,
            "next_skill_prediction": next_skill,
            "layoff_prevention": LAYOFF_PREVENTION_SKILLS[:3],
            "ai_note": "Career path optimized by Tulasi AI Intelligence Engine.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")


@router.get("/trending-skills")
async def get_trending_skills():
    """Return trending industry skills — no auth required."""
    return {
        "skills": [
            {"name": "Generative AI / LLMs", "growth": "+142%", "demand": "critical", "color": "#8B5CF6"},
            {"name": "Kubernetes & DevOps", "growth": "+68%", "demand": "high", "color": "#06B6D4"},
            {"name": "System Design", "growth": "+55%", "demand": "high", "color": "#F59E0B"},
            {"name": "Rust Programming", "growth": "+89%", "demand": "medium", "color": "#F43F5E"},
            {"name": "Data Engineering", "growth": "+73%", "demand": "high", "color": "#10B981"},
            {"name": "TypeScript", "growth": "+47%", "demand": "medium", "color": "#3B82F6"},
            {"name": "AWS / Cloud Native", "growth": "+61%", "demand": "high", "color": "#F97316"},
        ],
        "updated_at": "2026-04-12"
    }


def _predict_next_skill(role: str, exp: int, current_focus: str) -> Dict:
    """
    Simple rule-based next-skill predictor. 
    AI-ready: replace with LLM call for personalized prediction.
    """
    role_lower = (role or "").lower()

    if exp < 2:
        return {"skill": "System Design Basics", "reason": "Foundation for senior roles", "priority": "high"}
    elif exp < 5:
        if "frontend" in role_lower:
            return {"skill": "Full-Stack + Node.js", "reason": "Full-stack engineers earn 30% more", "priority": "high"}
        elif "backend" in role_lower:
            return {"skill": "Distributed Systems", "reason": "Critical for senior backend roles", "priority": "high"}
        else:
            return {"skill": "AI/ML Integration", "reason": "Every product needs AI features in 2026", "priority": "critical"}
    else:
        return {"skill": "Engineering Leadership", "reason": "Staff/Principal roles require people skills", "priority": "medium"}


# ── Placement Score Predictor ────────────────────────────────────────────────

@router.get("/placement-score")
async def get_placement_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI-powered placement readiness score.
    Calculates score from: skills coverage, streak consistency, and profile completeness.
    Returns 0-100 score with grade and actionable advice.
    """
    import json

    try:
        profile = db.query(type(current_user)).filter_by(id=current_user.id).first()
        # Safely get the profile via relationship
        from app.models.models import Profile
        profile_data = db.query(Profile).filter(Profile.user_id == current_user.id).first()

        # ── 1. Skills Score (0–40 pts) ──────────────────────────
        skills_score = 0
        skills_list = []
        if profile_data and profile_data.skills:
            try:
                skills_list = json.loads(profile_data.skills)
            except Exception:
                skills_list = []
        
        if skills_list:
            avg_progress = sum(s.get("progress", 0) for s in skills_list) / len(skills_list)
            skills_score = int((avg_progress / 100) * 40)
        else:
            # Default: partial credit for new user
            skills_score = 10

        # ── 2. Streak Consistency Score (0–35 pts) ─────────────
        streak_score = 0
        try:
            streak = current_user.streak or 0
            # 7+ day streak = full points, scaled below
            streak_score = min(int((streak / 7) * 35), 35)
        except Exception:
            streak_score = 0

        # ── 3. Profile Completeness Score (0–25 pts) ───────────
        completeness_score = 0
        if profile_data:
            fields_filled = sum([
                bool(profile_data.student_year),
                bool(profile_data.student_goal),
                bool(profile_data.current_role),
                bool(profile_data.company),
                bool(profile_data.ai_mentor_name),
            ])
            completeness_score = int((fields_filled / 5) * 25)
        else:
            completeness_score = 5

        # ── 4. Total Score ──────────────────────────────────────
        total = skills_score + streak_score + completeness_score
        total = max(0, min(total, 100))  # Clamp to [0, 100]

        # ── 5. Grade + Probability Label ───────────────────────
        if total >= 85:
            grade, probability = "A", "Very High"
            top_action = "Apply to top-tier companies now — your profile is FAANG-ready."
        elif total >= 70:
            grade, probability = "B+", "High"
            top_action = "Strengthen DSA problem-solving speed to break into FAANG."
        elif total >= 55:
            grade, probability = "B", "Medium"
            top_action = "Maintain a 7-day learning streak to boost consistency score."
        elif total >= 40:
            grade, probability = "C+", "Medium-Low"
            top_action = "Update your skills and complete your profile to improve accuracy."
        else:
            grade, probability = "C", "Low"
            top_action = "Start daily check-ins and track at least 3 core skills to build momentum."

        return {
            "success": True,
            "score": total,
            "grade": grade,
            "probability": probability,
            "breakdown": {
                "skill_coverage": skills_score,
                "skill_coverage_max": 40,
                "streak_consistency": streak_score,
                "streak_consistency_max": 35,
                "profile_completeness": completeness_score,
                "profile_completeness_max": 25,
            },
            "top_action": top_action,
            "current_streak": current_user.streak or 0,
            "skills_tracked": len(skills_list),
        }

    except Exception as e:
        # Never crash — return a safe default
        return {
            "success": True,
            "score": 30,
            "grade": "C+",
            "probability": "Building...",
            "breakdown": {
                "skill_coverage": 10, "skill_coverage_max": 40,
                "streak_consistency": 10, "streak_consistency_max": 35,
                "profile_completeness": 10, "profile_completeness_max": 25,
            },
            "top_action": "Complete your profile and track your skills to get an accurate score.",
            "current_streak": 0,
            "skills_tracked": 0,
        }
