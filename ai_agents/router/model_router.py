import os
from langchain_community.chat_models import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../backend/.env'))

class ModelRouter:
    def __init__(self):
        # We try to initialize everything from environment
        try:
            self.groq_model = ChatGroq(temperature=0.7, model_name="llama3-70b-8192", api_key=os.environ.get("GROQ_API_KEY"))
        except:
            self.groq_model = None

        try:
            self.gemini_model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.environ.get("GEMINI_API_KEY"))
        except:
            self.gemini_model = None
            
        try:
            # DeepSeek can be called via OpenAI compatible endpoints or standard ChatOpenAI wrapper if needed
            self.deepseek_model = None # Placeholder for DeepSeek
        except:
            self.deepseek_model = None
            
    def get_best_model(self, task_type: str):
        """
        task_type can be: "coding", "fast_chat", "complex_reasoning"
        """
        if task_type == "coding":
            # Ideally DeepSeek, Fallback to Groq LLaMa 3
            if self.deepseek_model:
                return self.deepseek_model
            return self.groq_model or self.gemini_model
        
        elif task_type == "complex_reasoning":
            return self.gemini_model or self.groq_model
            
        elif task_type == "fast_chat":
            return self.groq_model or self.gemini_model
            
        # Default fallback
        return self.groq_model or self.gemini_model

# Singleton instance
ai_router = ModelRouter()
