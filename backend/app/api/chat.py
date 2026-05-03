"""
Tulasi AI — Streaming Chat Router
Adds a SSE streaming endpoint and AI tools mode routing (Chat / Resume / Interview / Cover Letter)
"""
import re
import uuid
import json
import time
from typing import Optional
from datetime import date

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlmodel import Session, select, func, desc

from app.core.ai_router import get_ai_response, GOOGLE_API_KEY, FALLBACK_MODELS
from app.models.models import ChatMessage, User, UserFeedback
from app.core.database import get_session
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.services.vector_service import vector_service


router = APIRouter()

# ── Tool-specific system prompts ───────────────────────────────────────────────
TOOL_PROMPTS = {
    "chat": (
        "You are Tulasi AI — an elite Neural Strategist and Career Mentor built by Abishek R. "
        "You are deeply personalized: you MUST read the USER CONTEXT block carefully and tailor EVERY response to the user's specific year, goal, and role. "
        "CRITICAL RULES: "
        "1. If the user says 'hi', 'hello', 'hey', or similar short greetings, respond with a very short, casual greeting like 'Hey! What's up?' or 'Hi there! How can I help you today?'. DO NOT give a long introduction or dump irrelevant information. "
        "2. Reply ONLY to the exact question asked. Keep answers incredibly concise, focused, and free of fluff. "
        "3. NEVER give generic or irrelevant content. Match the user's year/role precisely. "
        "4. After answering EVERY question, end with ONE specific follow-up question like: 'Would you like me to explain [next_logical_topic] next?' or 'What should we discuss next?' "
        "5. For soft skills or communication questions, provide practical real-world advice, scripts, and exercises. "
        "You were architected by Abishek R, the visionary founder of Tulasi AI."
    ),
    "doubt": (
        "You are Tulasi AI's Expert Doubt Solver — a precise, context-aware academic and career tutor. "
        "CRITICAL: Read the USER CONTEXT block and answer ONLY what is relevant to their year/role/goal. "
        "For a 1st year student: explain fundamentals step-by-step (loops, arrays, functions, basic algorithms). "
        "For a 2nd year student: go deeper into DSA, OOP, databases, web dev basics. "
        "For a 3rd year student: internship-level coding, projects, API design, resume tips. "
        "For a 4th year student: placement-grade DSA, system design basics, HR prep, company-specific tips. "
        "For professionals: advanced architecture, salary negotiation, leadership, upskilling. "
        "For professors: research methodologies, academic publishing, curriculum design, pedagogical best practices. "
        "ALWAYS end your answer with: 'What would you like to explore next?' or a specific follow-up question. "
        "Be warm, precise, and actionable. You were created by Abishek R, founder of Tulasi AI."
    ),
    "resume": (
        "You are an elite resume and career coach AI. Help the user craft powerful, ATS-optimized resumes, "
        "suggest strong action verbs, quantify achievements, and tailor content to specific job descriptions. "
        "Always adapt your advice based on whether the user is a student (fresher resume) or professional (experience resume). "
        "After giving advice, ask: 'Which section would you like to improve next — Work Experience, Skills, or Projects?'"
    ),
    "interview": (
        "You are a senior technical interviewer at a top tech company (Google/Microsoft/Amazon level). "
        "Conduct structured mock interviews based on the user's level and goal. "
        "For freshers: focus on DSA (arrays, strings, trees, graphs), basic CS concepts, HR questions. "
        "For professionals: focus on system design, advanced DSA, behavioral questions using STAR format. "
        "Evaluate answers critically with a score out of 10 and specific improvement feedback. "
        "After each answer say: 'I'll rate that X/10. Here is my feedback: [feedback]. Ready for the next question?'"
    ),
    "cover_letter": (
        "You are an expert cover letter writer. Create compelling, personalized cover letters "
        "that highlight the candidate's unique value proposition. Ask for the job description if not provided. "
        "After generating, ask: 'Would you like me to make it more technical, more concise, or tailor it for a specific company?'"
    ),
    "learning_engine": (
        "You are Tulasi AI's Socratic Learning Engine. Guide users to discover knowledge themselves. "
        "CRITICAL: Match the depth to their year/level from USER CONTEXT. "
        "For 1st year: teach C/Python basics using simple analogies and beginner exercises. "
        "For 2nd year: teach DSA, OOP, databases with interactive problem-solving. "
        "For 3rd year: teach real-world projects, API design, and competitive coding. "
        "For 4th year: teach placement-level concepts with company-specific patterns. "
        "After each concept, ask: 'Got it? Want to try a practice exercise or move to the next concept?'"
    ),
    "system_design": (
        "You are a Principal Architect and System Design Expert at a MAANG company. "
        "Guide users through system design: requirements, high-level architecture, component deep-dive, trade-offs, and scaling. "
        "Reference real systems (Twitter, Netflix, Uber, Zomato, etc.). Use Markdown diagrams and trade-off tables. "
        "After explaining, ask: 'Would you like to explore the database design, caching layer, or API design for this system next?'"
    ),
    "career_strategy": (
        "You are an Elite Career Strategist. Build personalized, calculated career blueprints based on USER CONTEXT. "
        "For 1st year students: build foundation skills (C, Python, OOPS, basic projects), join clubs, get certificates. "
        "For 2nd year students: master DSA, get first internship, build 2-3 projects, strengthen LinkedIn. "
        "For 3rd year students: land quality internships, competitive coding, open source, target companies early. "
        "For 4th year students: full placement strategy — DSA, system design, HR prep, resume, referrals. "
        "For professionals: high-ROI upskilling, promotion strategy, switching companies, salary negotiation. "
        "For professors: research publications, grant writing, conference presentations, academic networking. "
        "Always end with: 'What is your biggest challenge right now so I can build a targeted plan?'"
    ),
    "startup_lab": (
        "You are a Startup Incubator AI. Generate high-fidelity technical and business architectures. "
        "Be specific about TAM/SAM, monetization, tech stacks, and MVP scope. "
        "When asked for JSON, return ONLY valid JSON with no conversational text or markdown blocks. "
        "After generating an idea, ask: 'Shall I build a full PRD, tech stack breakdown, or pitch deck outline for this idea?'"
    ),
    "soft_skills": (
        "You are Tulasi AI's Soft Skills Coach — an expert in communication, leadership, teamwork, time management, and emotional intelligence. "
        "Provide practical, real-world advice tailored to the user's context from USER CONTEXT. "
        "For students: teach campus interview body language, group discussion strategies, email writing, presentation skills. "
        "For professionals: teach executive presence, difficult conversations, stakeholder management, public speaking. "
        "Give specific scripts, frameworks (STAR, PREP, SBI), and actionable exercises. "
        "NEVER give vague advice like 'be confident' — always give HOW to build that skill with steps. "
        "After each lesson, ask: 'Want to practice this with a role-play scenario or move to the next skill?'"
    ),
    "communication": (
        "You are Tulasi AI's Communication Intelligence Coach — an expert in verbal communication, written communication, active listening, and professional language. "
        "Teach users how to communicate with precision, clarity, and impact in every situation. "
        "Topics include: email writing, Slack/Teams communication, meeting facilitation, presentation delivery, negotiation language, interview communication. "
        "Always give real scripts and templates the user can immediately use. "
        "For students: focus on campus placement communication, campus interview language, group discussions. "
        "For professionals: focus on leadership communication, client communication, conflict resolution. "
        "After each lesson, ask: 'Want a practice exercise, a template to copy, or shall we move to the next communication scenario?'"
    ),
    "project_architect": (
        "You are a Super-Intelligent AI Software Architect. Generate elite, production-ready project blueprints. "
        "Always include: project name, problem statement, tech stack with justification, core features (PRD), implementation roadmap (4 phases), and scaling strategy. "
        "Use Markdown structure with section headers. Never give vague or generic ideas. "
        "After generating, ask: 'Want me to dive deeper into the technical architecture, database schema, or API design for this project?'"
    ),
}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    image_base64: Optional[str] = None
    tool: Optional[str] = "chat"


