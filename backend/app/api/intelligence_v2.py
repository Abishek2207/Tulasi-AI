"""
Intelligence V2 — Career GPS + Daily Plan + Salary Intel + AGI Mentor
Super-personalized AI routes for TulasiAI's career intelligence layer.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional, List
import json, re

from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, ActivityLog, PersistentInterviewSession
from app.core.rate_limit import limiter
from app.core.ai_router import resilient_ai_response


router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────
class CareerGPSRequest(BaseModel):
    year: str          # 1st_year | 2nd_year | 3rd_year | 4th_year | professional
    target_role: str   # AI Engineer | Software Engineer | Data Scientist | etc.
    current_skills: Optional[str] = ""

class SalaryRequest(BaseModel):
    role: str
    location: str
    yoe: int = 0       # Years of experience

class MentorRequest(BaseModel):
    question: str
    mode: str = "career"  # career | technical | interview | motivation

class RAGChatRequest(BaseModel):
    message: str
    media: Optional[str] = None


# ── FALLBACK GENERATORS (always succeed) ────────────────────────────────────

def _make_gps_fallback(role: str, year: str) -> dict:
    """Role-aware Career GPS fallback — returned when AI is unavailable."""
    role_skills = {
        "AI Engineer": ["Python", "PyTorch", "LLM Fine-tuning", "MLOps", "Vector DBs"],
        "AI Research Scientist": ["Python", "Research Papers", "JAX/PyTorch", "Mathematics", "Deep Learning"],
        "Software Engineer": ["Python/Java", "Data Structures", "System Design", "SQL", "Git"],
        "Data Scientist": ["Python", "Statistics", "ML Algorithms", "Pandas", "SQL"],
        "ML Engineer": ["Python", "TensorFlow", "Kubernetes", "MLflow", "Docker"],
        "Full Stack Developer": ["React", "Node.js", "PostgreSQL", "TypeScript", "Docker"],
        "DevOps Engineer": ["Kubernetes", "Docker", "CI/CD", "Terraform", "AWS"],
        "Product Manager": ["Product Strategy", "SQL", "User Research", "Agile", "Analytics"],
        "Cybersecurity Engineer": ["Penetration Testing", "SIEM", "Python", "Network Security", "Cloud Security"],
        "Cloud Architect": ["AWS/GCP/Azure", "Kubernetes", "Terraform", "Microservices", "Security"],
    }
    skills = role_skills.get(role, ["Python", "Data Structures", "System Design", "SQL", "Git"])

    year_offsets = {
        "1st_year": 0, "2nd_year": 1, "3rd_year": 2, "4th_year": 3, "professional": 4
    }
    offset = year_offsets.get(year, 2)

    return {
        "paths": [
            {
                "id": "fast_track",
                "title": f"Fast Track to {role}",
                "tagline": "Aggressive sprint — compress 12 months into 6 with focused intensity.",
                "color": "#8B5CF6",
                "timeline_months": max(4, 6 - offset),
                "difficulty": "Aggressive",
                "milestones": [
                    {"month": 1, "goal": f"Master core {skills[0]} fundamentals", "resources": ["LeetCode", "GeeksForGeeks", "YouTube: Striver"]},
                    {"month": 3, "goal": f"Build 2 {role} portfolio projects", "resources": ["GitHub", "Vercel", "Render"]},
                    {"month": max(4, 6 - offset), "goal": "Land first offer / internship", "resources": ["LinkedIn", "Naukri", "AngelList"]},
                ],
                "key_skills": skills[:4],
                "companies": ["TCS", "Infosys", "Cognizant"],
                "job_readiness_pct": 72,
            },
            {
                "id": "balanced",
                "title": f"Balanced {role} Excellence",
                "tagline": "Steady mastery — depth over speed, quality over shortcuts.",
                "color": "#10B981",
                "timeline_months": 9,
                "difficulty": "Balanced",
                "milestones": [
                    {"month": 2, "goal": "Complete DSA + CS Fundamentals", "resources": ["CS50", "CLRS", "Neetcode 150"]},
                    {"month": 5, "goal": f"Full-stack {role} project deployment", "resources": ["Next.js Docs", "Supabase", "Docker Docs"]},
                    {"month": 9, "goal": "Clear interviews at mid-tier to top-tier companies", "resources": ["Pramp", "InterviewBit", "Exponent"]},
                ],
                "key_skills": skills,
                "companies": ["Zoho", "Freshworks", "Razorpay", "Zomato"],
                "job_readiness_pct": 82,
            },
            {
                "id": "conservative",
                "title": "Thorough Mastery Route",
                "tagline": "FAANG-caliber depth — 12 months of relentless mastery.",
                "color": "#F59E0B",
                "timeline_months": 12,
                "difficulty": "Conservative",
                "milestones": [
                    {"month": 3, "goal": f"Solid {skills[0]} + OOP + DSA foundation", "resources": ["Neetcode", "Striver A2Z DSA", "MIT OCW"]},
                    {"month": 6, "goal": "System Design mastery (LLD + HLD)", "resources": ["Grokking System Design", "DDIA Book", "Engineering blogs"]},
                    {"month": 12, "goal": "FAANG/Research Lab interview readiness", "resources": ["LeetCode Premium", "Pramp", "Mock interviews"]},
                ],
                "key_skills": skills + ["System Design", "Distributed Systems"],
                "companies": ["Google", "Microsoft", "Amazon", "Meta"],
                "job_readiness_pct": 91,
            },
        ],
        "recommendation": "balanced",
        "founder_note": f"Every great {role} started exactly where you are now. Trust the process, stay consistent, and Tulasi AI will guide every single step of your journey. — Abishek R, Founder",
    }


def _make_salary_fallback(role: str, location: str, yoe: int) -> dict:
    """Location + role aware salary fallback."""
    role_bases = {
        "AI Engineer": 12, "ML Engineer": 11, "Data Scientist": 9,
        "Software Engineer": 7, "Full Stack Developer": 7, "Backend Developer": 8,
        "Frontend Developer": 6, "DevOps Engineer": 9, "Cloud Architect": 14,
        "Product Manager": 10, "Cybersecurity Engineer": 10,
        "AI Research Scientist": 15,
    }
    location_multipliers = {
        "Bangalore": 1.2, "Hyderabad": 1.1, "Chennai": 1.0, "Pune": 1.05,
        "Mumbai": 1.15, "Delhi NCR": 1.1, "Remote (India)": 1.0,
        "USA": 5.0, "UK": 3.5, "Singapore": 3.0,
    }
    base = role_bases.get(role, 8) + (yoe * 2.5)
    mult = location_multipliers.get(location, 1.0)
    min_lpa = round(base * mult * 0.7, 1)
    med_lpa = round(base * mult, 1)
    max_lpa = round(base * mult * 2.2, 1)

    return {
        "role": role,
        "location": location,
        "yoe": yoe,
        "salary_range": {
            "min_lpa": min_lpa, "median_lpa": med_lpa,
            "max_lpa": max_lpa, "currency": "INR", "unit": "LPA"
        },
        "market_percentiles": {
            "p25": round(min_lpa * 1.1, 1),
            "p50": med_lpa,
            "p75": round(med_lpa * 1.4, 1),
            "p90": max_lpa,
        },
        "top_paying_companies": [
            {"company": "Google India", "range": f"\u20b9{round(max_lpa*0.8)}-{round(max_lpa)} LPA", "perks": "ESOP + Annual Bonus + Relocation"},
            {"company": "Microsoft India", "range": f"\u20b9{round(max_lpa*0.65)}-{round(max_lpa*0.85)} LPA", "perks": "RSU + Performance Bonus"},
            {"company": "Flipkart / Meesho", "range": f"\u20b9{round(med_lpa*1.2)}-{round(max_lpa*0.7)} LPA", "perks": "Variable Pay + ESOPs"},
            {"company": "Razorpay / Zepto", "range": f"\u20b9{round(med_lpa)}-{round(max_lpa*0.6)} LPA", "perks": "Startup ESOPs + Fast Growth"},
        ],
        "negotiation_script": {
            "opening": f"Based on 2025 market data, {role}s in {location} with {yoe} YOE earn \u20b9{med_lpa}-{round(max_lpa*0.7)} LPA. My skills and projects align with the senior end of this range.",
            "counter_offer": f"I appreciate the offer. Given my direct expertise and the market benchmarks I've researched, could we bring the base to \u20b9{round(med_lpa*1.25)} LPA? I'm confident in delivering outsized value from day one.",
            "close": "I'm excited about the team and the mission. With this compensation aligned, I'm ready to sign and contribute immediately — let's make this happen.",
        },
        "key_insights": [
            f"Demand for {role}s in {location} grew 38% in 2025, driven by AI adoption",
            "Cloud certifications (AWS/GCP/Azure) boost packages by 20-30% on average",
            f"Senior {role}s command 2-3x entry-level packages in {location}",
        ],
        "skills_that_boost_salary": ["LLMs & GenAI", "System Design", "Cloud Architecture", "Kubernetes", "Rust/Go"],
        "market_trend": "growing",
        "trend_note": f"{role} roles in {location} see strong demand as companies accelerate AI-first digital transformation. Compensation is rising year-over-year.",
    }


# ── CAREER GPS ─────────────────────────────────────────────────────────────────
@router.post("/career-gps")
@limiter.limit("10/minute")
def get_career_gps(
    request: Request,
    body: CareerGPSRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate 3 personalized career paths with timelines based on year and target role."""

    year_context = {
        "1st_year": "a first-year engineering student (just started college). Focus on fundamentals.",
        "2nd_year": "a second-year student. Introduce DSA, projects, open source.",
        "3rd_year": "a third-year student ready for internships and advanced topics.",
        "4th_year": "a final-year student preparing for campus placements and full-time offers.",
        "professional": "a working professional looking to upskill or switch roles.",
    }.get(body.year, "an engineering student")

    skills_context = f"Current skills: {body.current_skills}" if body.current_skills else "Skills not specified — provide general guidance."

    prompt = f"""You are TulasiAI's Career GPS — a world-class AI career strategist.

STUDENT PROFILE:
- Year: {body.year} ({year_context})
- Target Role: {body.target_role}
- {skills_context}

Generate EXACTLY 3 distinct career paths to become a {body.target_role}, tailored for this student's current year.

Return ONLY valid JSON with this exact structure:
{{
  "paths": [
    {{
      "id": "fast_track",
      "title": "<path name>",
      "tagline": "<1 sentence hook>",
      "color": "#8B5CF6",
      "timeline_months": <integer>,
      "difficulty": "Aggressive|Balanced|Conservative",
      "milestones": [
        {{"month": 1, "goal": "<specific milestone>", "resources": ["<resource 1>", "<resource 2>"]}},
        {{"month": 3, "goal": "<specific milestone>", "resources": ["<resource 1>", "<resource 2>"]}},
        {{"month": 6, "goal": "<specific milestone>", "resources": ["<resource 1>"]}},
        {{"month": <end>, "goal": "<final goal>", "resources": []}}
      ],
      "key_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
      "companies": ["<company 1>", "<company 2>", "<company 3>"],
      "job_readiness_pct": <integer 60-100>
    }},
    ... (repeat for 2 more paths with ids "balanced" and "conservative")
  ],
  "recommendation": "fast_track|balanced|conservative",
  "founder_note": "<1-2 sentence personal note from Abishek R (founder of TulasiAI) to this student>"
}}

Make it highly specific to {body.target_role}. Include real resources (LeetCode, Coursera, fast.ai, etc.).
The 3 paths should genuinely differ in timeline and approach."""

    # Always return resilient AI result with high-fidelity fallback
    result = resilient_ai_response(
        prompt, 
        fallback=_make_gps_fallback(body.target_role, body.year)
    )


    # Log activity (best-effort)
    try:
        db.add(ActivityLog(
            user_id=current_user.id,
            action_type="career_gps_generated",
            title=f"Career GPS: {body.target_role} ({body.year})",
            xp_earned=5,
        ))
        current_user.xp = (current_user.xp or 0) + 5
        db.add(current_user)
        db.commit()
    except Exception:
        pass

    return result


