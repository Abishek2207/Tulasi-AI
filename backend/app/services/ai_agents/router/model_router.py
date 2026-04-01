import os

from app.core.config import settings

class ModelRouter:
    def __init__(self):
        self._groq_model = None
        self._gemini_model = None
        self._deepseek_model = None
        
    @property
    def groq_model(self):
        if self._groq_model is None:
            try:
                from langchain_community.chat_models import ChatGroq
                if settings.GROQ_API_KEY:
                    self._groq_model = ChatGroq(temperature=0.7, model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
            except:
                pass
        return self._groq_model

    @property
    def gemini_model(self):
        if self._gemini_model is None:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                gemini_key = settings.effective_gemini_key
                if gemini_key:
                    self._gemini_model = ChatGoogleGenerativeAI(
                        model="gemini-2.0-flash-lite",  # cheapest free-tier model
                        google_api_key=gemini_key,
                        temperature=0.7,
                    )
            except Exception as e:
                print(f"⚠️  Could not init Gemini model: {e}")
        return self._gemini_model

    def get_best_model(self, task_type: str):
        """
        task_type can be: "coding", "fast_chat", "complex_reasoning"
        """
        if task_type == "coding":
            return self.groq_model or self.gemini_model
        
        elif task_type == "complex_reasoning":
            return self.gemini_model or self.groq_model
            
        elif task_type == "fast_chat":
            return self.groq_model or self.gemini_model
            
        return self.groq_model or self.gemini_model

# Singleton instance
ai_router = ModelRouter()
