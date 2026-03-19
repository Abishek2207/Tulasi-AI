"""
Tulasi AI — Resilient Gemini AI Router
- Exponential backoff retry (3 attempts: 1s, 2s, 4s delays)
- Model fallback chain: gemini-2.5-flash → gemini-1.5-flash → gemini-1.0-pro
- Clean structured error returns (no raw exception dumps)
- Usage logging per call
"""
import os
import time
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
    print(f"✅ Gemini configured (key: {GOOGLE_API_KEY[:8]}...)")
else:
    print("⚠️  WARNING: No GOOGLE_API_KEY found. Set it in .env or Render environment.")

# ── Model fallback chain ────────────────────────────────────────────
# If a model returns 429 / quota error, we cascade to the next one
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
]

# ── Usage tracker (in-memory, lightweight) ─────────────────────────
_call_count: int = 0
_error_count: int = 0


def _is_quota_error(err: Exception) -> bool:
    """Returns True if the exception looks like a 429 quota/rate-limit error."""
    msg = str(err).lower()
    return any(k in msg for k in ["429", "quota", "rate limit", "resource exhausted", "too many requests"])


def _call_model_with_retry(model_name: str, contents: list, max_retries: int = 3) -> str:
    """
    Calls a single Gemini model with exponential backoff.
    Raises the last exception if all retries fail.
    Returns the response text on success.
    """
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(contents)
            if response and hasattr(response, "text") and response.text:
                return response.text
            return "No response generated."
        except Exception as e:
            if _is_quota_error(e) or attempt < max_retries - 1:
                wait = 2 ** attempt  # 1s, 2s, 4s
                print(f"⚠️  [{model_name}] Attempt {attempt+1} failed: {e}. Retrying in {wait}s...")
                time.sleep(wait)
                continue
            raise  # non-quota error on last attempt → propagate
    raise RuntimeError(f"All {max_retries} retries failed for model {model_name}")


# ── Core response function ─────────────────────────────────────────
def get_ai_response(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[bytes] = None,
    force_model: Optional[str] = None,
) -> str:
    """
    Generate an AI response using Gemini with resilience.

    - Retries each model up to 3× with exponential backoff.
    - On 429 / quota errors, cascades through FALLBACK_MODELS.
    - Returns a clean friendly error string — never raises to the caller.
    """
    global _call_count, _error_count
    _call_count += 1

    # ── Build content list ──────────────────────────────────────────
    contents = []

    # Add last 10 history turns
    for m in (history or [])[-10:]:
        role = "user" if str(m.get("role", "")).lower() == "user" else "model"
        contents.append({"role": role, "parts": [m.get("content", "")]})

    # Add current user message (+ optional image)
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
            print(f"✅ AI response from [{model_name}] (call #{_call_count})")
            return text
        except Exception as e:
            last_error = e
            if _is_quota_error(e):
                print(f"🔄 Quota/Rate limit on [{model_name}] — trying next model...")
                continue  # try next in chain
            else:
                # Non-quota error (auth, bad request, etc.) — no point trying other models
                break

    # All models exhausted
    _error_count += 1
    print(f"❌ All AI models failed. Last error: {last_error}")

    if _is_quota_error(last_error):
        return "⏳ AI is temporarily busy due to high demand. Please wait a few seconds and try again."
    return f"❌ AI processing error. Please try again later."
