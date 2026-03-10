import os
from typing import List, Optional
from app.core.config import settings


def classify_query(message: str) -> str:
    """Classify query to route to best model."""
    code_keywords = ["code", "function", "debug", "error", "python", "javascript", "java", "c++", "sql", "algorithm", "syntax", "program", "compile"]
    interview_keywords = ["interview", "explain", "difference", "describe", "what is", "how does", "system design", "complexity"]
    
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in code_keywords):
        return "deepseek"
    elif any(kw in msg_lower for kw in interview_keywords):
        return "groq"
    return "gemini"


def get_ai_response(message: str, history: List[dict] = None, force_model: str = None) -> str:
    """Route to best AI model and return response."""
    history = history or []
    model_choice = force_model or classify_query(message)
    
    history_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in history[-8:]])
    system_prompt = """You are Tulasi AI — an expert, friendly learning assistant for students.
You help with: programming, career guidance, interview prep, and CS concepts.
Be concise, educational, and encouraging. Use markdown formatting for code."""

    # Try Gemini (General tutoring) — supports both GOOGLE_API_KEY and GEMINI_API_KEY
    gemini_key = settings.effective_gemini_key
    if model_choice == "gemini" and gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"{system_prompt}\n\nConversation:\n{history_text}\n\nUser: {message}\nAssistant:"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")

    # Try Groq Llama (Interview/Reasoning)
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend([{"role": m["role"], "content": m["content"]} for m in history[-8:]])
            messages.append({"role": "user", "content": message})
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                max_tokens=1500,
                temperature=0.7,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")

    # Fallback
    return f"I need an AI API key to respond intelligently. Please configure `GEMINI_API_KEY` or `GROQ_API_KEY` in your backend `.env` file.\n\nYou asked: *{message}*"
