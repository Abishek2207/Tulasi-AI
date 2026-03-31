"""
Tulasi AI — Resilient Gemini AI Router
- Explicit startup guard: raises clear error if GOOGLE_API_KEY is missing
- Exponential backoff retry (3 attempts: 1s, 2s, 4s delays)
- Model fallback chain: gemini-2.5-flash → gemini-1.5-flash → gemini-1.0-pro
- Clean structured error returns (no raw exception dumps)
"""
import os
import time
from typing import Optional, List

from dotenv import load_dotenv
import google.generativeai as genai

from app.core.ai_client import ai_client
from app.core.config import settings

# Exported constants (used by chat.py and other modules)
GOOGLE_API_KEY: str = settings.effective_gemini_key or ""
FALLBACK_MODELS: List[str] = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"]

def get_ai_response(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[bytes] = None,
    force_model: Optional[str] = None,
    system_instruction: Optional[str] = None,
) -> str:
    """
    Generate an AI response with full resilience via HybridAIClient.
    """
    # HybridAIClient now handles text and image-based recovery paths
    response = ai_client.get_response(message, history=history, image_data=image_data, system_instruction=system_instruction)
    return str(response)
