from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from typing import Any
from functools import lru_cache

from app.core.config import settings
from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, Roadmap, RoadmapStep, ActivityLog, UserProgress
from sqlmodel import Session, select
from app.api.roadmap_data import ROADMAPS
from app.api.activity import log_activity_internal
from app.core.ai_router import get_ai_response

router = APIRouter()

class RoadmapRequest(BaseModel):
    goal: str

class MilestoneProgressRequest(BaseModel):
    roadmap_id: str
    milestone_id: str




@router.post("/generate")
def generate_roadmap(
    req: RoadmapRequest, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Fetch intelligence context
    intelligence = json.loads(current_user.user_intelligence_profile or "{}")
    user_context = (
        f"USER: {current_user.user_type}, Role: {current_user.target_role or 'General SE'}, Level: {current_user.level}. "
        f"STRENGTHS: {intelligence.get('strengths', [])}. GAPS: {intelligence.get('gaps', [])}."
    )
    
    prompt = f"""You are an elite career technical advisor. A student wants to become a "{req.goal}". 
User Context: {user_context}

Create a detailed, step-by-step learning roadmap divided into exactly 5 logical phases/milestones.
IMPORTANT: Tailor symbols, depth, and starting point to their STRENGTHS and GAPS. If they have gaps in fundamental logic, start there. 
If they match the role already, provide advanced, elite MAANG-level scaling challenges.

Output strictly as a valid JSON object matching this exact schema:
{{
  "title": "Roadmap to {req.goal}",
  "description": "A 2-sentence highly motivating hook.",
  "estimated_months": 6,
  "milestones": [
    {{
      "phase": "1",
      "title": "Name of Phase",
      "duration": "e.g. Weeks 1-4",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "project_idea": "A small project to cement learning for this phase",
      "resources": [
        {{"name": "Course Title", "url": "https://youtube.com/something"}},
        {{"name": "Official Docs", "url": "https://..."}}
      ]
    }}
  ]
}}

Return ONLY raw JSON, nothing else."""

    try:
        response_str = get_ai_response(prompt, force_model="complex_reasoning")
        import re
        match = re.search(r'\{.*\}', response_str, re.DOTALL)
        if match:
            response_str = match.group()
        
        roadmap_data = json.loads(response_str)
        
        # Save to DB
        new_roadmap = Roadmap(
            user_id=current_user.id,
            goal=req.goal,
            title=roadmap_data.get("title", f"Roadmap for {req.goal}"),
            description=roadmap_data.get("description", ""),
            estimated_months=roadmap_data.get("estimated_months", 6)
        )
        session.add(new_roadmap)
        session.commit()
        session.refresh(new_roadmap)
        
        # Save steps
        for m in roadmap_data.get("milestones", []):
            step = RoadmapStep(
                roadmap_id=new_roadmap.id,
                phase=str(m.get("phase", "")),
                title=m.get("title", ""),
                duration=m.get("duration", ""),
                topics_json=json.dumps(m.get("topics", [])),
                project_idea=m.get("project_idea", ""),
                resources_json=json.dumps(m.get("resources", []))
            )
            session.add(step)
        
        session.commit()
        
        return {"roadmap": roadmap_data, "id": new_roadmap.id}
    except json.JSONDecodeError:
        raise HTTPException(500, "AI failed to generate valid JSON format.")
    except Exception as e:
        session.rollback()
        raise HTTPException(500, f"Error generating roadmap: {str(e)}")

@router.get("/")
def get_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    # Fetch user's completed milestones
    completed_logs = db.exec(
        select(ActivityLog).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action_type == "roadmap_step"
        )
    ).all()
    completed = [log.metadata_json for log in completed_logs if log.metadata_json]

    return {
        "roadmaps": ROADMAPS,
        "completed_milestones": completed
    }

@lru_cache(maxsize=32)
def _get_static_roadmap(id: str):
    return next((r for r in ROADMAPS if r["id"] == id), None)

@router.get("/{id}")
def get_roadmap(id: str, current_user: User = Depends(get_current_user)):
    roadmap = _get_static_roadmap(id)
    if not roadmap:
        raise HTTPException(404, "Roadmap not found")
    return roadmap

