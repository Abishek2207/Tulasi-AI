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


def get_ai_response(message: str, history: List[dict] = None, force_model: str = None, image_data: Optional[bytes] = None) -> str:
    """Route to best AI model and return response."""
    history = history or []
    model_choice = force_model or classify_query(message)
    gemini_key = settings.effective_gemini_key
    
    # Force Gemini if an image is provided
    if image_data:
        model_choice = "gemini"

    history_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in history[-8:]])
    system_prompt = """You are Tulasi AI — an expert, friendly learning assistant for students.
You help with: programming, career guidance, interview prep, and CS concepts.
Be concise, educational, and encouraging. Use markdown formatting for code."""

    # Try Gemini (General tutoring + Vision)
    if (model_choice in ["gemini", "deepseek"]) and gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            contents = [f"{system_prompt}\n\nConversation:\n{history_text}\n\nUser: {message}"]
            
            if image_data:
                from PIL import Image
                import io
                image = Image.open(io.BytesIO(image_data))
                contents.append(image)
                
            response = model.generate_content(contents)
            if response and response.text:
                return response.text
            print(f"Gemini returned empty response for {model_choice}")
        except Exception as e:
            print(f"Gemini error: {e}")

    # Try Groq Llama (Interview/Reasoning/Fallback)
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            messages_list = [{"role": "system", "content": system_prompt}]
            messages_list.extend([{"role": m["role"], "content": m["content"]} for m in history[-8:]])
            messages_list.append({"role": "user", "content": message})
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages_list,
                max_tokens=1500,
                temperature=0.7,
            )
            if completion.choices[0].message.content:
                return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq error: {e}")

    # Final Fallback
    msg = f"I need an AI API key to respond. Please configure `GOOGLE_API_KEY` or `GROQ_API_KEY` in your backend `.env` file.\n\n(Current Model Choice: {model_choice})"
    print(f"DEBUG: No AI key found. Returning fallback message.")
    return msg
