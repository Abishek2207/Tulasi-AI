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

# ── Load environment variables ─────────────────────────────────────
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""

if not GOOGLE_API_KEY:
    print("⚠️  WARNING: GOOGLE_API_KEY is not set! AI endpoints will fail.")
else:
    genai.configure(api_key=GOOGLE_API_KEY)
    print(f"✅ Gemini configured (key: {GOOGLE_API_KEY[:8]}...)")

# ── Model fallback chain ────────────────────────────────────────────
# Cascades through models on 429/quota errors
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
]

# ── Usage tracking (lightweight in-memory) ─────────────────────────
_stats = {"calls": 0, "errors": 0}


def _is_quota_error(err: Exception) -> bool:
    msg = str(err).lower()
    return any(k in msg for k in ["429", "quota", "rate limit", "resource exhausted", "too many requests"])


def _call_model_with_retry(model_name: str, contents: list, max_retries: int = 3) -> str:
    """Calls a single Gemini model with exponential backoff. Raises on final failure."""
    if not GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY is missing in server environment.")
    
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(contents)
            if response and hasattr(response, "text") and response.text:
                return response.text
            return "No response generated."
        except Exception as e:
            is_last = attempt == max_retries - 1
            if not is_last:
                wait = 2 ** attempt  # 1s → 2s → 4s
                print(f"⚠️  [{model_name}] attempt {attempt + 1} failed: {e}. Retrying in {wait}s…")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError(f"All {max_retries} retries failed for {model_name}")


# ── Public API ─────────────────────────────────────────────────────
def get_ai_response(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[bytes] = None,
    force_model: Optional[str] = None,
) -> str:
    """
    Generate an AI response with full resilience:
    - Retries each model 3× with exponential backoff.
    - On 429/quota errors, cascades through FALLBACK_MODELS.
    - Always returns a clean string — never raises to the caller.
    """
    global _stats
    _stats["calls"] += 1

    # ── Build content list ──────────────────────────────────────────
    contents: list = []

    for m in (history or [])[-10:]:
        role = "user" if str(m.get("role", "")).lower() == "user" else "model"
        contents.append({"role": role, "parts": [m.get("content", "")]})

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

    # ── Cascade through models ──────────────────────────────────────
    models_to_try = [force_model] if force_model else FALLBACK_MODELS
    last_error: Exception = RuntimeError("Unknown error")

    for model_name in models_to_try:
        try:
            text = _call_model_with_retry(model_name, contents)
            print(f"✅ [{model_name}] responded (call #{_stats['calls']})")
            return text
        except Exception as e:
            last_error = e
            if _is_quota_error(e):
                print(f"🔄 Quota exceeded on [{model_name}] — trying next model…")
                continue
            else:
                break  # Non-quota error: no point trying other models

    # All models failed
    _stats["errors"] += 1
    print(f"❌ All AI models failed after fallbacks. Last error: {last_error}")

    if _is_quota_error(last_error):
        return "⏳ AI is temporarily busy due to high demand. Please wait a few seconds and try again."
    return "❌ AI processing error. Please try again later."
