"""
Tulasi AI — Clean Gemini Chat Router
Uses google-generativeai SDK with gemini-1.5-flash (stable, production-ready).
"""
import os
import uuid
from typing import Optional, List

import google.generativeai as genai
from dotenv import load_dotenv

# ── Load environment variables ─────────────────────────────────────
load_dotenv()

GOOGLE_API_KEY = (
    os.getenv("GOOGLE_API_KEY") or
    os.getenv("GEMINI_API_KEY") or
    ""
)

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    print(f"✅ Gemini configured with gemini-2.5-flash (key: {GOOGLE_API_KEY[:8]}...)")
else:
    print("⚠️  WARNING: No GOOGLE_API_KEY found. Set it in .env or Render environment.")

# ── Model name ─────────────────────────────────────────────────────
# NOTE: Your API keys are Google preview/experimental keys.
# These keys have access to gemini-2.5-flash (NOT gemini-1.5-flash).
# To use gemini-1.5-flash, get a standard key from: aistudio.google.com/app/apikey
GEMINI_MODEL = "gemini-2.5-flash"


# ── Core response function ─────────────────────────────────────────
def get_ai_response(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[bytes] = None,
    force_model: Optional[str] = None,
) -> str:
    """
    Generate an AI response using Gemini.

    Args:
        message:    The user's message.
        history:    Optional list of past messages {"role": str, "content": str}.
        image_data: Optional raw image bytes (JPEG/PNG).
        force_model: Override the model name (optional).

    Returns:
        AI response string.
    """
    try:
        model_name = force_model or GEMINI_MODEL
        model = genai.GenerativeModel(model_name)

        # ── Build content list ──────────────────────────────────────
        contents = []

        # Add chat history (last 10 turns)
        for m in (history or [])[-10:]:
            role = "user" if str(m.get("role", "")).lower() == "user" else "model"
            contents.append({
                "role": role,
                "parts": [m.get("content", "")],
            })

        # Add the current user message (+ optional image)
        current_parts: list = [message]
        if image_data:
            import base64
            current_parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": base64.b64encode(image_data).decode("utf-8"),
                }
            })

        contents.append({"role": "user", "parts": current_parts})

        # ── Call Gemini ─────────────────────────────────────────────
        response = model.generate_content(contents)

        if response and hasattr(response, "text") and response.text:
            return response.text

        return "No response generated"

    except Exception as e:
        error_msg = f"Sorry, I encountered an AI processing error: {e}"
        print(f"❌ Gemini error: {e}")
        return error_msg
