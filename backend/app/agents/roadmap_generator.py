import json
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, TypedDict
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.core.ai_client import ai_client
from app.models.models import Goal, Profile, LearningPlan, DailyTask, TaskCompletion, SkillAssessment
from langgraph.graph import StateGraph, START, END

class DailyTaskPlan(BaseModel):
    day: int
    title: str
    description: str
    task_type: str = Field(description="learn, practice, revision, or test")
    estimated_minutes: int

class RoadmapResponse(BaseModel):
    goal: str
    current_level: str
    priority_skills: List[str]
    skill_gaps: List[str]
    learning_sequence: List[str]
    estimated_time: str
    daily_tasks: List[DailyTaskPlan]
    assessment_plan: str
    revision_plan: str

class RoadmapState(TypedDict):
    user_id: int
    profile_data: dict
    goal_data: dict
    assessments: list
    skill_gaps: list
    priority_skills: list
    roadmap_json: str
    final_roadmap: Optional[RoadmapResponse]
    error: Optional[str]

def load_context_node(state: RoadmapState) -> RoadmapState:
    # Load assessments and compute baseline
    # In a real system, we might query external market data APIs here.
    return state

def calculate_gaps_node(state: RoadmapState) -> RoadmapState:
    prompt = f"""
    User Profile: {state['profile_data']}
    Goal: {state['goal_data']}
    Assessments: {state['assessments']}
    
    Identify the exact skill gaps between the user's current profile and their goal.
    Return ONLY a comma separated list of skills.
    """
    response = ai_client.get_response(prompt, force_model="gemini-2.5-flash")
    state['skill_gaps'] = [s.strip() for s in response.split(',')]
    return state

def prioritize_skills_node(state: RoadmapState) -> RoadmapState:
    prompt = f"""
    Goal: {state['goal_data']}
    Skill Gaps: {state['skill_gaps']}
    
    Prioritize the top 3-5 skills to learn first. Return ONLY a comma separated list.
    """
    response = ai_client.get_response(prompt, force_model="gemini-2.5-flash")
    state['priority_skills'] = [s.strip() for s in response.split(',')]
    return state

def generate_roadmap_node(state: RoadmapState) -> RoadmapState:
    prompt = f"""
    You are a Staff Full-Stack Engineer and AI Career Architect.
    Generate a structured, personalized learning roadmap based on the following user data.

    User Context:
    Current Role: {state['profile_data'].get('current_role')}
    Target Role: {state['goal_data'].get('target_role')}
    Target Companies: {state['goal_data'].get('target_companies')}
    Daily Available Minutes: {state['goal_data'].get('daily_minutes')}
    Skill Gaps: {state['skill_gaps']}
    Priority Skills: {state['priority_skills']}

    Generate a detailed day-by-day plan for the next 7 days that bridges their skill gaps.

    OUTPUT FORMAT REQUIREMENTS:
    You must return valid JSON matching this exact Pydantic schema:
    {{
        "goal": "string",
        "current_level": "string",
        "priority_skills": ["string"],
        "skill_gaps": ["string"],
        "learning_sequence": ["string"],
        "estimated_time": "string",
        "daily_tasks": [
            {{
                "day": 1,
                "title": "string",
                "description": "string",
                "task_type": "learn",
                "estimated_minutes": 60
            }}
        ],
        "assessment_plan": "string",
        "revision_plan": "string"
    }}
    """
    raw_response = ai_client.get_response(
        message=prompt,
        system_instruction="You are TulasiAI's master roadmap planner. Output strictly valid JSON without markdown blocks.",
        force_model="gemini-2.5-flash"
    )
    state['roadmap_json'] = raw_response.replace("json", "").replace("", "").strip()
    return state

def validate_output_node(state: RoadmapState) -> RoadmapState:
    try:
        parsed_data = json.loads(state['roadmap_json'])
        roadmap = RoadmapResponse(**parsed_data)
        state['final_roadmap'] = roadmap
    except Exception as e:
        state['error'] = str(e)
    return state

# Build Graph
graph_builder = StateGraph(RoadmapState)
graph_builder.add_node("load_context", load_context_node)
graph_builder.add_node("calculate_gaps", calculate_gaps_node)
graph_builder.add_node("prioritize_skills", prioritize_skills_node)
graph_builder.add_node("generate_roadmap", generate_roadmap_node)
graph_builder.add_node("validate_output", validate_output_node)

graph_builder.add_edge(START, "load_context")
graph_builder.add_edge("load_context", "calculate_gaps")
graph_builder.add_edge("calculate_gaps", "prioritize_skills")
graph_builder.add_edge("prioritize_skills", "generate_roadmap")
graph_builder.add_edge("generate_roadmap", "validate_output")
graph_builder.add_edge("validate_output", END)

orchestrator = graph_builder.compile()

def generate_personalized_roadmap(db: Session, user_id: int, goal_data: Goal, profile: Profile) -> RoadmapResponse:
    # Load Assessments
    assessments = db.exec(select(SkillAssessment).where(SkillAssessment.user_id == user_id)).all()
    assmt_data = [{"skill": a.skill_name, "level": a.mastery_level} for a in assessments]
    
    initial_state = {
        "user_id": user_id,
        "profile_data": {"current_role": profile.current_role},
        "goal_data": {
            "target_role": goal_data.target_role,
            "target_companies": goal_data.target_companies,
            "daily_minutes": goal_data.daily_minutes
        },
        "assessments": assmt_data,
        "skill_gaps": [],
        "priority_skills": [],
        "roadmap_json": "",
        "final_roadmap": None,
        "error": None
    }
    
    result = orchestrator.invoke(initial_state)
    
    if result.get("error"):
        print(f"Error parsing Roadmap JSON: {result['error']}")
        raise ValueError("Failed to generate a valid roadmap from AI.")
        
    return result["final_roadmap"]

