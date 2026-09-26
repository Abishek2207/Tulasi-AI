import os
import json
import time
import httpx
from google import genai as google_genai
from google.genai import types as genai_types
from typing import List, Dict, Optional, Generator, Union
from app.core.config import settings


class AIClientError(Exception):
    """Base error for AI client"""
    pass


class HybridAIClient:
    """
    Hybrid AI client with resilient fallback chain:
      1. Gemini (multiple free-tier models, newest first)
      2. OpenRouter (google/gemma-2-9b-it:free — robust free model)
      3. Groq (openai/gpt-oss-20b)
      4. Mock fallback (always succeeds, context-aware)
    """

    GEMINI_MODELS = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
    ]

    OPENROUTER_FREE_MODELS = [
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3-8b-instruct:free",
        "gryphe/mythomist-7b:free",
    ]

    def __init__(self):
        self.gemini_key = settings.effective_gemini_key
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        env_or_model = settings.OPENROUTER_MODEL or ""
        self.openrouter_model = env_or_model if env_or_model else self.OPENROUTER_FREE_MODELS[0]

    # ── Formatters ────────────────────────────────────────────────────────────

    def _format_for_gemini(
        self,
        message: str,
        history: List[Dict],
        image_data: Optional[bytes] = None,
    ) -> List[Dict]:
        contents = []
        for m in (history or []):
            role = "user" if m.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

        current_parts: list = [{"text": message}]
        if image_data:
            import base64
            current_parts.append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": base64.b64encode(image_data).decode("utf-8"),
                }
            })
        contents.append({"role": "user", "parts": current_parts})
        return contents

    def _format_for_openai_compat(
        self,
        message: str,
        history: List[Dict],
        system_instruction: Optional[str] = None,
    ) -> List[Dict]:
        """Shared formatter for OpenRouter and Groq."""
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        for m in (history or []):
            role = "assistant" if m.get("role") == "model" else m.get("role", "user")
            messages.append({"role": role, "content": m.get("content", "")})
        messages.append({"role": "user", "content": message})
        return messages

    # ── Provider Callers ──────────────────────────────────────────────────────

    def _is_quota_error(self, error_text: str) -> bool:
        lowered = error_text.lower()
        quota_keywords = [
            "quota", "rate limit", "429", "resource_exhausted",
            "resourceexhausted", "too many requests", "model not found",
            "404", "invalid model", "does not exist", "not supported",
            "permission_denied", "permissiondenied",
        ]
        return any(k in lowered for k in quota_keywords)

    def _call_gemini(
        self,
        contents: List[Dict],
        model_name: str,
        stream: bool = False,
        system_instruction: Optional[str] = None,
    ) -> Union[str, Generator]:
        gemini_key = (
            os.getenv("GOOGLE_API_KEY")
            or os.getenv("GEMINI_API_KEY")
            or self.gemini_key
        )
        if not gemini_key:
            raise AIClientError("Gemini API key is missing.")

        client = google_genai.Client(api_key=gemini_key)

        # Convert our internal history format to google.genai Content objects
        genai_contents = []
        for item in contents:
            role = item.get("role", "user")
            parts = item.get("parts", [])
            genai_parts = [genai_types.Part.from_text(text=p["text"]) for p in parts if "text" in p]
            genai_contents.append(genai_types.Content(role=role, parts=genai_parts))

        config = genai_types.GenerateContentConfig(
            system_instruction=system_instruction,
        )

        if stream:
            def gen():
                response_stream = client.models.generate_content_stream(
                    model=model_name,
                    contents=genai_contents,
                    config=config,
                )
                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text
            return gen()
        else:
            response = client.models.generate_content(
                model=model_name,
                contents=genai_contents,
                config=config,
            )
            if response and response.text:
                return response.text
            return "No response generated."

    def _call_openrouter(
        self,
        messages: List[Dict],
        model: Optional[str] = None,
        stream: bool = False,
    ) -> Union[str, Generator]:
        openrouter_key = os.getenv("OPENROUTER_API_KEY") or self.openrouter_key
        if not openrouter_key:
            raise AIClientError("Missing OPENROUTER_API_KEY environment variable")

        chosen_model = model or self.openrouter_model
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "HTTP-Referer": "https://tulasiai.in",
            "X-Title": "Tulasi AI",
            "Content-Type": "application/json",
        }
        payload = {"model": chosen_model, "messages": messages, "stream": stream}

        if stream:
            def gen():
                with httpx.stream("POST", url, headers=headers, json=payload, timeout=45.0) as resp:
                    if resp.status_code != 200:
                        body = resp.read().decode("utf-8", errors="replace")
                        raise AIClientError(
                            f"OpenRouter API error ({resp.status_code}) model={chosen_model}: {body}"
                        )
                    for line in resp.iter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            try:
                                content = json.loads(data_str)["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except Exception:
                                continue

            return gen()
        else:
            with httpx.Client(timeout=45.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code != 200:
                    raise AIClientError(
                        f"OpenRouter API error ({resp.status_code}) model={chosen_model}: {resp.text}"
                    )
                return resp.json()["choices"][0]["message"]["content"]

    def _call_groq(
        self,
        messages: List[Dict],
        stream: bool = False,
    ) -> Union[str, Generator]:
        groq_key = os.getenv("GROQ_API_KEY") or self.groq_key
        if not groq_key:
            raise AIClientError("Missing GROQ_API_KEY environment variable")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json",
        }
        payload = {"model": "openai/gpt-oss-20b", "messages": messages, "stream": stream}

        if stream:
            def gen():
                with httpx.stream("POST", url, headers=headers, json=payload, timeout=30.0) as resp:
                    if resp.status_code != 200:
                        raise AIClientError(f"Groq API error ({resp.status_code}): {resp.text}")
                    for line in resp.iter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            try:
                                content = json.loads(data_str)["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except Exception:
                                continue

            return gen()
        else:
            with httpx.Client(timeout=30.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code != 200:
                    raise AIClientError(f"Groq API error ({resp.status_code}): {resp.text}")
                return resp.json()["choices"][0]["message"]["content"]

    def _call_mock_fallback(self, message: str, stream: bool = False) -> Union[str, Generator]:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="SERVICE_UNAVAILABLE: AI provider failed")

    # ── Main Entry Point ──────────────────────────────────────────────────────

    def get_response(
        self,
        message: str,
        history: List[Dict] = None,
        image_data: Optional[bytes] = None,
        stream: bool = False,
        system_instruction: Optional[str] = None,
        force_model: Optional[str] = None,
    ) -> Union[str, Generator]:
        """
        Main entry point. Tries providers in order:
          Gemini (all models) → OpenRouter (all free models) → Groq → Mock
        """
        history = history or []
        gemini_contents = self._format_for_gemini(message, history, image_data=image_data)
        compat_messages = self._format_for_openai_compat(message, history, system_instruction=system_instruction)
        errors: List[str] = []

        if stream:
            def master_gen():
                # ── 0. force_model override ──
                if force_model:
                    try:
                        f_model = self.GEMINI_MODELS[0] if force_model == "complex_reasoning" else force_model
                        if any(m in f_model for m in ["gemini", "gemma"]) or f_model.startswith("models/"):
                            print(f"🎯 [AI] Forcing model: {f_model} (stream)")
                            model_gen = self._call_gemini(gemini_contents, f_model, stream=True, system_instruction=system_instruction)
                            yielded_any = False
                            for chunk in model_gen:
                                yielded_any = True
                                yield chunk
                            if yielded_any:
                                return
                        elif "/" in f_model:
                            print(f"🎯 [AI] Forcing OpenRouter: {f_model} (stream)")
                            model_gen = self._call_openrouter(compat_messages, model=f_model, stream=True)
                            yielded_any = False
                            for chunk in model_gen:
                                yielded_any = True
                                yield chunk
                            if yielded_any:
                                return
                        elif "llama" in f_model.lower() or f_model == "fast_flash":
                            print(f"🎯 [AI] Forcing Groq (stream)")
                            model_gen = self._call_groq(compat_messages, stream=True)
                            yielded_any = False
                            for chunk in model_gen:
                                yielded_any = True
                                yield chunk
                            if yielded_any:
                                return
                    except Exception as fe:
                        print(f"⚠️ [AI] Force model failed (stream): {fe}")
                        errors.append(f"ForceModel: {fe}")

                # ── 1. Gemini fallback chain ──
                for model_name in self.GEMINI_MODELS:
                    try:
                        print(f"📡 [AI] Trying Gemini {model_name} (stream)")
                        model_gen = self._call_gemini(gemini_contents, model_name, stream=True, system_instruction=system_instruction)
                        yielded_any = False
                        for chunk in model_gen:
                            yielded_any = True
                            yield chunk
                        if yielded_any:
                            return
                        print(f"⚠️ [AI] Gemini {model_name} returned empty")
                    except Exception as e:
                        err = str(e)
                        print(f"⚠️ [AI] Gemini {model_name} failed: {err}")
                        errors.append(f"Gemini/{model_name}: {err}")
                        if "API key" in err or "400" in err or "429" in err or "quota" in err.lower():
                            print("⏭️ [AI] Skipping remaining Gemini models due to Auth/Quota error.")
                            break


                # ── 2. OpenRouter fallback chain ──
                or_models = [self.openrouter_model] + [m for m in self.OPENROUTER_FREE_MODELS if m != self.openrouter_model]
                for or_model in or_models:
                    try:
                        print(f"🔄 [AI] Trying OpenRouter {or_model} (stream)")
                        or_gen = self._call_openrouter(compat_messages, model=or_model, stream=True)
                        yielded_any = False
                        for chunk in or_gen:
                            yielded_any = True
                            yield chunk
                        if yielded_any:
                            return
                        print(f"⚠️ [AI] OpenRouter {or_model} returned empty")
                    except Exception as e:
                        err = str(e)
                        print(f"❌ [AI] OpenRouter {or_model} failed: {err}")
                        errors.append(f"OpenRouter/{or_model}: {err}")
                        if "401" in err or "403" in err or "429" in err or "quota" in err.lower() or "credits" in err.lower():
                            print("⏭️ [AI] Skipping remaining OpenRouter models due to Auth/Quota error.")
                            break


                # ── 3. Groq ──
                try:
                    print("🔄 [AI] Trying Groq (stream)")
                    groq_gen = self._call_groq(compat_messages, stream=True)
                    yielded_any = False
                    for chunk in groq_gen:
                        yielded_any = True
                        yield chunk
                    if yielded_any:
                        return
                except Exception as e:
                    err = str(e)
                    print(f"❌ [AI] Groq failed: {err}")
                    errors.append(f"Groq: {err}")

                # ── 4. Mock fallback ──
                print(f"🔄 [AI] All providers failed — using Mock Fallback. Errors: {errors}")
                for chunk in self._call_mock_fallback(message, stream=True):
                    yield chunk

            return master_gen()

        else:
            # ── Non-streaming path ──
            if force_model:
                try:
                    f_model = self.GEMINI_MODELS[0] if force_model == "complex_reasoning" else force_model
                    f_model_lower = f_model.lower()
                    if f_model == "fast_flash":
                        # Fast Flash = fastest Gemini model (sub-1s responses)
                        print(f"🎯 [AI] Fast Flash → gemini-2.0-flash-lite")
                        res = self._call_gemini(gemini_contents, "gemini-2.0-flash-lite", stream=False, system_instruction=system_instruction)
                        if res and res != "No response generated.":
                            return res
                        # Fallback to next fastest Gemini
                        res = self._call_gemini(gemini_contents, "gemini-2.0-flash", stream=False, system_instruction=system_instruction)
                        if res and res != "No response generated.":
                            return res
                    elif any(m in f_model for m in ["gemini", "gemma"]) or f_model.startswith("models/"):
                        print(f"🎯 [AI] Forcing model: {f_model}")
                        res = self._call_gemini(gemini_contents, f_model, stream=False, system_instruction=system_instruction)
                        if res and res != "No response generated.":
                            return res
                    elif "/" in f_model:
                        print(f"🎯 [AI] Forcing OpenRouter: {f_model}")
                        res = self._call_openrouter(compat_messages, model=f_model, stream=False)
                        if res:
                            return res
                    elif "llama" in f_model_lower or f_model == "groq":
                        print(f"🎯 [AI] Forcing Groq")
                        res = self._call_groq(compat_messages, stream=False)
                        if res:
                            return res
                except Exception as fe:
                    print(f"⚠️ [AI] Force model failed: {fe}")
                    errors.append(f"ForceModel: {fe}")

            # 1. Gemini
            for model_name in self.GEMINI_MODELS:
                try:
                    print(f"📡 [AI] Trying Gemini {model_name}")
                    result = self._call_gemini(gemini_contents, model_name, stream=False, system_instruction=system_instruction)
                    if result and result != "No response generated.":
                        return result
                    print(f"⚠️ [AI] Gemini {model_name} returned empty")
                except Exception as e:
                    err = str(e)
                    print(f"⚠️ [AI] Gemini {model_name} failed: {err}")
                    errors.append(f"Gemini/{model_name}: {err}")
                    if "API key" in err or "400" in err or "429" in err or self._is_quota_error(err):
                        print("⏭️ [AI] Skipping remaining Gemini models due to Auth/Quota error.")
                        break

            # 2. OpenRouter
            or_models = [self.openrouter_model] + [m for m in self.OPENROUTER_FREE_MODELS if m != self.openrouter_model]
            for or_model in or_models:
                try:
                    print(f"🔄 [AI] Trying OpenRouter {or_model}")
                    result = self._call_openrouter(compat_messages, model=or_model, stream=False)
                    if result:
                        return result
                except Exception as e:
                    err = str(e)
                    print(f"❌ [AI] OpenRouter {or_model} failed: {err}")
                    errors.append(f"OpenRouter/{or_model}: {err}")
                    if "401" in err or "403" in err or "429" in err or self._is_quota_error(err) or "credits" in err.lower():
                        print("⏭️ [AI] Skipping remaining OpenRouter models due to Auth/Quota error.")
                        break

            # 3. Groq
            try:
                print("🔄 [AI] Trying Groq")
                result = self._call_groq(compat_messages, stream=False)
                if result:
                    return result
            except Exception as e:
                err = str(e)
                print(f"❌ [AI] Groq failed: {err}")
                errors.append(f"Groq: {err}")

            # 4. Mock fallback
            print(f"🔄 [AI] All providers failed — using Mock Fallback. Errors: {errors}")
            return self._call_mock_fallback(message, stream=False)


# Singleton
ai_client = HybridAIClient()
