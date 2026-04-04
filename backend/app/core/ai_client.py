import google.generativeai as genai
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
      3. Groq (llama-3.1-8b-instant)
      4. Mock fallback (always succeeds, context-aware)
    """

    # Ordered list of Gemini model IDs to try, newest/fastest first.
    # gemini-2.0-flash-lite is the cheapest/most available free quota model.
    GEMINI_MODELS = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash",
        "gemini-1.0-pro",
    ]

    # OpenRouter free models to try in order (user preference: gemma-2-9b-it:free)
    OPENROUTER_FREE_MODELS = [
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "gryphe/mythomist-7b:free",
    ]

    def __init__(self):
        self.gemini_key = settings.effective_gemini_key
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.groq_key = settings.GROQ_API_KEY

        # Primary OpenRouter model from env, falls back to our preferred free model
        env_or_model = settings.OPENROUTER_MODEL or ""
        self.openrouter_model = env_or_model if env_or_model else self.OPENROUTER_FREE_MODELS[0]

    # ──────────────────────────────────────────────────────────────
    # Message Formatters
    # ──────────────────────────────────────────────────────────────

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
        """Shared formatter for OpenRouter and Groq (both use OpenAI message format)."""
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        for m in (history or []):
            role = "assistant" if m.get("role") == "model" else m.get("role", "user")
            messages.append({"role": role, "content": m.get("content", "")})
        messages.append({"role": "user", "content": message})
        return messages

    # ──────────────────────────────────────────────────────────────
    # Provider Callers
    # ──────────────────────────────────────────────────────────────

    def _is_quota_error(self, error_text: str) -> bool:
        """Detect rate-limit / quota / model-not-found errors so we skip to next model."""
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
        # Always read key fresh from env at call-time to pick up Render env vars
        gemini_key = (
            os.getenv("GOOGLE_API_KEY")
            or os.getenv("GEMINI_API_KEY")
            or self.gemini_key
        )
        if not gemini_key:
            raise AIClientError("Gemini API key is missing.")

        # Reverted to legacy SDK configuration
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction
        )

        if stream:
            response_stream = model.generate_content(contents, stream=True)

            def gen():
                for chunk in response_stream:
                    if hasattr(chunk, "text") and chunk.text:
                        yield chunk.text

            return gen()
        else:
            response = model.generate_content(contents, stream=False)
            if response and hasattr(response, "text") and response.text:
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
            "HTTP-Referer": "https://tulasiai.vercel.app",
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
        payload = {"model": "llama-3.1-8b-instant", "messages": messages, "stream": stream}

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
        """
        Context-aware local fallback so the platform never feels completely broken.
        Used only when ALL upstream providers fail.
        """
        msg_low = message.lower()

        if "roadmap" in msg_low or "learning path" in msg_low:
            response = (
                "### 🗺️ Custom Learning Roadmap\n\n"
                "**Phase 1: Foundations (Week 1-2)**\n"
                "- Master the core syntax and basic principles.\n"
                "- Set up your professional development environment.\n"
                "- *Resource:* [Official Docs](https://docs.python.org)\n\n"
                "**Phase 2: Core Concepts (Week 3-6)**\n"
                "- Deep dive into Data Structures, APIs, and System Design.\n"
                "- Build 3 mini-projects to cement your understanding.\n\n"
                "**Phase 3: Real-world Application (Week 7-12)**\n"
                "- Contribute to Open Source or build a full-stack portfolio piece.\n"
                "- Focus on testing, deployment, and performance scaling."
            )
        elif "interview" in msg_low or "question" in msg_low:
            response = (
                "### 🎤 Technical Interview Simulation\n\n"
                "Let's start with a core architectural question:\n\n"
                "**'Can you explain the trade-offs between NoSQL (MongoDB) vs Relational (PostgreSQL) "
                "databases for a high-traffic social media app?'**\n\n"
                "Consider CAP theorem, consistency guarantees, and horizontal scaling. "
                "Take your time — I'm ready for your answer."
            )
        else:
            response = (
                "I'm here to help you build your future in tech! 🚀\n\n"
                "I'm currently operating in offline mode, but I can still guide you on:\n\n"
                "- 🎯 *Mock Interview Simulation*\n"
                "- 🗺️ *Full-Stack Learning Roadmap*\n"
                "- 🔧 *Code Debugging & Review*\n\n"
                "Please try again in a moment — the AI backend is warming up."
            )

        if stream:
            def gen():
                for line in response.split("\n"):
                    for word in line.split(" "):
                        yield word + " "
                        time.sleep(0.008)
                    yield "\n"

            return gen()
        return response

    # ──────────────────────────────────────────────────────────────
    # Main Entry Point
    # ──────────────────────────────────────────────────────────────

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
        If force_model is provided, it tries that model FIRST if it matches a provider.
        """
        history = history or []
        gemini_contents = self._format_for_gemini(message, history, image_data=image_data)
        compat_messages = self._format_for_openai_compat(message, history, system_instruction=system_instruction)
        errors: List[str] = []

        # ── 0. Handle force_model override ──
        if force_model:
            # Special case for 'complex_reasoning' -> try the best Gemini model available
            if force_model == "complex_reasoning":
                force_model = self.GEMINI_MODELS[0]

            # Try to determine provider based on model name
            try:
                if any(m in force_model for m in ["gemini", "gemma"]) or force_model.startswith("models/"):
                    print(f"🎯 [AI] Forcing model: {force_model} (Gemini/Google path)")
                    res = self._call_gemini(gemini_contents, force_model, stream=stream, system_instruction=system_instruction)
                    if res: return res
                elif "/" in force_model: # Likely OpenRouter format provider/model
                    print(f"🎯 [AI] Forcing model: {force_model} (OpenRouter path)")
                    res = self._call_openrouter(compat_messages, model=force_model, stream=stream)
                    if res: return res
                elif "llama" in force_model.lower():
                    print(f"🎯 [AI] Forcing model: {force_model} (Groq path)")
                    res = self._call_groq(compat_messages, stream=stream)
                    if res: return res
            except Exception as fe:
                print(f"⚠️ [AI] Force model '{force_model}' failed, falling back to chain: {fe}")
                errors.append(f"ForceModel/{force_model}: {fe}")

        if stream:
            def master_gen():
                # ── 1. Gemini models ──
                for model_name in self.GEMINI_MODELS:
                    try:
                        print(f"📡 [AI] Trying Gemini {model_name} (stream)")
                        model_gen = self._call_gemini(
                            gemini_contents, model_name,
                            stream=True, system_instruction=system_instruction,
                        )
                        yielded_any = False
                        for chunk in model_gen:
                            yielded_any = True
                            yield chunk
                        if yielded_any:
                            return
                        # Empty response — try next model
                        print(f"⚠️ [AI] Gemini {model_name} returned empty — trying next")
                    except Exception as e:
                        err = str(e)
                        print(f"⚠️ [AI] Gemini {model_name} failed: {err}")
                        errors.append(f"Gemini/{model_name}: {err}")
                        # Continue to next model immediately (no sleep on quota errors)

                # ── 2. OpenRouter free models ──
                or_models_to_try = (
                    [self.openrouter_model]
                    + [m for m in self.OPENROUTER_FREE_MODELS if m != self.openrouter_model]
                )
                for or_model in or_models_to_try:
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

                # ── 3. Groq ──
                try:
                    print("🔄 [AI] Trying Groq llama-3.1-8b-instant (stream)")
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
                print("🔄 [AI] All providers failed — using Mock Fallback Engine")
                print(f"   Errors logged: {errors}")
                for chunk in self._call_mock_fallback(message, stream=True):
                    yield chunk

            return master_gen()

        else:
            # ── Non-streaming path ──
            # 1. Gemini
            for model_name in self.GEMINI_MODELS:
                try:
                    print(f"📡 [AI] Trying Gemini {model_name}")
                    result = self._call_gemini(
                        gemini_contents, model_name,
                        stream=False, system_instruction=system_instruction,
                    )
                    if result and result != "No response generated.":
                        return result
                    print(f"⚠️ [AI] Gemini {model_name} returned empty — trying next")
                except Exception as e:
                    err = str(e)
                    print(f"⚠️ [AI] Gemini {model_name} failed: {err}")
                    errors.append(f"Gemini/{model_name}: {err}")

            # 2. OpenRouter
            or_models_to_try = (
                [self.openrouter_model]
                + [m for m in self.OPENROUTER_FREE_MODELS if m != self.openrouter_model]
            )
            for or_model in or_models_to_try:
                try:
                    print(f"🔄 [AI] Trying OpenRouter {or_model}")
                    result = self._call_openrouter(compat_messages, model=or_model, stream=False)
                    if result:
                        return result
                except Exception as e:
                    err = str(e)
                    print(f"❌ [AI] OpenRouter {or_model} failed: {err}")
                    errors.append(f"OpenRouter/{or_model}: {err}")

            # 3. Groq
            try:
                print("🔄 [AI] Trying Groq llama-3.1-8b-instant")
                result = self._call_groq(compat_messages, stream=False)
                if result:
                    return result
            except Exception as e:
                err = str(e)
                print(f"❌ [AI] Groq failed: {err}")
                errors.append(f"Groq: {err}")

            # 4. Mock fallback
            print("🔄 [AI] All providers failed — using Mock Fallback Engine")
            print(f"   Errors logged: {errors}")
            return self._call_mock_fallback(message, stream=False)


# Singleton
ai_client = HybridAIClient()
