import json
from typing import List, Dict, Optional
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
        You are the Tulasi AI Core Reasoning Engine — an AGI-level career strategist and technical lead.
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
        
        USER QUERY: "{query}"
        
        ---
        IMPORTANT: Your output MUST follow this exact format:
        THOUGHT: [Your internal reasoning process, hidden from the user but helpful for accuracy]
        RESPONSE: [The high-fidelity, beautifully formatted Markdown response the user actually sees]
        """

    def process_query(self, query: str, user: User, history: List[Dict], db: Session, stream: bool = False) -> Union[Dict, Generator]:
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
            "abuse_count": user.abuse_count
        }
        
        # 2. Execute Reasoning Protocol
        prompt = self._reasoning_prompt.format(
            user_context=json.dumps(user_context, indent=2),
            intelligence_profile=json.dumps(intelligence, indent=2),
            behavioral_patterns=json.dumps(behavior, indent=2),
            query=query
        )
        
        if stream:
            return self._stream_reasoning(prompt, history, user, db)

        try:
            # We use the 'complex_reasoning' model hint to ensure Gemini/best model is used
            raw_response = ai_client.get_response(prompt, history=history, force_model="complex_reasoning")
            
            # 3. Parse components
            thought = "No explicit thought process generated."
            response = raw_response
            
            if "THOUGHT:" in raw_response and "RESPONSE:" in raw_response:
                parts = raw_response.split("RESPONSE:")
                thought = parts[0].replace("THOUGHT:", "").strip()
                response = parts[1].strip()
            
            # 4. Proactively update intelligence profile (facts/strengths/gaps)
            self._update_profile_background(user, response, db)
            
            return {
                "thought": thought,
                "response": response
            }

        except Exception as e:
            print(f"❌ ReasoningEngine failed: {e}")
            return {
                "thought": f"Error during reasoning: {str(e)}",
                "response": "An internal cognition error occurred. Proceeding with standard chat logic."
            }

    def _stream_reasoning(self, prompt: str, history: List[Dict], user: User, db: Session) -> Generator:
        """
        Streams the reasoning process, skipping the 'THOUGHT:' part for the final user output
        but allowing future extension to show thinking.
        """
        stream_gen = ai_client.get_response(prompt, history=history, stream=True, force_model="complex_reasoning")
        
        full_text = ""
        found_response_marker = False
        
        for token in stream_gen:
            full_text += token
            
            # If we haven't found the RESPONSE: marker yet, we check if it just appeared
            if not found_response_marker:
                if "RESPONSE:" in full_text:
                    found_response_marker = True
                    # Yield anything that came after the marker in this token
                    split_part = full_text.split("RESPONSE:")[1]
                    if split_part:
                        yield split_part
                continue
            
            # Once marker found, we just yield the tokens
            yield token

        # After stream ends, we can update intelligence in background
        # (Note: In a real production app, we'd use a background task worker like Celery or FastAPI BackgroundTasks)
        self._update_profile_background(user, full_text, db)

    def _update_profile_background(self, user: User, full_text: str, db: Session):
        """
        Analyzes the interaction to update the long-term intelligence JSON.
        """
        try:
            # We skip if the text is too short or error-like
            if len(full_text) < 50: return
            
            # Prompt AI to extract facts/strengths/gaps from the conversation
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
            import re
            match = re.search(r'\{.*\}', analysis_res, re.DOTALL)
            if match:
                update = json.loads(match.group())
                
                # Merge logic
                current_intel["facts"] = list(set((current_intel.get("facts", []) + update.get("new_facts", []))))[:15]
                current_intel["strengths"] = list(set((current_intel.get("strengths", []) + update.get("new_strengths", []))))[:10]
                current_intel["gaps"] = list(set((current_intel.get("gaps", []) + update.get("new_gaps", []))))[:10]
                current_intel["career_velocity"] = min(100, current_intel.get("career_velocity", 50) + update.get("velocity_delta", 0))
                current_intel["technical_depth"] = min(100, current_intel.get("technical_depth", 30) + update.get("depth_delta", 0))
                
                user.user_intelligence_profile = json.dumps(current_intel)
                user.last_intelligence_update = datetime.utcnow()
                db.add(user)
                db.commit()
                # print(f"✅ Intelligence profile updated for user {user.id}")
        except Exception as e:
            print(f"⚠️ Background intel update failed: {e}")

# Singleton instance
reasoning_engine = ReasoningEngine()
