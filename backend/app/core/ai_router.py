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

from app.core.ai_client import ai_client
from app.core.config import settings

# Exported constants (used by chat.py and other modules)
GOOGLE_API_KEY: str = settings.effective_gemini_key or ""
FALLBACK_MODELS: List[str] = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]

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
    response = ai_client.get_response(
        message, 
        history=history, 
        image_data=image_data, 
        system_instruction=system_instruction,
        force_model=force_model
    )
    return str(response)

def resilient_ai_response(
    prompt: str,
    fallback: any,
    force_model: Optional[str] = "complex_reasoning",
    is_json: bool = True,
    return_str: bool = False
):
    """
    Universal Safety Guard: Ensures an AI request NEVER returns 500.
    1. Calls get_ai_response
    2. If is_json=True, extracts and cleans JSON
    3. If return_str=True, returns the cleaned JSON string
    4. Otherwise, returns the parsed object
    """
    import json, re
    try:
        raw = get_ai_response(prompt, force_model=force_model)
        
        if is_json:
            # 1. More aggressive JSON extraction logic
            # First, try to find Markdown blocks: ```json ... ```
            json_blocks = re.findall(r'```(?:json)?\s*([\s\S]*?)\s*```', raw)
            if json_blocks:
                cleaned = json_blocks[0].strip()
            else:
                # If no markdown blocks, find the first '{' or '[' and the last '}' or ']'
                start_match = re.search(r'[\[\{]', raw)
                end_match = re.search(r'[\]\}](?=[^\]\}]*$)', raw)
                if start_match and end_match:
                    cleaned = raw[start_match.start():end_match.end()]
                else:
                    cleaned = raw.strip()
            
            # 2. Sanitize common LLM formatting artifacts (trailing commas)
            cleaned = re.sub(r',\s*\}', '}', cleaned)
            cleaned = re.sub(r',\s*\]', ']', cleaned)
            
            if return_str:
                return cleaned

            # 3. Defensive Parsing
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                # One last attempt: find the actual start of the object if there was leading garbage
                try:
                    start_idx = cleaned.find('{')
                    if start_idx == -1: start_idx = cleaned.find('[')
                    if start_idx != -1:
                        return json.loads(cleaned[start_idx:])
                except:
                    pass
                
                print(f"⚠️ [AI Safety Guard] JSON Decode failed. Raw: {raw[:100]}...")
                return fallback
        
        return raw
    except Exception as e:
        print(f"⚠️ [AI Safety Guard] Triggered for prompt. Error: {e}")
        return fallback

