"""
Tulasi AI — Intelligent Agent Router
Routes user queries to the right specialized agent based on the active module.
Each agent has unique system context, domain knowledge, and RAG sources.
"""
import json
from typing import Optional, Dict, Any, Generator, Union
from app.core.ai_client import ai_client
from app.models.models import User
from sqlmodel import Session


# ── Domain Knowledge Bases (injected into prompts) ──────────────────────────

_SYSTEM_DESIGN_KNOWLEDGE = """
KEY SYSTEM DESIGN PRINCIPLES:
- CAP Theorem: Consistency, Availability, Partition Tolerance — pick 2.
- Load Balancing: L4 (TCP/IP) vs L7 (HTTP). Algorithms: Round Robin, Least Connections, IP Hash.
- Caching: Write-through (safe), Write-back (fast), LRU eviction. Redis for distributed cache.
- Database: SQL for ACID compliance, NoSQL for horizontal scale. Master-slave for read replicas.
- Message Queue: Kafka for durable high-throughput streaming, RabbitMQ for task queues.
- CDN: Push (static) vs Pull (dynamic) models for media delivery.
- Consistent Hashing: Minimizes key remapping during node changes in distributed systems.
- Rate Limiting: Token Bucket (smooth), Leaky Bucket (strict), Sliding Window Log.
- API Gateway: Auth, rate limit, routing, circuit breaker at edge.
ESTIMATE FRAMEWORKS: 1M DAU ≈ ~12 QPS. 1 char = 1 byte. 1M requests/day = ~11.5 req/s.
"""

_CAREER_KNOWLEDGE = """
CAREER INTELLIGENCE DATABASE:
- 1st Year Students: Focus on C++/Python fundamentals, basic DSA, first portfolio project.
- 2nd Year Students: DSA (Neetcode 150), web dev basics, open source contribution, hackathons.
- 3rd Year Students: Advanced DSA, system design basics, internship applications, specialization track.
- 4th Year Students: LeetCode 300+, full system design, mock interviews, campus placement prep.
- Professionals: Advanced system design, leadership signals, senior/staff-level skills, domain specialization.
FAANG READINESS: 300+ LeetCode (60% medium), 2 system design projects, behavioral STAR method, at least 1 large-scale project.
HIGH-VALUE SKILLS 2026: LLM fine-tuning, RAG systems, Kubernetes, Rust, Go, eBPF, WASM.
"""

_INTERVIEW_KNOWLEDGE = """
INTERVIEW INTELLIGENCE:
- STAR Method: Situation → Task → Action → Result (always use 'I', not 'We').
- DSA Topics: Arrays, Strings, Linked Lists, Trees, Graphs, DP, Sliding Window, Two Pointers.
- Behavioral: Leadership, Conflict Resolution, Failure Stories, Ownership, Bias for Action.
- System Design Interview Flow: Clarify → Estimate → High-Level → Deep-Dive → Trade-offs.
- Common FAANG Questions: Two Sum, LRU Cache, Word Ladder, Meeting Rooms, Design Twitter.
- Salary Negotiation: Always negotiate. Counter with market data. Never give first number.
"""


# ── Agent Definitions ─────────────────────────────────────────────────────────

AGENTS: Dict[str, Dict[str, Any]] = {
    "system_design": {
        "name": "Principal Architect",
        "system_prompt": (
            "You are a Principal Software Engineer (L7) with 12+ years at Google, Meta, and Amazon. "
            "You are conducting a deep system design mentoring session. "
            "For EVERY design question: (1) Ask clarifying requirements, (2) Estimate scale, "
            "(3) Draw a high-level architecture in ASCII/markdown, (4) Deep-dive into each component, "
            "(5) Discuss trade-offs explicitly. Reference REAL systems (YouTube, Uber, Discord). "
            "Use tables for comparison, diagrams for architecture."
        ),
        "domain_knowledge": _SYSTEM_DESIGN_KNOWLEDGE,
    },
    "career_gps": {
        "name": "Career GPS Strategist",
        "system_prompt": (
            "You are TulasiAI's Career GPS — a world-class career strategist with deep knowledge of the Indian and global tech hiring market. "
            "Your job is to generate HIGHLY personalized career paths based on the user's current year and target role. "
            "1st year students need foundations. 4th years need placement prep. Professionals need specialization. "
            "NEVER give generic advice. Always tailor: year → skill → company → timeline."
        ),
        "domain_knowledge": _CAREER_KNOWLEDGE,
    },
    "mock_interview": {
        "name": "FAANG Interview Coach",
        "system_prompt": (
            "You are a strict but fair FAANG hiring manager conducting a live mock interview. "
            "Ask ONE question at a time. Evaluate the candidate's answer with a score (1-10) and specific feedback. "
            "If they get it wrong, guide them with hints. If correct, escalate difficulty. "
            "Track topics: DSA → System Design → Behavioral. End with an overall assessment."
        ),
        "domain_knowledge": _INTERVIEW_KNOWLEDGE,
    },
    "prep_plan": {
        "name": "Preparation Architect",
        "system_prompt": (
            "You are TulasiAI's Preparation Architect. Generate a HIGHLY specific, week-by-week preparation plan. "
            "The plan must be different for each year of study and each target role. "
            "Include: daily tasks, resources, milestones, mock interview schedule, and project ideas. "
            "Be brutally specific — no generic advice."
        ),
        "domain_knowledge": _CAREER_KNOWLEDGE,
    },
    "rag_chat": {
        "name": "RAG-Enhanced Tutor",
        "system_prompt": (
            "You are TulasiAI's RAG-Enhanced AI Tutor. You have access to a knowledge base of curated "
            "technical content, roadmaps, interview questions, and system design notes. "
            "Always cite or reference the retrieved context in your answer. "
            "If the retrieved context is not enough, supplement with your own expertise."
        ),
        "domain_knowledge": "",
    },
    "default": {
        "name": "Tulasi AI",
        "system_prompt": (
            "You are Tulasi AI — an elite AI tutor and career platform for engineering students and professionals. "
            "Provide world-class, comprehensive, step-by-step answers with code examples, diagrams, and strategic insights. "
            "You were created by Abishek R, founder of Tulasi AI."
        ),
        "domain_knowledge": "",
    },
}


