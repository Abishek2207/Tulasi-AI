from langgraph.graph import StateGraph, END
from typing import Dict, Any, TypedDict
from app.agents.market_intelligence import fetch_real_market_data
from app.agents.career_risk_agent import calculate_career_risks
from app.agents.roadmap_agent import identify_skill_gaps, find_certification_links, generate_daily_learning_plan
from app.agents.communication_coach import generate_communication_plan

class ProfessionalState(TypedDict):
    profile: Dict[str, Any]
    market_data: Dict[str, Any]
    career_risks: Dict[str, float]
    skill_gaps: list
    certification_links: list
    daily_plan: Dict[str, Any]
    communication_plan: Dict[str, Any]
    burnout_plan: Dict[str, Any]
    career_direction: list

def collect_professional_profile(state: ProfessionalState):
    # This step represents the entry point where profile data is injected.
    return {"profile": state.get("profile", {})}

def fetch_market_data_step(state: ProfessionalState):
    profile = state["profile"]
    data = fetch_real_market_data(profile.get("role", "Unknown"), profile.get("industry", "Tech"))
    return {"market_data": data}

def analyze_current_role(state: ProfessionalState):
    # Mock deep analysis
    return {}

def calculate_risks_step(state: ProfessionalState):
    risks = calculate_career_risks(state["profile"], state["market_data"])
    return {"career_risks": risks}

def identify_gaps_step(state: ProfessionalState):
    gaps = identify_skill_gaps(state["profile"], state["market_data"])
    return {"skill_gaps": gaps}

def find_certs_step(state: ProfessionalState):
    certs = find_certification_links(state["skill_gaps"])
    return {"certification_links": certs}

def generate_plan_step(state: ProfessionalState):
    plan = generate_daily_learning_plan(state["profile"], state["skill_gaps"])
    return {"daily_plan": plan}

def generate_comm_plan_step(state: ProfessionalState):
    plan = generate_communication_plan(state["profile"])
    return {"communication_plan": plan}

def generate_burnout_plan_step(state: ProfessionalState):
    # Burnout guard logic
    plan = {"recommendation": "Follow a 50/10 Pomodoro schedule. Ensure 2 offline days."}
    return {"burnout_plan": plan}

def generate_direction_step(state: ProfessionalState):
    # Career direction logic
    directions = ["AI Backend Engineer", "Cloud Architect", "Staff Engineer"]
    return {"career_direction": directions}

def build_professional_workflow() -> StateGraph:
    workflow = StateGraph(ProfessionalState)
    
    workflow.add_node("collect_professional_profile", collect_professional_profile)
    workflow.add_node("fetch_real_market_data", fetch_market_data_step)
    workflow.add_node("analyze_current_role", analyze_current_role)
    workflow.add_node("calculate_career_risks", calculate_risks_step)
    workflow.add_node("identify_skill_gaps", identify_gaps_step)
    workflow.add_node("find_certification_links", find_certs_step)
    workflow.add_node("generate_daily_learning_plan", generate_plan_step)
    workflow.add_node("generate_communication_plan", generate_comm_plan_step)
    workflow.add_node("generate_burnout_guard_plan", generate_burnout_plan_step)
    workflow.add_node("generate_career_direction_paths", generate_direction_step)

    # Simple sequential flow for the MVP
    workflow.set_entry_point("collect_professional_profile")
    workflow.add_edge("collect_professional_profile", "fetch_real_market_data")
    workflow.add_edge("fetch_real_market_data", "analyze_current_role")
    workflow.add_edge("analyze_current_role", "calculate_career_risks")
    workflow.add_edge("calculate_career_risks", "identify_skill_gaps")
    workflow.add_edge("identify_skill_gaps", "find_certification_links")
    workflow.add_edge("find_certification_links", "generate_daily_learning_plan")
    workflow.add_edge("generate_daily_learning_plan", "generate_communication_plan")
    workflow.add_edge("generate_communication_plan", "generate_burnout_guard_plan")
    workflow.add_edge("generate_burnout_guard_plan", "generate_career_direction_paths")
    workflow.add_edge("generate_career_direction_paths", END)
    
    return workflow.compile()