@router.post("/progress")
def log_progress(
    req: MilestoneProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    roadmap = next((r for r in ROADMAPS if r["id"] == req.roadmap_id), None)
    if not roadmap:
        raise HTTPException(404, "Roadmap not found")
    
    milestone = next((m for m in roadmap["milestones"] if m["id"] == req.milestone_id), None)
    if not milestone:
        raise HTTPException(404, "Milestone not found")

    # Check if already logged
    query = select(ActivityLog).where(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action_type == "roadmap_step",
        ActivityLog.metadata_json == req.milestone_id
    )
    result = db.exec(query)
    existing_log = result.first()

    if existing_log:
        return {"message": "Milestone already completed"}

    # Use centralized activity logging
    log_activity_internal(
        current_user, db, "roadmap_step", 
        f"Completed {roadmap['title']} milestone: {milestone['name']}",
        req.milestone_id
    )

    # Check if roadmap is fully completed (count existing logs + this new one)
    existing_milestones = db.exec(
        select(ActivityLog).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.action_type == "roadmap_step",
            ActivityLog.title.like(f"%{roadmap['title']}%")
        )
    ).all()
    
    if len(existing_milestones) >= len(roadmap["milestones"]):
        log_activity_internal(
            current_user, db, "roadmap_completed",
            f"Completed Roadmap: {roadmap['title']}",
            req.roadmap_id
        )
    
    db.commit()

    return {"message": "Progress saved", "xp_earned": 30}


# ── Feature #5: Year-wise Roadmap Engine ─────────────────────────────────────

YEAR_ROADMAPS = {
    "1st_year": {"title": "1st Year Foundation Track", "phases": [
        {"week": "1-4",  "focus": "Programming Basics", "topics": ["Python syntax", "Variables & Data types", "Loops & Conditions", "Functions"], "project": "CLI calculator"},
        {"week": "5-8",  "focus": "Problem Solving", "topics": ["Logical thinking", "Basic algorithms", "Math for CS", "Pseudocode"], "project": "Number guessing game"},
        {"week": "9-12", "focus": "Tools & Ecosystem", "topics": ["Git & GitHub", "VS Code setup", "Linux basics", "Markdown"], "project": "Personal GitHub portfolio"},
    ]},
    "2nd_year": {"title": "2nd Year DSA & Projects Track", "phases": [
        {"week": "1-4", "focus": "Data Structures I", "topics": ["Arrays", "Linked Lists", "Stacks & Queues", "Hashing"], "project": "Student record system"},
        {"week": "5-8", "focus": "Web Development", "topics": ["HTML/CSS basics", "JavaScript DOM", "React intro", "REST APIs"], "project": "Portfolio website"},
        {"week": "9-12","focus": "Database & Backend", "topics": ["SQL basics", "SQLite/PostgreSQL", "Python FastAPI", "CRUD apps"], "project": "Task manager full-stack app"},
    ]},
    "3rd_year": {"title": "3rd Year Advanced DSA & Internship Prep", "phases": [
        {"week": "1-4", "focus": "Advanced DSA", "topics": ["Trees & Graphs", "BFS/DFS", "Dynamic Programming", "Greedy Algorithms"], "project": "Pathfinder visualiser"},
        {"week": "5-8", "focus": "Internship Readiness", "topics": ["Resume building", "LeetCode grinding", "Mock interviews", "Communication"], "project": "Optimised resume + 5 LeetCode mediums"},
        {"week": "9-12","focus": "Real-World Systems", "topics": ["System design basics", "API design", "Docker intro", "AWS free tier"], "project": "Deployed REST API"},
    ]},
    "4th_year": {"title": "4th Year Placement & System Design", "phases": [
        {"week": "1-4", "focus": "Placement Prep", "topics": ["Company DSA patterns", "Behavioral STAR method", "Aptitude tests", "HR round prep"], "project": "10 company-specific mock interviews"},
        {"week": "5-8", "focus": "System Design Mastery", "topics": ["Scalability", "Load balancing", "DB sharding", "CAP theorem", "Microservices"], "project": "Design a URL shortener"},
        {"week": "9-12","focus": "Offer & Onboarding Prep", "topics": ["Salary negotiation", "FAANG vs product vs service", "First 90 days plan"], "project": "Career roadmap post-offer"},
    ]},
    "professional": {"title": "Working Professional Upskilling Track", "phases": [
        {"week": "1-4", "focus": "Skill Gap Analysis", "topics": ["Market demand analysis", "AI/ML fundamentals", "System design advanced", "Leadership skills"], "project": "Personal upskilling roadmap"},
        {"week": "5-8", "focus": "Domain Transition", "topics": ["New tech stack", "Open source contributions", "Side projects", "LinkedIn networking"], "project": "One shipped side project"},
        {"week": "9-12","focus": "Job Switch Readiness", "topics": ["Updated resume", "Senior-level interview prep", "Negotiation strategies", "Company research"], "project": "5 targeted job applications"},
    ]},
}

