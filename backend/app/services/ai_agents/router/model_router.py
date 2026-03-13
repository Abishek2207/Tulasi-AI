import os

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
                self._groq_model = ChatGroq(temperature=0.7, model_name="llama3-70b-8192", api_key=os.environ.get("GROQ_API_KEY"))
            except:
                pass
        return self._groq_model

    @property
    def gemini_model(self):
        if self._gemini_model is None:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                self._gemini_model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.environ.get("GEMINI_API_KEY"))
            except:
                pass
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
