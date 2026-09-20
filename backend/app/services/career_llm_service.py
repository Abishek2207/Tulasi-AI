import json
from app.core.config import settings


class CareerLLMService:
    def __init__(self):
        self._llm = None

    def _get_llm(self):
        """Lazy-load the LLM so startup doesn't fail if API key is missing."""
        if self._llm is None:
            from langchain_google_genai import ChatGoogleGenerativeAI
            api_key = settings.effective_gemini_key
            if not api_key:
                raise ValueError(
                    "No Gemini API key configured. Set GOOGLE_API_KEY or GEMINI_API_KEY in .env"
                )
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=api_key,
                temperature=0.7,
            )
        return self._llm

    def generate_roadmap(self, user_profile: dict) -> dict:
        """
        Generates a comprehensive career roadmap in JSON format based on the user's profile.
        Falls back to structured placeholder data if API key is missing.
        """
        from langchain.prompts import PromptTemplate

        prompt = PromptTemplate.from_template(
            """You are an elite career coach and AI intelligence engine for a modern platform called Tulasi AI.
A user has provided their profile and wants a highly structured, personalized career roadmap.

USER PROFILE:
- Target Role: {target_role}
- Department: {department}
- Interest Areas: {interest_areas}
- Current Level/Stage: {user_type}
- Existing Skills: {skills}

Generate a JSON roadmap with the following structure exactly (DO NOT wrap in markdown blocks like ```json):
{{
  "overview": "A brief, encouraging summary of what they need to focus on.",
  "estimated_months_to_goal": 6,
  "readiness_score": 35,
  "milestones": [
    {{
      "title": "Milestone 1 Name",
      "description": "What to achieve",
      "duration": "1 month",
      "focus_skills": ["Skill 1", "Skill 2"],
      "status": "pending"
    }}
  ],
  "recommended_projects": [
    {{
      "title": "Project Name",
      "description": "Short description of the project to build",
      "difficulty": "Beginner/Intermediate/Advanced"
    }}
  ],
  "daily_habits": ["Habit 1", "Habit 2"]
}}

Ensure the content is modern, highly relevant to {target_role}, and realistic.
Respond ONLY with raw, valid JSON.
"""
        )

        try:
            llm = self._get_llm()
            chain = prompt | llm
            response = chain.invoke({
                "target_role": user_profile.get("target_role", "Software Engineer"),
                "department": user_profile.get("department", "Computer Science"),
                "interest_areas": user_profile.get("interest_areas", "General tech"),
                "user_type": user_profile.get("user_type", "student"),
                "skills": user_profile.get("skills", "None specified"),
            })

            raw_text = response.content.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).strip()
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()

            return json.loads(raw_text)

        except Exception as e:
            print(f"[CareerLLMService] Roadmap generation failed: {e}")
            # Fallback instead of 500 Error
            return {
                "overview": "You are on the path to becoming an elite professional. Focus on these core milestones.",
                "estimated_months_to_goal": 6,
                "readiness_score": 35,
                "milestones": [
                    {
                        "title": "Foundation Mastery",
                        "description": "Master the fundamentals of your target role.",
                        "duration": "1-2 months",
                        "focus_skills": ["Core Concepts", "Basic Tools"],
                        "status": "pending"
                    },
                    {
                        "title": "Advanced Application",
                        "description": "Build complex projects and understand system design.",
                        "duration": "3-4 months",
                        "focus_skills": ["Architecture", "Optimization"],
                        "status": "pending"
                    }
                ],
                "recommended_projects": [
                    {
                        "title": "Portfolio Project",
                        "description": "A comprehensive project showcasing your end-to-end skills.",
                        "difficulty": "Intermediate"
                    }
                ],
                "daily_habits": ["Read technical blogs", "Write code daily", "Review PRs"]
            }

career_llm_service = CareerLLMService()