# ── DAILY PLAN ─────────────────────────────────────────────────────────────────
@router.get("/daily-plan")
@limiter.limit("5/minute")
def get_daily_plan(
    request: Request,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate a personalized study plan for today based on user's profile."""
    recent_activity = db.exec(
        select(ActivityLog)
        .where(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
    ).all()

    activity_summary = ", ".join([a.action_type.replace("_", " ") for a in recent_activity]) or "No recent activity"

    prompt = f"""You are TulasiAI's Daily Intelligence Engine.

USER PROFILE:
- Name: {current_user.name or "Student"}
- XP: {current_user.xp or 0}
- Streak: {current_user.streak or 0} days
- Target Role: {current_user.target_role or "Software Engineer"}
- Year Type: {current_user.user_type or "student"}
- Recent Activity: {activity_summary}

Generate a focused, achievable study plan for TODAY. Return ONLY valid JSON:
{{
  "greeting": "<personalized greeting>",
  "focus_theme": "<theme>",
  "tasks": [
    {{"id": 1, "task": "<task>", "duration_mins": 30, "priority": "high", "type": "coding", "link": null}}
  ],
  "daily_quote": "<quote>",
  "xp_potential": 150,
  "streak_note": "<note>"
}}"""

    fallback = {
        "greeting": f"Good day, {current_user.name or 'Champion'}! Ready to build something great?",
        "focus_theme": "Consistent Progress",
        "tasks": [
            {"id": 1, "task": "Solve 2 LeetCode Easy problems", "duration_mins": 45, "priority": "high", "type": "coding", "link": "https://leetcode.com"},
            {"id": 2, "task": "Review your system design notes", "duration_mins": 30, "priority": "medium", "type": "review", "link": None},
            {"id": 3, "task": "Complete today's ORBIT DAILY challenge", "duration_mins": 20, "priority": "high", "type": "practice", "link": "/dashboard/daily-challenge"},
            {"id": 4, "task": "Watch one AI/tech YouTube video", "duration_mins": 25, "priority": "low", "type": "learning", "link": "https://youtube.com"},
        ],
        "daily_quote": "\"The best way to predict the future is to invent it.\" — Alan Kay",
        "xp_potential": 150,
        "streak_note": f"You're on a {current_user.streak or 0}-day streak. Keep going!" if current_user.streak else None,
    }
    
    return resilient_ai_response(prompt, fallback=fallback)


# ── NEXT BEST TASK ─────────────────────────────────────────────────────────────
@router.get("/next-task")
def get_next_task(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Single best next action for the user right now."""
    xp = current_user.xp or 0
    streak = current_user.streak or 0
    target = current_user.target_role or "Software Engineer"

    if streak == 0:
        task = {"action": "Start your streak!", "href": "/dashboard/daily-challenge", "reason": "Complete the ORBIT DAILY to begin your learning streak.", "xp": 50, "icon": "\U0001f525"}
    elif xp < 200:
        task = {"action": "Solve your first coding problem", "href": "/dashboard/code", "reason": "Code Practice builds the DSA foundation every tech role requires.", "xp": 30, "icon": "\U0001f4bb"}
    elif xp < 500:
        task = {"action": "Run a Mock Interview", "href": "/dashboard/interview", "reason": f"Practice for a {target} role. Real-time AI feedback helps you improve fast.", "xp": 100, "icon": "\U0001f3af"}
    else:
        task = {"action": "Design a System", "href": "/dashboard/system-design", "reason": "System Design is the final boss. Start your Socratic Architect session.", "xp": 75, "icon": "\U0001f9e0"}

    return {"next_task": task, "current_xp": xp, "current_streak": streak}


# ── SALARY INTELLIGENCE ─────────────────────────────────────────────────────────
@router.post("/salary-intel")
@limiter.limit("10/minute")
def get_salary_intel(
    request: Request,
    body: SalaryRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Market salary intelligence + negotiation playbook for a given role/location/experience."""

    prompt = f"""You are TulasiAI's Salary Intelligence Engine — a compensation expert with deep knowledge of Indian and global tech markets.

QUERY:
- Role: {body.role}
- Location: {body.location}
- Years of Experience: {body.yoe}

Provide a comprehensive salary intelligence report. Return ONLY valid JSON:
{{
  "role": "{body.role}",
  "location": "{body.location}",
  "yoe": {body.yoe},
  "salary_range": {{
    "min_lpa": 8, "median_lpa": 12, "max_lpa": 25, "currency": "INR", "unit": "LPA"
  }},
  "market_percentiles": {{ "p25": 9, "p50": 12, "p75": 18, "p90": 25 }},
  "top_paying_companies": [
    {{"company": "Google", "range": "30-50 LPA", "perks": "Equity"}}
  ],
  "negotiation_script": {{
    "opening": "Script", "counter_offer": "Script", "close": "Script"
  }},
  "key_insights": ["Insight 1"],
  "skills_that_boost_salary": ["Skill 1"],
  "market_trend": "growing",
  "trend_note": "Growing"
}}"""

    return resilient_ai_response(
        prompt, 
        fallback=_make_salary_fallback(body.role, body.location, body.yoe)
    )


# ── AGI MENTOR ─────────────────────────────────────────────────────────────────
@router.post("/ask-mentor")
@limiter.limit("20/minute")
def ask_mentor(
    request: Request,
    body: MentorRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Personal AI mentor that switches modes: career, technical, interview, motivation."""

    mode_prompts = {
        "career": f"You are a world-class career strategist and mentor. Give direct, specific, actionable career advice. The user is targeting: {current_user.target_role or 'Software Engineering'}.",
        "technical": f"You are a Senior Engineer at Google/Meta. Give precise technical answers with code examples where relevant.",
        "interview": f"You are an expert interview coach. Give STAR-method answers.",
        "motivation": f"You are a motivational mentor.",
    }

    system_context = mode_prompts.get(body.mode, mode_prompts["career"])
    prompt = f"{system_context}\n\nUser asks: {body.question}"

    fallback = {
        "response": f"I'm momentarily recalibrating my neural pathways. Your question is important — please try again in 30 seconds.",
        "mode": body.mode,
        "mentor_name": "TULASI INTELLIGENCE",
    }
    
    return resilient_ai_response(prompt, fallback=fallback, is_json=False)


@router.post("/chat")
@limiter.limit("20/minute")
def rag_chat(
    request: Request,
    body: RAGChatRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Strict RAG-based AI Chat for TulasiAI."""
    # 1. Embed Query (Simulated via RAG agent retrieval if implemented, or direct retrieval)
    # Using the resilient AI router with a context injection template
    
    # Normally we'd call a ChromaDB or Pinecone instance here:
    # context = vector_store.similarity_search(body.message)
    context = "TulasiAI is an AI-powered student platform offering internships, hackathons, and a platinum messaging engine."
    
    # 2. Inject context
    system_prompt = (
        "You are TulasiAI Support embedded in the chat system. "
        "Strictly answer the user's question using ONLY the provided context.\n"
        f"CONTEXT: {context}"
    )
    
    full_prompt = f"{system_prompt}\n\nUser Message: {body.message}"
    
    # 3. Generate Answer
    return resilient_ai_response(
        full_prompt,
        fallback={"response": "I am currently unable to retrieve the documents required to answer this. Please try again."},
        is_json=False
    )
# ── USER INTELLIGENCE PROFILE ──────────────────────────────────────────────────
@router.get("/profile")
def get_intelligence_profile(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return the user's AI intelligence profile."""
    try:
        profile = json.loads(current_user.user_intelligence_profile or "{}")
        patterns = json.loads(current_user.behavioral_patterns or "{}")
    except Exception:
        profile = {}
        patterns = {}

    return {
        "profile": profile,
        "patterns": patterns,
        "user": {
            "name": current_user.name,
            "xp": current_user.xp,
            "streak": current_user.streak,
            "target_role": current_user.target_role,
            "user_type": current_user.user_type,
            "department": current_user.department,
        }
    }
