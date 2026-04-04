from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json
from datetime import datetime
from typing import Any, Optional, List
from functools import lru_cache

from app.core.config import settings
from app.core.database import get_session
from app.api.deps import get_current_user
from app.models.models import User, Roadmap, RoadmapStep, ActivityLog, UserProgress
from sqlmodel import Session, select
from app.api.roadmap_data import ROADMAPS
from app.api.activity import log_activity_internal
from app.core.ai_router import resilient_ai_response

router = APIRouter()

# ── 🗺️ High-Fidelity Roadmaps Fallback ──
ROADMAP_FALLBACKS = {
    "AI Engineer": {
        "title": "Elite AI Engineer Roadmap",
        "description": "Master the transition from traditional software into world-class AI systems and large language models.",
        "estimated_months": 8,
        "milestones": [
            {"phase": "1", "title": "Math & Neural Foundations", "duration": "Month 1", "topics": ["Linear Algebra", "Calculus", "Probability", "Neural Networks"], "project_idea": "Build a neural network from scratch in NumPy", "resources": [{"name": "3Blue1Brown ML", "url": "https://youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi"}]},
            {"phase": "2", "title": "Deep Learning Mastery", "duration": "Month 2-3", "topics": ["CNNs", "RNNs", "Transformers", "PyTorch/TensorFlow"], "project_idea": "Image Classifier with Transfer Learning", "resources": [{"name": "Fast.ai", "url": "https://course.fast.ai"}]},
            {"phase": "3", "title": "LLM & GenAI Systems", "duration": "Month 4-5", "topics": ["Attention Mechanism", "Fine-tuning", "RAG", "Vector DBs"], "project_idea": "Build a custom RAG-based Chatbot", "resources": [{"name": "DeepLearning.AI GenAI", "url": "https://www.deeplearning.ai/"}]},
            {"phase": "4", "title": "MLOps & Scale", "duration": "Month 6", "topics": ["Model Monitoring", "CI/CD for ML", "Inference Opt", "Docker"], "project_idea": "Deploy model using FastAPI and Docker", "resources": [{"name": "Made with ML", "url": "https://madewithml.com"}]},
            {"phase": "5", "title": "FAANG-Level AI Prep", "duration": "Month 7-8", "topics": ["System Design for ML", "Research Papers", "Mock Interviews"], "project_idea": "End-to-end AI System Design document", "resources": [{"name": "Chip Huyen Blog", "url": "https://huyenchip.com/blog/"}]}
        ]
    },
    "Software Engineer": {
        "title": "Senior Software Architect Roadmap",
        "description": "The definitive path from writing code to designing scalable, reliable distributed systems.",
        "estimated_months": 6,
        "milestones": [
            {"phase": "1", "title": "Advanced DSA & Patterns", "duration": "Month 1", "topics": ["Complex Graphs", "DP", "Concurrency", "Design Patterns"], "project_idea": "High-performance data processor", "resources": [{"name": "NeetCode", "url": "https://neetcode.io"}]},
            {"phase": "2", "title": "Backend Mastery", "duration": "Month 2", "topics": ["Advanced SQL", "Caching", "Messaging Queues", "gRPC"], "project_idea": "Distributed task queue", "resources": [{"name": "ByteByteGo", "url": "https://bytebytego.com"}]},
            {"phase": "3", "title": "System Design (HLD)", "duration": "Month 3-4", "topics": ["Scalability", "Sharding", "Consensus (Raft/Paxos)", "Availability"], "project_idea": "Design a global URL shortener", "resources": [{"name": "Grokking System Design", "url": "https://designguru.io"}]},
            {"phase": "4", "title": "Infrastructure & Observability", "duration": "Month 5", "topics": ["Kubernetes", "Prometheus", "Terraform", "CI/CD"], "project_idea": "Auto-scaling k8s cluster setup", "resources": [{"name": "Nana's K8s", "url": "https://youtube.com/@TechWorldwithNana"}]},
            {"phase": "5", "title": "Leadership & Interview Prep", "duration": "Month 6", "topics": ["Architecture Review", "STAR Method", "SDLC Management"], "project_idea": "Full-scale technical design review", "resources": [{"name": "Exponent", "url": "https://tryexponent.com"}]}
        ]
    }
}


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

    # Universal Resilience: Never 500
    fallback_data = ROADMAP_FALLBACKS.get(req.goal) or ROADMAP_FALLBACKS.get(current_user.target_role) or ROADMAP_FALLBACKS["Software Engineer"]
    # Ensure title/desc are dynamic in fallback
    fallback_data = fallback_data.copy()
    fallback_data["title"] = f"Roadmap for {req.goal}"
    
    roadmap_data = resilient_ai_response(prompt, fallback=fallback_data)
    
    try:
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
    except Exception as e:
        session.rollback()
        # Fallback to pure JSON return if DB fails (unlikely, but safe)
        return {"roadmap": roadmap_data, "is_fallback": True, "error": str(e)}


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