# ── Module → Agent Mapping ────────────────────────────────────────────────────

MODULE_TO_AGENT = {
    "system_design": "system_design",
    "system-design": "system_design",
    "career_gps": "career_gps",
    "career-gps": "career_gps",
    "interview": "mock_interview",
    "mock_interview": "mock_interview",
    "prep_plan": "prep_plan",
    "prep-plan": "prep_plan",
    "roadmap": "career_gps",
    "career_strategy": "career_gps",
    "rag": "rag_chat",
    "chat": "default",
    "doubt": "default",
    "resume": "default",
    "learning_engine": "default",
}


class AgentRouter:
    """
    Routes user queries to specialized agents based on active module.
    Each agent has a unique system prompt + domain knowledge injection.
    """

    def route(
        self,
        message: str,
        module: str,
        user: User,
        rag_context: str = "",
        history: list = None,
        stream: bool = False,
    ) -> Union[str, Generator]:
        """
        Route a message to the correct specialized agent and return a response.
        """
        agent_key = MODULE_TO_AGENT.get(module, "default")
        agent = AGENTS[agent_key]

        # Build user context string
        intelligence = json.loads(user.user_intelligence_profile or "{}")
        user_ctx = (
            f"[USER CONTEXT]\n"
            f"- Year/Stage: {user.user_type or 'student'}\n"
            f"- Department: {user.department or 'Computer Science'}\n"
            f"- Target Role: {user.target_role or 'Software Engineer'}\n"
            f"- XP Level: {user.level} | XP: {user.xp}\n"
            f"- Streak: {user.streak} days\n"
            f"- Strengths: {intelligence.get('strengths', [])}\n"
            f"- Knowledge Gaps: {intelligence.get('gaps', [])}\n"
        )

        # Inject domain knowledge + RAG context
        domain = agent["domain_knowledge"]
        rag_section = f"\n[RETRIEVED KNOWLEDGE BASE CONTEXT]\n{rag_context}\n" if rag_context else ""

        full_system = (
            f"{agent['system_prompt']}\n\n"
            f"{domain}\n"
            f"{user_ctx}"
            f"{rag_section}"
        )

        # Build the contextualized message
        full_message = message

        try:
            result = ai_client.get_response(
                full_message,
                history=history or [],
                system_instruction=full_system,
                stream=stream,
                force_model="complex_reasoning",
            )
            return result
        except Exception as e:
            print(f"❌ AgentRouter.route failed for agent={agent_key}: {e}")
            if stream:
                def fallback_gen():
                    yield self._module_fallback(message, module)
                return fallback_gen()
            return self._module_fallback(message, module)

    def _module_fallback(self, message: str, module: str) -> str:
        """Returns module-specific fallback content when all AI is unavailable."""
        module_responses = {
            "system_design": (
                "### 🏗️ System Design Hint\n\n"
                "**The FAANG System Design Template:**\n"
                "1. **Clarify** — What are functional + non-functional requirements?\n"
                "2. **Estimate** — QPS, Storage, Bandwidth calculations\n"
                "3. **High Level** — Draw: Client → LB → API → Cache → DB\n"
                "4. **Deep Dive** — DB schema, caching strategy, queue design\n"
                "5. **Trade-offs** — Consistency vs Availability, SQL vs NoSQL\n\n"
                "> *Full AI architect recalibrating. Retry in 30s.*"
            ),
            "career_gps": (
                "### 🗺️ Career GPS — Offline Mode\n\n"
                "**Universal Career Acceleration Path:**\n"
                "- **Month 1-2:** Core DSA + Language mastery (Python/Java/C++)\n"
                "- **Month 3-4:** 100+ LeetCode + 2 portfolio projects\n"
                "- **Month 5-6:** System Design + Internship/Job applications\n"
                "- **Month 7+:** Mock interviews + offer negotiation\n\n"
                "> *Personalized GPS recalibrating. Retry for role-specific path.*"
            ),
            "mock_interview": (
                "### 🎤 Interview Question — Practice Now\n\n"
                "**DSA Round:**\n"
                "> *Given an array of integers, find the two numbers that add up to a target sum.*\n\n"
                "**Hint:** Think about HashMap — O(n) solution exists.\n\n"
                "Take 5 minutes, write your solution, then retry for AI evaluation."
            ),
            "prep_plan": (
                "### 📋 Preparation Framework\n\n"
                "**60-Day Intensive Plan:**\n"
                "- **Days 1-15:** DSA foundations (Arrays, Strings, LinkedList)\n"
                "- **Days 16-30:** Trees, Graphs, DP (Neetcode 150)\n"
                "- **Days 31-45:** System Design (Grokking + 3 design problems)\n"
                "- **Days 46-60:** Mock interviews (3/week) + Resume polish\n\n"
                "> *Personalized plan generating. Retry in 30s.*"
            ),
        }
        return module_responses.get(
            module,
            (
                "### 🤖 Tulasi AI\n\n"
                "I'm momentarily recalibrating. Please retry in 30 seconds for a full personalized response.\n\n"
                "**While you wait:** Check the Code Arena for practice problems or review your Daily Challenge!"
            ),
        )


# Singleton
agent_router = AgentRouter()
