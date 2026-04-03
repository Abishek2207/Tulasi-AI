from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
import json

from app.api.deps import get_current_user
from app.core.database import get_session
from app.models.models import User, PrepPlan
from app.core.ai_router import get_ai_response

router = APIRouter()

class GeneratePrepRequest(BaseModel):
    role: str
    duration_months: int

@router.post("/generate")
def generate_prep_plan(
    req: GeneratePrepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    target = req.role or current_user.target_role or "Software Engineering"
    demographic = f"They are a {current_user.user_type} with {current_user.xp} platform XP."
    
    prompt = f"""You are an elite career technical advisor. A student wants to prepare for a "{target}" role in {req.duration_months} months.
{demographic} Customize the difficulty and core topics to strictly match their current level.
Create a detailed week-by-week preparation plan.
Output strictly as a valid JSON object matching this schema:
{{
  "title": "Prep for {req.role}",
  "weeks": [
    {{
      "week": 1,
      "focus": "Topic name",
      "tasks": ["Task 1", "Task 2"]
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
        plan_data = json.loads(response_str)

        new_plan = PrepPlan(
            user_id=current_user.id,
            role=req.role,
            duration=f"{req.duration_months} Months",
            plan_json=json.dumps(plan_data)
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)

        return {"plan": plan_data, "id": new_plan.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error generating plan: {str(e)}")

@router.get("/my-plans")
def get_my_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    plans = db.exec(select(PrepPlan).where(PrepPlan.user_id == current_user.id)).all()
    return {"plans": [{"id": p.id, "role": p.role, "duration": p.duration, "plan": json.loads(p.plan_json)} for p in plans]}

@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    plan = db.get(PrepPlan, plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(404, "Plan not found")
    
    db.delete(plan)
    db.commit()
    return {"success": True}
