import os
import google.generativeai as genai
from typing import List, Optional

# API key initialization
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize model with the supported latest version
model = genai.GenerativeModel("gemini-1.5-flash-latest")

def get_ai_response(
    message: str, 
    history: Optional[List[dict]] = None, 
    image_data: Optional[bytes] = None,
    force_model: Optional[str] = None
) -> str:
    """Generate AI response using Gemini directly."""
    try:
        messages = []
        
        system_instruction = (
            "You are Tulasi AI — an expert, friendly learning assistant for students.\n"
            "You help with: programming, career guidance, interview prep, and CS concepts.\n"
            "Be concise, educational, and encouraging."
        )
        
        if history:
            for m in history[-10:]:
                role = "user" if m.get("role") == "user" else "model"
                messages.append({"role": role, "parts": [m.get("content", "")]})
        
        current_parts = []
        
        if not history:
            current_parts.append(system_instruction + "\n\n" + message)
        else:
            current_parts.append(message)
            
        if image_data:
            current_parts.append({"mime_type": "image/jpeg", "data": image_data})
            
        messages.append({"role": "user", "parts": current_parts})

        response = model.generate_content(messages)
        return response.text if response else "No response generated."
    except Exception as e:
        print(f"AI Error: {e}")
        return f"Sorry, I encountered an AI processing error: {e}"
