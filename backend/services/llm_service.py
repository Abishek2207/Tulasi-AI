import os
import google.generativeai as genai
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        # Primary: Gemini
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        if self.google_api_key:
            genai.configure(api_key=self.google_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Fallback: Groq
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        if self.groq_api_key:
            self.groq_model = ChatGroq(
                temperature=0.7,
                model_name="llama3-70b-8192",
                groq_api_key=self.groq_api_key
            )

    async def generate_response(self, prompt: str, context: str = "") -> str:
        """Generates a response using Gemini, with Groq as fallback."""
        full_prompt = f"Context: {context}\n\nUser: {prompt}\n\nAI:" if context else prompt
        
        # Try Gemini
        if self.google_api_key:
            try:
                response = self.gemini_model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                print(f"Gemini Error: {e}. Falling back to Groq...")
        
        # Fallback to Groq
        if self.groq_api_key:
            try:
                response = self.groq_model.invoke(full_prompt)
                return response.content
            except Exception as e:
                print(f"Groq Error: {e}.")
        
        return "I'm sorry, I'm having trouble connecting to my neural core right now."

    async def stream_response(self, prompt: str, context: str = ""):
        """Placeholder for streaming response."""
        # Note: True streaming requires specific FastAPI responses, 
        # but the logic remains similar to generate_response.
        pass

llm_service = LLMService()