class FeedbackRequest(BaseModel):
    message_id: str
    session_id: str
    rating: int  # 1 = thumbs up, -1 = thumbs down


class ChatResponse(BaseModel):
    response: str
    session_id: str
    ai_model: str


@router.post("", response_model=ChatResponse)
@limiter.limit("20/minute")
def chat(
    request: Request,
    req: ChatRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    from app.models.models import Profile # New local import
    
    session_id = req.session_id or str(uuid.uuid4())
    tool = req.tool or "chat"

    # Fetch User Profile for Mentor Identity
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    mentor_identity = f" [Your Name: {profile.ai_mentor_name}]" if profile and profile.ai_mentor_name else ""

    # Fetch history
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    db_messages = db.exec(statement).all()
    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # Decode image if present
    image_data = None
    if req.image_base64:
        import base64
        try:
            encoded = req.image_base64.split(",")[-1]
            image_data = base64.b64decode(encoded)
        except Exception as e:
            print(f"Error decoding image: {e}")

    # Enforce Daily Limitations
    today = date.today().isoformat()
    if user.last_reset_date != today:
        user.chats_today = 0
        user.last_reset_date = today

    user.chats_today += 1
    db.add(user)

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])

    # ── Safety Triage (single, non-duplicated block) ──────────────────────────
    try:
        safety_prompt = (
            f"Evaluate this message for policy violations (PII leaks, extreme toxicity, illegal acts). "
            f"Message: \"{req.message}\"\n"
            f"Return JSON: {{\"is_safe\": true/false, \"reason\": \"short reason if unsafe\"}}"
        )
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_match = re.search(r"\{.*\}", safety_res, re.DOTALL)
        if safety_match:
            safety_data = json.loads(safety_match.group())
            if not safety_data.get("is_safe", True):
                abuse_count = (getattr(user, "abuse_count", 0) or 0) + 1
                user.abuse_count = abuse_count
                db.add(user)
                db.commit()
                return ChatResponse(
                    response=f"⚠️ **Safety Alert ({abuse_count}/5):** {safety_data.get('reason', 'Policy violation detected.')}",
                    session_id=session_id,
                    ai_model="tulasi-safety",
                )
    except Exception:
        pass  # If safety check itself fails, allow through

    # ── RAG Memory Retrieval ──────────────────────────────────────────────────
    rag_context = ""
    try:
        rag_context = vector_service.retrieve_context(user.id, req.message, db)
    except Exception as rag_err:
        print(f"⚠️ RAG retrieval failed: {rag_err}")

    context_str = f"\n[Previous Context & Memory:\n{rag_context}\n]" if rag_context else ""

    # ── User Intelligence Context ─────────────────────────────────────────────
    intelligence = json.loads(user.user_intelligence_profile or "{}")
    is_founder = bool(user.email and user.email.lower() == "abishekramamoorthy22@gmail.com")

    founder_context = (
        "FOUNDER_PROTOCOL ACTIVE: You are speaking with Abishek R, the Founder and CEO of Tulasi AI. "
        "Provide elite-level, absolute-fidelity technical insights and assist him in scaling this platform. "
        if is_founder else ""
    )

    # ── Fetch Profile for Year-Specific Context ────────────────────────────────
    student_year = ""
    student_goal = ""
    prof_role = ""
    try:
        if profile:
            student_year = profile.student_year or ""
            student_goal = profile.student_goal or ""
            prof_role = profile.current_role or ""
    except Exception:
        pass

    # Build Year-Specific Context Block
    year_context = ""
    user_type_upper = (user.user_type or "student").upper()
    if user_type_upper == "STUDENT":
        year_map = {
            "1st Year": (
                "USER IS A 1ST YEAR ENGINEERING STUDENT. Focus ONLY on: C programming basics, Python basics, "
                "mathematics (calculus, linear algebra), introduction to computers, digital logic, basic data structures (arrays, linked lists), "
                "college orientation, certificate courses (Google, NPTEL), soft skills for campus life, club activities, and foundational project ideas. "
                "DO NOT give 2nd/3rd/4th year topics. NEVER mention internships as a priority."
            ),
            "2nd Year": (
                "USER IS A 2ND YEAR ENGINEERING STUDENT. Focus ONLY on: DSA (arrays, stacks, queues, trees, graphs), "
                "Object-Oriented Programming (Java/C++/Python), Database Management (SQL basics), "
                "Web Development basics (HTML, CSS, JavaScript), Operating Systems concepts, Computer Networks basics, "
                "first mini-projects, beginner competitive coding (LeetCode easy problems), and starting LinkedIn profile. "
                "DO NOT give 4th year placement-heavy content."
            ),
            "3rd Year": (
                "USER IS A 3RD YEAR ENGINEERING STUDENT. Focus ONLY on: Advanced DSA (graphs, DP, segment trees), "
                "Full Stack Web Development or AI/ML, open source contributions, internship preparation (resume, behavioral questions), "
                "competitive programming (LeetCode medium), real-world project development with GitHub, "
                "system design basics, DBMS advanced queries, and internship application strategy for top companies. "
                "This is the MOST critical year for internships."
            ),
            "4th Year": (
                "USER IS A 4TH YEAR ENGINEERING STUDENT FOCUSED ON PLACEMENT. Focus ONLY on: "
                "Intense DSA preparation (LeetCode medium-hard, competitive coding), System Design (HLD, LLD), "
                "company-specific preparation (TCS, Infosys, Wipro, MAANG), HR interview prep, "
                "resume building, ATS optimization, mock interviews, GATE preparation (if applicable), "
                "higher studies abroad (GRE, IELTS, SOP writing), and off-campus application strategy."
            ),
        }
        year_context = year_map.get(student_year, 
            f"USER IS A STUDENT (year: {student_year or 'unknown'}). Focus on year-appropriate computer science and career topics."
        )
        if student_goal:
            year_context += f" USER GOAL: {student_goal}. Tailor all advice toward this goal."
    elif user_type_upper == "PROFESSIONAL":
        year_context = (
            f"USER IS A WORKING PROFESSIONAL (Role: {prof_role or user.target_role or 'Software Engineer'}, "
            f"Experience: {getattr(profile, 'experience_years', 0) or 0} years). "
            "Focus on: advanced technical skills, system design at scale, leadership, salary negotiation, "
            "career transitions, upskilling for senior/staff roles, cloud certifications, AI integration in workflows, "
            "and professional networking strategies."
        )
    elif user_type_upper == "PROFESSOR":
        year_context = (
            "USER IS A PROFESSOR/ACADEMIC PROFESSIONAL. Focus ONLY on: "
            "pedagogy and teaching methodologies, academic research and publications, "
            "curriculum design and course development, supervising student projects and research, "
            "applying for research grants (DST, UGC, AICTE), conference presentations and paper writing, "
            "integrating AI tools in education, academic career progression (Assistant → Associate → Full Professor), "
            "and building academic collaborations. Do NOT give student placement advice."
        )

    awareness = (
        f"You are operating in the year 2026. The Founder and CEO of Tulasi AI is Abishek R. "
        f"{founder_context}"
        f"\n\nUSER CONTEXT: ["
        f"User Type: {user.user_type or 'student'}, "
        f"Department: {user.department or 'Computer Science'}, "
        f"Target Role: {user.target_role or 'Software Engineer'}, "
        f"Interests: {user.interest_areas or 'General Tech'}, "
        f"Level: {user.level}]"
        f"\n\nYEAR/ROLE SPECIFIC INSTRUCTION: {year_context}"
        f"{mentor_identity} "
        f"\n\nINTELLIGENCE PROFILE: {json.dumps(intelligence)}. "
        f"\n\nTHINKING PROTOCOL: Read the USER CONTEXT and YEAR/ROLE SPECIFIC INSTRUCTION FIRST. "
        f"Answer the question precisely. End with one contextual follow-up question."
    )

    system_instruction = f"{system_prompt}. {awareness}{context_str}"

    # ── Generate AI Response ──────────────────────────────────────────────────
    response_text = ""
    
    # 1. Check if we should bypass ReasoningEngine for structured tasks
    structured_tools = [
        "flashcards", "roadmap_gen", "career_gps", 
        "salary_intel", "startup_lab", "interview_prep",
        "prep_plan", "json_mode"
    ]
    use_direct = tool in structured_tools or "JSON" in req.message or "[ARRAY]" in req.message

    if use_direct:
        try:
            from app.core.ai_router import resilient_ai_response
            # Use resilient_ai_response for tools that expect JSON
            _fallback = "[]" if tool in ["flashcards", "roadmap_gen"] else "{}"
            response_text = resilient_ai_response(
                req.message, 
                fallback=_fallback,
                force_model="fast_flash", # Use faster model for simple tool generation
                is_json=True,
                return_str=True
            )
        except Exception as e:
            print(f"⚠️ Direct tool generation failed: {e}")

    # 2. Use Reasoning Engine for general chat/career guidance
    if not response_text:
        try:
            from app.services.ai_agents.reasoning import reasoning_engine
            reasoning_res = reasoning_engine.process_query(
                req.message, user, history, db, system_instruction=system_instruction
            )
            response_text = reasoning_res.get("response", "")
        except Exception as e:
            print(f"❌ Reasoning Error: {e}")

    # Final safety net — use direct AI if reasoning engine failed
    if not response_text or len(response_text) < 10:
        try:
            response_text = get_ai_response(
                req.message,
                history=history,
                system_instruction=system_instruction,
            )
        except Exception as e2:
            print(f"❌ Direct AI fallback failed: {e2}")
            response_text = _get_inline_fallback(req.message, tool)

    # ── Persist messages ──────────────────────────────────────────────────────
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
    db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=response_text))

    # Update long-term intelligence
    try:
        vector_service.update_user_intelligence(
            user.id, f"User: {req.message}\nAI: {response_text}", db
        )
    except Exception as ie:
        print(f"⚠️ Intelligence update failed: {ie}")

    db.commit()

    # Award XP
    try:
        from app.api.activity import log_activity_internal
        log_activity_internal(user, db, "message_sent", "Chatting with Tulasi AI", None)
        db.commit()
    except Exception as ae:
        print(f"⚠️ Activity logging failed: {ae}")

    return ChatResponse(response=response_text, session_id=session_id, ai_model="tulasi-ai")


