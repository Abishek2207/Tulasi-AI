import json
import re
from typing import List, Dict, Optional, Union, Generator
from datetime import datetime
from app.core.ai_client import ai_client
from app.models.models import User
from sqlmodel import Session


class ReasoningEngine:
    """
    Tulasi AI Multi-Step Reasoning Engine.
    Implements a Chain-of-Thought (CoT) process to provide deeper, more strategic responses.
    """
    def __init__(self):
        self._reasoning_prompt = """
        You are the Tulasi AI Core Reasoning Engine — an AGI-level career strategist and technical lead created by Abishek R (Founder & CEO).
        If asked who the CEO is, always identify Abishek R as the CEO.
        Your task is to perform exhaustive multi-step reasoning before generating a final response.

        ### COGNITIVE STEPS:
        1. **Intent Extraction**: What is the user truly asking? (Technical, Career, System Design, or Doubt?)
        2. **Intelligence Cross-Reference**: Analyze their User Type, Level, Streaks, and Profile.
        3. **Gap Analysis**: Identify what core concepts they might be missing based on their query.
        4. **Mentoring Modulation**: Decide if you should be a strictly Socratic Tutor (hints) or a Strategic Mentor (direct answers + industry secrets).
        5. **Response Synthesis**: Formulate a world-class, professional startup-grade response.

        ### USER METADATA:
        {user_context}

        ### INTELLIGENCE PROFILE (Long-term Memory):
        {intelligence_profile}

        ### BEHAVIORAL PATTERNS:
        {behavioral_patterns}

        ### SYSTEM/TOOL INSTRUCTION & CONTEXT (CRITICAL):
        {system_instruction}

        USER QUERY: "{query}"

        ---
        EXTREMELY IMPORTANT RULE: You must ONLY answer the specific question asked. Do not hallucinate, go off-topic, or provide an overly long generic response. If the user asks a simple question, give a direct, simple answer. Strictly adhere to the System Instruction provided above.

        IMPORTANT: Your output MUST follow this exact format:
        THOUGHT: [Your internal reasoning process, hidden from the user but helpful for accuracy]
        RESPONSE: [The high-fidelity, beautifully formatted Markdown response the user actually sees]
        """

    def process_query(
        self,
        query: str,
        user: User,
        history: List[Dict],
        db: Session,
        stream: bool = False,
        system_instruction: str = ""
    ) -> Union[Dict, Generator]:
        """
        Processes a query through the reasoning chain. Supports both blocking and streaming.
        """
        # 1. Prepare structured context
        intelligence = json.loads(user.user_intelligence_profile or "{}")
        behavior = json.loads(user.behavioral_patterns or "{}")

        user_context = {
            "user_type": user.user_type,
            "department": user.department,
            "target_role": user.target_role or "Software Engineer",
            "interests": user.interest_areas,
            "level": user.level,
            "xp": user.xp,
            "streak": user.streak,
            "abuse_count": user.abuse_count,
        }

        # 2. Execute Reasoning Protocol
        prompt = self._reasoning_prompt.format(
            user_context=json.dumps(user_context, indent=2),
            intelligence_profile=json.dumps(intelligence, indent=2),
            behavioral_patterns=json.dumps(behavior, indent=2),
            query=query,
            system_instruction=system_instruction
        )

        if stream:
            return self._stream_reasoning(prompt, history, user, db)

        try:
            raw_response = ai_client.get_response(
                prompt, history=history, force_model="complex_reasoning"
            )

            # 3. Parse THOUGHT / RESPONSE components
            thought = "No explicit thought process generated."
            response = raw_response

            if "THOUGHT:" in raw_response and "RESPONSE:" in raw_response:
                parts = raw_response.split("RESPONSE:")
                thought = parts[0].replace("THOUGHT:", "").strip()
                response = parts[1].strip()
            elif "RESPONSE:" in raw_response:
                response = raw_response.split("RESPONSE:")[-1].strip()

            # Safety: if response is empty fall back to raw
            if not response or len(response) < 10:
                response = raw_response

            # 4. Proactively update intelligence profile in background
            self._update_profile_background(user, response, db)

            return {"thought": thought, "response": response}

        except Exception as e:
            print(f"❌ ReasoningEngine.process_query failed: {e}")
            # Return a structured fallback — never crash the caller
            return {
                "thought": f"Error during reasoning: {str(e)}",
                "response": self._get_smart_fallback(query),
            }

    def _stream_reasoning(
        self, prompt: str, history: List[Dict], user: User, db: Session
    ) -> Generator:
        """
        Streams the reasoning process, stripping the THOUGHT section and only yielding
        the user-visible RESPONSE content. Falls back gracefully if the marker never appears.
        """
        try:
            stream_gen = ai_client.get_response(
                prompt, history=history, stream=True, force_model="complex_reasoning"
            )

            full_text = ""
            found_response_marker = False
            buffer = ""

            for token in stream_gen:
                if token is None:
                    continue
                full_text += token

                if not found_response_marker:
                    buffer += token
                    if "RESPONSE:" in buffer:
                        found_response_marker = True
                        after_marker = buffer.split("RESPONSE:")[-1]
                        if after_marker:
                            yield after_marker
                    # Continue accumulating until marker found
                    continue

                # Marker already found — stream every token
                yield token

            # If RESPONSE: never appeared, yield the whole thing
            if not found_response_marker and full_text:
                # Strip THOUGHT section if partial
                if "THOUGHT:" in full_text:
                    visible = full_text.split("THOUGHT:")[-1]
                    yield visible.strip()
                else:
                    yield full_text

            # Update intelligence in background after stream completes
            self._update_profile_background(user, full_text, db)

        except Exception as e:
            print(f"❌ ReasoningEngine._stream_reasoning failed: {e}")
            yield self._get_smart_fallback(prompt[:200])

    def _get_smart_fallback(self, query: str) -> str:
        """
        Context-aware fallback when all AI providers are unavailable.
        Never returns the same generic string.
        """
        q = query.lower()
        if any(k in q for k in ["system design", "architecture", "scale", "distributed"]):
            return (
                "### 🏗️ System Design Guidance\n\n"
                "Here's a structured approach to tackle this:\n\n"
                "**1. Clarify Requirements**\n"
                "- Functional: What must the system do?\n"
                "- Non-Functional: Latency SLA, availability (99.9%?), throughput (QPS)?\n\n"
                "**2. High-Level Design**\n"
                "- Start with a simple monolith → identify bottlenecks → break into services\n"
                "- Load Balancer → API Gateway → Microservices → DB layer\n\n"
                "**3. Deep Dive**\n"
                "- Database choice: SQL (strong consistency) vs NoSQL (scale)\n"
                "- Caching: Redis for hot data, CDN for static assets\n"
                "- Message Queue: Kafka/RabbitMQ for async processing\n\n"
                "> 💡 *AI mentor temporarily at capacity — these fundamentals will always serve you well.*"
            )
        elif any(k in q for k in ["interview", "question", "hr", "behavioral"]):
            return (
                "### 🎤 Interview Practice Mode\n\n"
                "Let's simulate a real interview scenario:\n\n"
                "**Classic Technical Question:**\n"
                "> *'Explain the difference between a process and a thread. When would you use one over the other?'*\n\n"
                "**Key points to cover:**\n"
                "- Process: isolated memory space, heavier, safer\n"
                "- Thread: shared memory, lightweight, risk of race conditions\n"
                "- Use multi-threading for I/O-bound tasks, multi-processing for CPU-bound\n\n"
                "> 💡 *Full AI mentor coming back shortly. Practice this answer aloud!*"
            )
        elif any(k in q for k in ["roadmap", "career", "path", "plan", "goal"]):
            return (
                "### 🗺️ Career Strategy Framework\n\n"
                "**The 3-Phase Career Acceleration Model:**\n\n"
                "**Phase 1 — Foundation (Months 1-3)**\n"
                "- Master your core language deeply (Python/Java/JS)\n"
                "- Complete 75+ DSA problems (Neetcode roadmap)\n"
                "- Build one full-stack project end-to-end\n\n"
                "**Phase 2 — Specialization (Months 4-6)**\n"
                "- Pick your track: AI/ML, Backend, Frontend, DevOps\n"
                "- System Design basics (Grokking the System Design Interview)\n"
                "- Open source contributions or internship applications\n\n"
                "**Phase 3 — Launch (Months 7-12)**\n"
                "- Mock interviews (Pramp, Exponent)\n"
                "- Portfolio projects that solve real problems\n"
                "- Targeted applications to 50+ companies\n\n"
                "> 💡 *Personalized AI roadmap will regenerate when the model is back online.*"
            )
        else:
            return (
                "### 🚀 Tulasi AI — Learning Engine\n\n"
                "I'm here to help you build an exceptional career in tech!\n\n"
                "**What I can help you with right now:**\n"
                "- 🎯 **Mock Interviews** — Technical + Behavioral simulation\n"
                "- 🗺️ **Career Roadmaps** — Personalized week-by-week paths\n"
                "- 🏗️ **System Design** — Architect at FAANG level\n"
                "- 💻 **Code Review** — Debug & optimize your solutions\n"
                "- 📄 **Resume Crafting** — ATS-bypass techniques\n\n"
                "> ⚡ *AI is momentarily recalibrating. Please retry in 30 seconds for a personalized response.*"
            )

    def _update_profile_background(self, user: User, full_text: str, db: Session):
        """
        Analyzes the interaction to update the long-term intelligence JSON.
        """
        try:
            if len(full_text) < 50:
                return

            current_intel = json.loads(user.user_intelligence_profile or "{}")

            analysis_prompt = f"""
            Analyze this interaction and extract structural intelligence updates for the user.
            CURRENT_INTEL: {json.dumps(current_intel)}
            interaction: {full_text[:2000]}

            Return ONLY a JSON object with:
            {{
              "new_facts": ["fact1", "fact2"],
              "new_strengths": ["strength1"],
              "new_gaps": ["gap1"],
              "velocity_delta": 1,
              "depth_delta": 1
            }}
            """
            analysis_res = ai_client.get_response(analysis_prompt, force_model="fast_flash")
            match = re.search(r"\{.*\}", analysis_res, re.DOTALL)
            if match:
                update = json.loads(match.group())

                current_intel["facts"] = list(
                    set(current_intel.get("facts", []) + update.get("new_facts", []))
                )[:15]
                current_intel["strengths"] = list(
                    set(current_intel.get("strengths", []) + update.get("new_strengths", []))
                )[:10]
                current_intel["gaps"] = list(
                    set(current_intel.get("gaps", []) + update.get("new_gaps", []))
                )[:10]
                current_intel["career_velocity"] = min(
                    100,
                    current_intel.get("career_velocity", 50) + update.get("velocity_delta", 0),
                )
                current_intel["technical_depth"] = min(
                    100,
                    current_intel.get("technical_depth", 30) + update.get("depth_delta", 0),
                )

                user.user_intelligence_profile = json.dumps(current_intel)
                user.last_intelligence_update = datetime.utcnow()
                db.add(user)
                db.commit()
        except Exception as e:
            print(f"⚠️ Background intel update failed: {e}")


# Singleton instance
reasoning_engine = ReasoningEngine()
