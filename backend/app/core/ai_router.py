import os
import hashlib
import requests
import time
from typing import List, Optional
from dotenv import load_dotenv

# Load .env before reading env vars
load_dotenv()

# ── API Key ────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or ""

if GEMINI_API_KEY:
    print(f"✅ Gemini API key loaded (key: {GEMINI_API_KEY[:8]}...)")
else:
    print("⚠️  WARNING: No Gemini API key found. Set GOOGLE_API_KEY or GEMINI_API_KEY in .env")

# ── Langflow ───────────────────────────────────────────────────────
LANGFLOW_API_URL = os.getenv("LANGFLOW_API_URL", "")

# ── Simple Time-Aware Cache (text-only, 5-min TTL) ────────────────
_response_cache: dict = {}
_CACHE_TTL = 300
_CACHE_MAX = 256


def _cache_key(message: str, history_summary: str) -> str:
    raw = f"{message}|{history_summary}"
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached(key: str) -> Optional[str]:
    if key in _response_cache:
        value, ts = _response_cache[key]
        if time.time() - ts < _CACHE_TTL:
            return value
        del _response_cache[key]
    return None


def _set_cached(key: str, value: str):
    if len(_response_cache) >= _CACHE_MAX:
        oldest = min(_response_cache, key=lambda k: _response_cache[k][1])
        del _response_cache[oldest]
    _response_cache[key] = (value, time.time())


# ── Langflow ───────────────────────────────────────────────────────
def call_langflow(message: str) -> Optional[str]:
    """Call Langflow backend pipeline if LANGFLOW_API_URL is configured."""
    if not LANGFLOW_API_URL:
        return None
    try:
        resp = requests.post(
            LANGFLOW_API_URL,
            json={"input_value": message},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            outputs = data.get("outputs", [])
            if outputs:
                result = outputs[0].get("outputs", [{}])[0]
                return result.get("results", {}).get("message", {}).get("text")
            return data.get("result", {}).get("output")
        print(f"⚠️  Langflow returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"⚠️  Langflow connection error: {e}")
    return None


# ── Gemini via REST API ────────────────────────────────────────────
def _call_gemini_rest(model_name: str, prompt_parts: list) -> str:
    """
    Call Gemini via the v1beta REST API directly.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": prompt_parts}
    resp = requests.post(url, json=payload, timeout=30)
    
    if resp.status_code != 200:
        raise Exception(f"Gemini REST API error {resp.status_code}: {resp.text[:300]}")
    
    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise Exception(f"No candidates in Gemini response: {data}")
    
    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        raise Exception("Empty parts in Gemini response")
    
    return parts[0].get("text", "")


def call_gemini_with_fallback(contents: list) -> str:
    """
    Try gemini-2.5-flash (experimental track) via direct REST API.
    The provided API key does not have access to standard v1 models.
    """
    # gemini-2.5-flash is current default; fallback to gemini-2.5-pro
    models_to_try = ["gemini-2.5-flash", "gemini-2.5-pro"]
    last_error = None

    for model_name in models_to_try:
        for attempt in range(2):
            try:
                result = _call_gemini_rest(model_name, contents)
                if result:
                    print(f"✅ [{model_name}] responded on attempt {attempt + 1}")
                    return result
            except Exception as e:
                last_error = e
                print(f"⚠️  [{model_name}] attempt {attempt + 1} failed: {e}")
                time.sleep(1.5 ** attempt)

    raise Exception(f"All Gemini models failed. Last error: {last_error}")


# ── Build REST-compatible contents list ───────────────────────────
def _build_contents(
    message: str,
    history: Optional[List[dict]],
    image_data: Optional[bytes],
    system_instruction: str
) -> list:
    """Convert chat history + message into Gemini REST API contents format."""
    contents = []

    if history:
        for m in history[-10:]:
            # v1 API expects role 'user' or 'model'
            role = "user" if str(m.get("role", "")).lower() == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": str(m.get("content", ""))}]
            })

    # Current message parts
    current_parts = []
    if not history:
        current_parts.append({"text": system_instruction + "\n\n" + str(message)})
    else:
        current_parts.append({"text": str(message)})

    if image_data:
        import base64
        current_parts.append({
            "inline_data": {  # REST API uses inline_data (snake_case in some SDK docs, but camelCase works too. Testing with camelCase if snake fails)
                "mimeType": "image/jpeg",
                "data": base64.b64encode(image_data).decode("utf-8")
            }
        })

    contents.append({"role": "user", "parts": current_parts})
    return contents


# ── Main Public Function ───────────────────────────────────────────
def get_ai_response(
    message: str,
    history: Optional[List[dict]] = None,
    image_data: Optional[bytes] = None,
    force_model: Optional[str] = None
) -> str:
    """
    Generate AI response.
    Flow: Cache → Langflow → Gemini v1 REST (2.0-flash → 1.5-pro, with retries)
    """
    try:
        cache_key = None

        # 1. Cache (text-only)
        if not image_data:
            history_summary = "|".join(
                f"{m.get('role')}:{m.get('content', '')[:50]}"
                for m in (history or [])[-5:]
            )
            cache_key = _cache_key(message, history_summary)
            cached = _get_cached(cache_key)
            if cached:
                print(f"⚡ Cache hit: {message[:50]}")
                return cached

        # 2. Langflow (if configured)
        langflow_res = call_langflow(message)
        if langflow_res:
            if cache_key:
                _set_cached(cache_key, langflow_res)
            return langflow_res

        # 3. Gemini via v1 REST
        system_instruction = (
            "You are Tulasi AI — an expert, friendly learning assistant for students.\n"
            "You help with: programming, career guidance, interview prep, and CS concepts.\n"
            "Be concise, educational, and encouraging."
        )

        contents = _build_contents(message, history, image_data, system_instruction)
        result = call_gemini_with_fallback(contents)

        if cache_key and result:
            _set_cached(cache_key, result)

        return result

    except Exception as e:
        print(f"❌ AI Router Error: {e}")
        return "Sorry, I encountered an AI processing error. Please try again later."