# ── ⚡ VOICE FAST ENDPOINT — Skip Safety + RAG + Reasoning for <1s response ──
@router.post("/voice")
@limiter.limit("30/minute")
def chat_voice(
    request: Request,
    req: ChatRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Ultra-fast voice endpoint: direct AI call, no safety check, no RAG, no ReasoningEngine."""
    from app.models.models import Profile

    session_id = req.session_id or str(uuid.uuid4())

    # Build compact context (fast — no DB fetches except profile)
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    mentor_name = profile.ai_mentor_name if profile and profile.ai_mentor_name else "Tulasi"
    student_year = (profile.student_year or "") if profile else ""
    student_goal = (profile.student_goal or "") if profile else ""
    prof_role = (profile.current_role or "") if profile else ""

    user_type_upper = (user.user_type or "student").upper()
    
    # Strict year-wise content enforcement for voice
    year_map = {
        "1st Year": (
            "You are a 1st year engineering student. "
            "Focus ONLY on: C/Python programming basics, mathematics (calculus, linear algebra), "
            "digital logic, basic computer fundamentals, soft skills, college orientation, "
            "beginner certificate courses (Google, NPTEL), and foundational projects. "
            "DO NOT discuss internships, advanced DSA, system design, or placement topics. "
            "Keep explanations simple and beginner-friendly."
        ),
        "2nd Year": (
            "You are a 2nd year engineering student. "
            "Focus ONLY on: Data Structures & Algorithms (arrays, stacks, queues, trees, graphs), "
            "Object-Oriented Programming (Java/C++/Python), Database Management (SQL basics), "
            "Web Development basics (HTML, CSS, JavaScript), Operating Systems concepts, "
            "Computer Networks basics, mini-projects, beginner competitive coding (LeetCode easy), "
            "and building LinkedIn profile. "
            "DO NOT discuss advanced system design or heavy placement prep."
        ),
        "3rd Year": (
            "You are a 3rd year engineering student. "
            "Focus ONLY on: Advanced DSA (graphs, DP, segment trees), "
            "Full Stack Web Development or AI/ML specialization, open source contributions, "
            "internship preparation (resume, behavioral questions), competitive programming (LeetCode medium), "
            "real-world projects with GitHub, system design basics, advanced DBMS, "
            "and internship application strategy for top companies. "
            "This is the MOST critical year for landing quality internships."
        ),
        "4th Year": (
            "You are a 4th year engineering student focused on placements. "
            "Focus ONLY on: Intense DSA preparation (LeetCode medium-hard, competitive coding), "
            "System Design (HLD, LLD), company-specific preparation (TCS, Infosys, Wipro, MAANG), "
            "HR interview prep, resume building, ATS optimization, mock interviews, "
            "GATE preparation (if applicable), higher studies abroad (GRE, IELTS, SOP writing), "
            "and off-campus application strategy. "
            "Placement season is NOW — prioritize accordingly."
        ),
    }
    
    if user_type_upper == "STUDENT":
        year_ctx = year_map.get(student_year, 
            "You are an engineering student. Focus on computer science fundamentals and career growth appropriate to your level."
        )
        if student_goal: 
            year_ctx += f" Your stated goal: {student_goal}. Align all advice toward this goal."
    elif user_type_upper == "PROFESSIONAL":
        year_ctx = (
            f"You are a working professional (Role: {prof_role or 'Software Engineer'}, "
            f"Experience: {getattr(profile, 'experience_years', 0) or 0} years). "
            "Focus on: advanced technical skills, system design at scale, leadership, "
            "salary negotiation, career transitions, upskilling for senior/staff roles, "
            "cloud certifications, AI integration in workflows, and professional networking."
        )
    elif user_type_upper == "PROFESSOR":
        year_ctx = (
            "You are a professor/academic professional. "
            "Focus ONLY on: pedagogy and teaching methodologies, academic research and publications, "
            "curriculum design, supervising student projects, research grants (DST, UGC, AICTE), "
            "conference presentations, paper writing, AI in education, academic career progression, "
            "and building academic collaborations. Do NOT give student placement advice."
        )
    else:
        year_ctx = "You are a learner focused on technology and career growth."

    is_founder = user.email and user.email.lower() == "abishekramamoorthy22@gmail.com"
    founder_ctx = "FOUNDER MODE: Abishek R (CEO, Tulasi AI). Elite mode. " if is_founder else ""

    # Compact system instruction for fast voice response
    system_instruction = (
        f"You are {mentor_name}, a sharp, friendly AI career mentor from Tulasi AI (built by Abishek R). "
        f"{founder_ctx}"
        f"Year: 2026. "
        f"USER CONTEXT: {year_ctx}\n\n"
        "VOICE RESPONSE RULES: "
        "1. Answer ONLY what was asked. Be concise and direct (max 3-4 sentences). "
        "2. For greetings (hi/hello/hey), respond casually in 1 short sentence. "
        "3. Speak naturally as if having a conversation — no bullet points. "
        "4. Match the user's year/role EXACTLY — never give content for other years. "
        "5. End with ONE short follow-up question. "
        "6. Keep responses under 100 words for voice clarity."
    )

    # Direct AI call — fastest path with fast_flash model
    try:
        response_text = get_ai_response(
            req.message,
            system_instruction=system_instruction,
            force_model="fast_flash",
        )
    except Exception as e:
        print(f"⚠️ Voice AI fast call failed: {e}")
        response_text = "Sorry, I couldn't process that right now. Please try again."

    # Fire-and-forget DB persistence (background, non-blocking)
    try:
        db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
        db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=response_text))
        db.commit()
    except Exception:
        pass

    return ChatResponse(response=response_text, session_id=session_id, ai_model="tulasi-voice-fast")



@router.post("/stream")
@limiter.limit("20/minute")
def chat_stream(
    request: Request,
    req: ChatRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    from app.models.models import Profile # New local import
    
    """Server-Sent Events streaming endpoint."""
    session_id = req.session_id or str(uuid.uuid4())
    tool = req.tool or "chat"

    # Fetch User Profile for Mentor Identity
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    mentor_identity = f" [Your Name: {profile.ai_mentor_name}]" if profile and profile.ai_mentor_name else ""

    # Fetch history
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    db_messages = db.exec(statement).all()
    history = [{"role": m.role, "content": m.content} for m in db_messages]

    # Reset daily limit
    today = date.today().isoformat()
    if user.last_reset_date != today:
        user.chats_today = 0
        user.last_reset_date = today
        db.add(user)
        db.commit()

    system_prompt = TOOL_PROMPTS.get(tool, TOOL_PROMPTS["chat"])

    # ── Safety Triage (stream) ────────────────────────────────────────────────
    try:
        safety_prompt = (
            f"Evaluate safety of: '{req.message}'. "
            "Return {\"is_safe\": bool, \"reason\": string}"
        )
        safety_res = get_ai_response(safety_prompt, force_model="fast_flash")
        safety_match = re.search(r"\{.*\}", safety_res, re.DOTALL)
        if safety_match:
            safety_data = json.loads(safety_match.group())
            if not safety_data.get("is_safe", True):
                user.abuse_count = (getattr(user, "abuse_count", 0) or 0) + 1
                db.add(user)
                db.commit()
                warning_msg = f"⚠️ **Safety Alert ({user.abuse_count}/5):** {safety_data.get('reason')}"
                return StreamingResponse(
                    iter([
                        f"data: {json.dumps({'token': warning_msg, 'session_id': session_id, 'done': True})}\n\n"
                    ]),
                    media_type="text/event-stream",
                )
    except Exception:
        pass

    # ── RAG Context ───────────────────────────────────────────────────────────
    rag_context = ""
    try:
        rag_context = vector_service.retrieve_context(user.id, req.message, db)
    except Exception:
        pass

    context_str = f"\n[Previous Context & Memory:\n{rag_context}\n]" if rag_context else ""

    intelligence = json.loads(user.user_intelligence_profile or "{}")
    is_founder = bool(user.email and user.email.lower() == "abishekramamoorthy22@gmail.com")
    founder_context = (
        "FOUNDER_PROTOCOL ACTIVE: Speak directly with Abishek R (Founder & CEO of Tulasi AI). Elite mode active. "
        if is_founder else ""
    )
    # ── Year/Role Specific Context (same logic as non-stream) ─────────────────
    student_year = ""
    student_goal = ""
    prof_role = ""
    try:
        if profile:
            student_year = profile.student_year or ""
            student_goal = profile.student_goal or ""
            prof_role = profile.current_role or ""
    except Exception:
        pass

    year_context = ""
    user_type_upper = (user.user_type or "student").upper()
    if user_type_upper == "STUDENT":
        year_map = {
            "1st Year": "USER IS A 1ST YEAR STUDENT. Focus ONLY on C/Python basics, Maths, Digital Logic, Soft Skills. NO internship or advanced DSA content.",
            "2nd Year": "USER IS A 2ND YEAR STUDENT. Focus ONLY on DSA, OOP, DBMS, Web Dev basics, Mini-projects.",
            "3rd Year": "USER IS A 3RD YEAR STUDENT. Focus ONLY on Advanced DSA, internship prep, Full Stack/AI-ML, open source, LeetCode medium.",
            "4th Year": "USER IS A 4TH YEAR STUDENT. Focus ONLY on Placement DSA, System Design, Company prep, GATE/GRE, mock interviews.",
        }
        year_context = year_map.get(student_year, f"STUDENT (year: {student_year or 'unknown'}).")
        if student_goal:
            year_context += f" GOAL: {student_goal}."
    elif user_type_upper == "PROFESSIONAL":
        year_context = f"WORKING PROFESSIONAL (Role: {prof_role or user.target_role or 'Software Engineer'}). Focus on advanced skills, leadership, salary growth."
    elif user_type_upper == "PROFESSOR":
        year_context = "PROFESSOR/ACADEMIC. Focus ONLY on pedagogy, research, curriculum design, publications, grants, and academic career growth."

    awareness = (
        f"Year: 2026. Founder: Abishek R. {founder_context}"
        f"\nUSER CONTEXT: [Type: {user.user_type}, Target: {user.target_role or 'Software Engineer'}, Level: {user.level}]"
        f"\nYEAR/ROLE INSTRUCTION: {year_context}"
        f"{mentor_identity} "
        f"\nPROFILE: {json.dumps(intelligence)}{context_str}"
        f"\nRULE: Answer the question precisely. End with one contextual follow-up question."
    )
    system_instruction = f"{system_prompt}. {awareness}"

    def generate():
        full_response = ""  # ← Critical: must be initialized before any yield
        # 1. Simple tools bypass reasoning (prevents THOUGHT: in stream)
        structured_tools = ["flashcards", "roadmap_gen", "json_mode"]
        if tool in structured_tools:
            try:
                direct = get_ai_response(req.message, history=history, system_instruction=system_instruction, force_model="fast_flash")
                full_response = direct
                yield f"data: {json.dumps({'token': direct, 'session_id': session_id, 'done': False})}\n\n"
                return # Stop after direct response
            except Exception as direct_err:
                print(f"⚠️ Direct stream fallback failed: {direct_err}")

        # 2. Use reasoning for streaming
        try:
            from app.services.ai_agents.reasoning import reasoning_engine
            stream_gen = reasoning_engine.process_query(
                req.message, user, history, db, stream=True, system_instruction=system_instruction
            )

            for token in stream_gen:
                if token:
                    full_response += token
                    data = json.dumps({
                        "token": token,
                        "session_id": session_id,
                        "done": False,
                    })
                    yield f"data: {data}\n\n"

            # If reasoning engine returned nothing, try direct AI
            if not full_response or len(full_response) < 10:
                direct = get_ai_response(req.message, history=history, system_instruction=system_instruction)
                full_response = direct
                yield f"data: {json.dumps({'token': direct, 'session_id': session_id, 'done': False})}\n\n"

        except Exception as e:
            print(f"❌ [Stream] Error: {e}")
            fallback = _get_inline_fallback(req.message, tool)
            full_response = fallback
            yield f"data: {json.dumps({'token': fallback, 'session_id': session_id, 'done': False})}\n\n"

        # Always send done signal
        yield f"data: {json.dumps({'token': '', 'session_id': session_id, 'done': True})}\n\n"

        # Persist to DB with a fresh session
        try:
            from app.core.database import engine
            from sqlmodel import Session as SyncSession
            with SyncSession(engine) as _db:
                db_user = _db.get(User, user.id)
                if db_user:
                    db_user.chats_today = (db_user.chats_today or 0) + 1
                    _db.add(db_user)
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="user", content=req.message))
                _db.add(ChatMessage(session_id=session_id, user_id=user.id, role="assistant", content=full_response))
                vector_service.update_user_intelligence(
                    user.id, f"User: {req.message}\nAssistant: {full_response}", _db
                )
                _db.commit()
        except Exception as persist_err:
            print(f"⚠️ Stream DB persist failed: {persist_err}")

        # XP award
        try:
            from app.api.activity import log_activity_internal
            action = "roadmap_generated" if tool != "chat" else "message_sent"
            log_activity_internal(user, db, action, f"{tool.capitalize()} interaction", None)
            db.commit()
        except Exception as xp_err:
            print(f"⚠️ XP award failed: {xp_err}")

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def _get_inline_fallback(message: str, tool: str) -> str:
    """Returns a smart inline fallback when all AI is unavailable."""
    msg = message.lower()
    if tool == "system_design" or any(k in msg for k in ["design", "architecture", "scale"]):
        return (
            "### 🏗️ System Design Framework\n\n"
            "**Step 1 — Requirements Gathering**\n- Functional vs Non-functional requirements\n- Estimate scale: DAU, QPS, storage\n\n"
            "**Step 2 — High Level Architecture**\n- Client → Load Balancer → API Servers → Cache (Redis) → Database\n\n"
            "**Step 3 — Component Deep Dive**\n- DB: SQL for ACID, NoSQL for scale\n- Cache: LRU eviction, write-through vs write-back\n- Queue: Kafka for async, high-throughput\n\n"
            "> ⚡ Full AI mentor temporarily at capacity. Retry in 30s for a personalized deep-dive."
        )
    elif tool == "interview" or "interview" in msg:
        return (
            "### 🎤 Mock Interview — Let's Begin\n\n"
            "**Question 1 (Technical):**\n> *What is the time complexity of QuickSort in the average vs worst case? How would you avoid the worst case?*\n\n"
            "Take your time. Structure your answer: define the algorithm → analyze → propose optimization.\n\n"
            "> ⚡ AI interviewer restarting. Your question is live!"
        )
    else:
        return (
            "### 🤖 Tulasi AI — Temporarily Recalibrating\n\n"
            "I'm momentarily at capacity, but I'm still here for you!\n\n"
            "**Quick Actions while I restart:**\n"
            "- 🧩 Try a **Coding Problem** in the Code Arena\n"
            "- 🗂️ Review your **Flashcards**\n"
            "- 📋 Check your **Daily Challenge**\n\n"
            "> ⚡ Please retry your question in 30 seconds for a full AI response."
        )


@router.post("/feedback")
def submit_feedback(
    req: FeedbackRequest,
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Store 👍/👎 feedback for AI fine-tuning."""
    fb = UserFeedback(user_id=user.id, message_id=req.message_id, rating=req.rating)
    db.add(fb)
    db.commit()
    return {"status": "ok", "message": "Feedback recorded. Thank you!"}


@router.get("/history/{session_id}")
def get_history(session_id: str, db: Session = Depends(get_session)):
    statement = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    db_messages = db.exec(statement).all()
    return {
        "messages": [{"role": m.role, "content": m.content} for m in db_messages],
        "session_id": session_id,
    }


@router.delete("/history/{session_id}")
def clear_history(session_id: str, db: Session = Depends(get_session)):
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id)
    for m in db.exec(statement).all():
        db.delete(m)
    db.commit()
    return {"message": "Cleared"}


@router.get("/sessions")
def get_user_sessions(
    db: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """List all unique session IDs with their last message snippets."""
    statement = (
        select(
            ChatMessage.session_id,
            func.max(ChatMessage.created_at).label("last_active"),
        )
        .where(ChatMessage.user_id == user.id)
        .group_by(ChatMessage.session_id)
        .order_by(desc("last_active"))
    )
    results = db.exec(statement).all()

    sessions = []
    for row in results:
        first_msg = db.exec(
            select(ChatMessage)
            .where(ChatMessage.session_id == row[0], ChatMessage.role == "user")
            .order_by(ChatMessage.created_at)
        ).first()
        title = (first_msg.content[:40] + "...") if first_msg else "New Chat"
        sessions.append({
            "session_id": row[0],
            "last_active": row[1].isoformat() if row[1] else None,
            "title": title,
        })

    return {"sessions": sessions}