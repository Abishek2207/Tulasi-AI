# backend/routers/interview.py
from fastapi import APIRouter
from services.langchain_service import llm
from pydantic import BaseModel

router = APIRouter()

ROADMAPS = {
    "frontend": ["HTML/CSS", "JavaScript", "React", "TypeScript", "Next.js", "System Design"],
    "backend": ["Python/Java/Node.js", "REST APIs", "Databases", "Redis", "Docker", "System Design"],
    "fullstack": ["Frontend Basics", "Backend Basics", "Databases", "DevOps", "System Design"],
    "data_science": ["Python", "Statistics", "ML Algorithms", "Deep Learning", "MLOps"],
    "devops": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS/GCP/Azure"],
    "android": ["Java/Kotlin", "Android SDK", "Jetpack Compose", "Firebase", "Play Store"],
    "ml_engineer": ["Python", "TensorFlow/PyTorch", "MLOps", "System Design", "Math"]
}

class InterviewRequest(BaseModel):
    role: str
    level: str  # fresher, mid, senior
    topic: str
    user_answer: str = ""
    question_number: int = 1

@router.get("/roadmap/{role}")
async def get_roadmap(role: str):
    roadmap = ROADMAPS.get(role.lower(), ROADMAPS["fullstack"])
    
    detailed_roadmap = llm.invoke(f"""
    Create a detailed week-by-week learning roadmap for {role} developer.
    Include: topics, resources (free), projects to build, estimated time.
    Format as structured JSON with weeks array.
    Each week: week_number, topics[], resources[], mini_project, skills_gained[]
    """)
    
    return {"role": role, "roadmap": roadmap, "detailed": detailed_roadmap.content}

@router.post("/start-mock")
async def start_mock_interview(request: InterviewRequest):
    question = llm.invoke(f"""
    You are a senior interviewer at FAANG company.
    Generate interview question #{request.question_number} for:
    Role: {request.role}
    Level: {request.level}
    Topic: {request.topic}
    
    Return JSON:
    {{
      "question": "...",
      "type": "behavioral/technical/system-design",
      "hints": ["hint1", "hint2"],
      "expected_keywords": ["keyword1", "keyword2"]
    }}
    """)
    return {"question": question.content}

@router.post("/evaluate-answer")
async def evaluate_answer(request: InterviewRequest):
    evaluation = llm.invoke(f"""
    You are an expert interviewer. Evaluate this answer:
    
    Question Topic: {request.topic}
    Role: {request.role}
    Level: {request.level}
    Student Answer: {request.user_answer}
    
    Provide JSON response:
    {{
      "score": 0-10,
      "strengths": [],
      "improvements": [],
      "ideal_answer": "...",
      "follow_up_question": "...",
      "tips": []
    }}
    """)
    return {"evaluation": evaluation.content}