PREP_PLANS = {
    "Software Engineer": {
        "1-month": ["Week 1: Arrays+Strings+Hashing", "Week 2: Trees+Graphs+BFS/DFS", "Week 3: DP+Greedy+Backtracking", "Week 4: System Design basics + Mock interviews"],
        "3-month": ["Month 1: DSA foundations (Easy+Medium LC)", "Month 2: Advanced DSA + System Design", "Month 3: Company-specific prep + 20 mock interviews"],
        "6-month": ["Month 1-2: DSA & Algorithms mastery", "Month 3: System Design depth", "Month 4: Full-stack project + open source", "Month 5: Interview grinding", "Month 6: Offer negotiation prep"],
    },
    "AI/ML Engineer": {
        "1-month": ["Week 1: Python + NumPy + Pandas refresher", "Week 2: ML fundamentals (supervised/unsupervised)", "Week 3: Deep Learning + PyTorch/TensorFlow", "Week 4: MLOps + model deployment + LLM basics"],
        "3-month": ["Month 1: ML/DL theory + Kaggle projects", "Month 2: NLP, Computer Vision, LLM fine-tuning", "Month 3: MLOps, RAG systems, production AI apps"],
        "6-month": ["Month 1-2: ML/DL foundations + projects", "Month 3: Specialise (NLP/CV/RL)", "Month 4: LLMs + RAG + Vector DBs", "Month 5: Production systems + cloud AI", "Month 6: Research + advanced interviews"],
    },
    "Data Analyst": {
        "1-month": ["Week 1: SQL mastery (CTEs, window functions)", "Week 2: Python pandas + EDA", "Week 3: Tableau/Power BI dashboards", "Week 4: Statistics + A/B testing + case studies"],
        "3-month": ["Month 1: SQL + Python data stack", "Month 2: Analytics engineering + dbt + Airflow", "Month 3: Business intelligence + storytelling"],
        "6-month": ["Month 1-2: Data foundations + SQL", "Month 3: Python analytics + ML basics", "Month 4: BI tools + data storytelling", "Month 5: Analytics engineering", "Month 6: Domain specialisation"],
    },
}


@router.get("/year/{user_type}")
def get_year_roadmap(user_type: str, current_user: User = Depends(get_current_user)):
    roadmap_data = YEAR_ROADMAPS.get(user_type)
    if not roadmap_data:
        raise HTTPException(404, f"No roadmap for '{user_type}'. Valid: {list(YEAR_ROADMAPS.keys())}")
    return {"user_type": user_type, "roadmap": roadmap_data}


from pydantic import BaseModel as _BM

class PrepPlanRequest(_BM):
    role: str
    duration: str


@router.post("/prep-plan")
def get_prep_plan(
    req: PrepPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    role_plans = PREP_PLANS.get(req.role)
    if not role_plans:
        raise HTTPException(404, f"No plan for role '{req.role}'. Valid: {list(PREP_PLANS.keys())}")
    duration_plan = role_plans.get(req.duration)
    if not duration_plan:
        raise HTTPException(404, f"Invalid duration '{req.duration}'")

    from app.models.models import PrepPlan
    existing = db.exec(
        select(PrepPlan).where(PrepPlan.user_id == current_user.id, PrepPlan.is_active == True)
    ).first()
    if existing:
        existing.role = req.role
        existing.duration = req.duration
        existing.plan_json = json.dumps(duration_plan)
        db.add(existing)
    else:
        db.add(PrepPlan(user_id=current_user.id, role=req.role, duration=req.duration, plan_json=json.dumps(duration_plan)))
    db.commit()
    return {"role": req.role, "duration": req.duration, "plan": duration_plan}


@router.get("/prep-plan/my")
def get_my_prep_plan(current_user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    from app.models.models import PrepPlan
    plan = db.exec(select(PrepPlan).where(PrepPlan.user_id == current_user.id, PrepPlan.is_active == True)).first()
    if not plan:
        return {"plan": None}
    return {"role": plan.role, "duration": plan.duration, "plan": json.loads(plan.plan_json)}
