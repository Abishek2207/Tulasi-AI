import os
import json
import time
import httpx
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
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

    GEMINI_MODELS = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash",
        "gemini-1.0-pro",
    ]

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

        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction,
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
        Context-aware local fallback. Used when ALL upstream providers fail.
        Covers 8+ topic areas with genuinely useful content.
        """
        msg_low = message.lower()

        if any(k in msg_low for k in ["system design", "design a", "architect", "scalab", "distributed"]):
            response = (
                "### 🏗️ System Design Framework\n\n"
                "**The FAANG System Design Template:**\n\n"
                "**Step 1 — Clarify Requirements**\n"
                "- Functional: What must the system do?\n"
                "- Non-Functional: Latency (<200ms?), Availability (99.9%?), Scale (1M DAU?)\n\n"
                "**Step 2 — Estimation**\n"
                "- 1M DAU × 10 actions/day = ~116 QPS average, ~350 QPS peak\n\n"
                "**Step 3 — High Level Architecture**\n"
                "```\nClient → CDN → Load Balancer → API Gateway\n"
                "       → Microservices → Cache (Redis) → DB\n```\n\n"
                "**Step 4 — Deep Dive**\n"
                "- DB: SQL for ACID, NoSQL for horizontal scale\n"
                "- Cache: Redis LRU, write-through vs cache-aside\n"
                "- Queue: Kafka for async, dead letter queue for retries\n\n"
                "**Step 5 — Trade-offs Table**\n"
                "| Option | Pro | Con |\n|--------|-----|-----|\n"
                "| SQL | ACID, joins | Hard to shard |\n"
                "| NoSQL | Horizontal scale | Eventual consistency |\n"
                "| Redis | Sub-ms reads | Volatile, RAM cost |\n"
                "| Kafka | High-throughput | Ops complexity |\n\n"
                "> 💡 *Ask me to design any specific system for a full deep-dive!*"
            )
        elif any(k in msg_low for k in ["interview", "mock", "behavioral", "hr"]):
            response = (
                "### 🎤 Interview Simulation — Practice Now\n\n"
                "**Round 1: DSA**\n"
                "> *Given an array of integers, find two numbers summing to a target. Return their indices.*\n\n"
                "**Optimal Solution:**\n"
                "```python\ndef two_sum(nums, target):\n"
                "    seen = {}\n"
                "    for i, num in enumerate(nums):\n"
                "        if target - num in seen:\n"
                "            return [seen[target - num], i]\n"
                "        seen[num] = i\n```\n"
                "Time: O(n) | Space: O(n)\n\n"
                "**Round 2: Behavioral (STAR)**\n"
                "> *Tell me about a time you solved a technically challenging problem under a deadline.*\n\n"
                "Structure: **S**ituation → **T**ask → **A**ction (use 'I') → **R**esult (quantify!)\n\n"
                "> 💡 *Type your answer and I'll evaluate it in real interview style!*"
            )
        elif any(k in msg_low for k in ["dsa", "leetcode", "algorithm", "data struct", "array", "tree", "graph", "dp", "dynamic"]):
            response = (
                "### 💻 DSA Pattern Mastery\n\n"
                "**The 8 Patterns That Solve 80% of Problems:**\n\n"
                "| Pattern | When to Use | Classic Problem |\n"
                "|---------|-------------|----------------|\n"
                "| Two Pointers | Sorted arrays, pairs | Two Sum II |\n"
                "| Sliding Window | Subarray/substring | Max Subarray |\n"
                "| Fast/Slow Pointer | Cycle detection | Linked List Cycle |\n"
                "| BFS | Shortest path | Number of Islands |\n"
                "| DFS + Backtrack | Permutations | Combination Sum |\n"
                "| Dynamic Programming | Overlapping subproblems | Coin Change |\n"
                "| Binary Search | Sorted search space | Rotated Array Search |\n"
                "| Heap | Top-K elements | K Closest Points |\n\n"
                "**Study Order:** Arrays → Strings → Linked Lists → Trees → Graphs → DP\n"
                "**Target:** 150+ problems (60% Medium) = Interview-ready\n\n"
                "> 💡 *Ask me to walk through any specific pattern or problem!*"
            )
        elif any(k in msg_low for k in ["career", "job", "placement", "internship", "goal"]):
            response = (
                "### 🗺️ Career Acceleration — 6 Month Blueprint\n\n"
                "**Month 1-2: Foundation Sprint**\n"
                "- Master one language deeply (Python recommended)\n"
                "- Solve Neetcode 75 Easy problems\n"
                "- Deploy 1 full-stack project on GitHub\n\n"
                "**Month 3-4: Growth Engine**\n"
                "- Neetcode 150 (40% Medium problems)\n"
                "- System Design: URL shortener + Twitter feed\n"
                "- Apply to 10 opportunities per week\n\n"
                "**Month 5-6: Launch Mode**\n"
                "- 3 mock interviews per week (Pramp, Exponent)\n"
                "- Resume + LinkedIn polished\n"
                "- Negotiate ALL offers simultaneously\n\n"
                "**🔥 High-ROI Skills 2026:** RAG/LLM, Kubernetes, TypeScript, System Design\n\n"
                "> 💡 *Tell me your year and target role for a personalized roadmap!*"
            )
        elif any(k in msg_low for k in ["roadmap", "learning path", "how to learn", "where to start"]):
            response = (
                "### 🗺️ Personalized Learning Roadmap\n\n"
                "**Phase 1: Foundations (Week 1-4)**\n"
                "- Pick language: Python (AI/Backend) or JavaScript (Full Stack)\n"
                "- Complete CS50 (free, Harvard)\n"
                "- Build 2 small projects: CLI app + web app\n\n"
                "**Phase 2: Core Engineering (Week 5-12)**\n"
                "- DSA with Neetcode 150\n"
                "- Database fundamentals (SQL + one NoSQL)\n"
                "- REST API design + authentication\n\n"
                "**Phase 3: Specialization (Week 13-20)**\n"
                "- AI/ML, Backend, Frontend, or DevOps track\n"
                "- System Design basics\n"
                "- Capstone project solving a real problem\n\n"
                "**Phase 4: Career Launch (Week 21-24)**\n"
                "- Mock interviews + resume polish\n"
                "- Apply to 50+ companies → Negotiate offers\n\n"
                "> 💡 *Tell me your specific goal for a role-specific plan!*"
            )
        elif any(k in msg_low for k in ["resume", "cv", "ats", "cover letter"]):
            response = (
                "### 📄 Resume Engineering — ATS Formula\n\n"
                "**Each bullet = [Action Verb] + [What] + [How] + [Quantified Impact]**\n\n"
                "❌ Weak: 'Worked on backend'\n"
                "✅ Strong: 'Engineered REST API with FastAPI + PostgreSQL, reducing latency by 40% for 50K DAU'\n\n"
                "**Power Verbs:** Engineered, Architected, Optimized, Reduced, Scaled, Deployed, Automated\n\n"
                "**Resume Structure:**\n"
                "1. Header — Name, Email, GitHub, LinkedIn, Portfolio\n"
                "2. Skills — Languages | Frameworks | Tools (match JD keywords)\n"
                "3. Experience — STAR bullets with metrics\n"
                "4. Projects — 3 strong projects with GitHub links\n"
                "5. Education — GPA only if >8.0 CGPA\n\n"
                "> 💡 *Paste your current resume bullet and I'll rewrite it ATS-optimized!*"
            )
        elif any(k in msg_low for k in ["python", "javascript", "java", "code", "debug", "error", "bug"]):
            response = (
                "### 🔧 Code Assistance\n\n"
                "**Python Interview Templates:**\n\n"
                "```python\n"
                "# Frequency counting — O(n)\n"
                "from collections import Counter\n"
                "counts = Counter(arr)\n\n"
                "# Two-pointer template (sorted array)\n"
                "left, right = 0, len(arr) - 1\n"
                "while left < right:\n"
                "    total = arr[left] + arr[right]\n"
                "    if total == target: return [left, right]\n"
                "    elif total < target: left += 1\n"
                "    else: right -= 1\n\n"
                "# BFS template\n"
                "from collections import deque\n"
                "def bfs(start, graph):\n"
                "    queue, visited = deque([start]), {start}\n"
                "    while queue:\n"
                "        node = queue.popleft()\n"
                "        for neighbor in graph[node]:\n"
                "            if neighbor not in visited:\n"
                "                visited.add(neighbor)\n"
                "                queue.append(neighbor)\n"
                "```\n\n"
                "> 💡 *Paste your code and I'll review, debug, and optimize it!*"
            )
        else:
            response = (
                "### 🤖 Tulasi AI — Your Elite Career & Tech Mentor\n\n"
                "I'm here to help you build an exceptional engineering career!\n\n"
                "| Ask Me About | I'll Help With |\n"
                "|-------------|---------------|\n"
                "| **System Design** | Architecture, scalability, trade-offs |\n"
                "| **DSA / LeetCode** | Patterns, templates, walkthroughs |\n"
                "| **Mock Interview** | Real-time Q&A with evaluation |\n"
                "| **Career GPS** | Personalized 6-month roadmap |\n"
                "| **Resume** | ATS-optimized, impact-focused bullets |\n"
                "| **Code Review** | Debug, optimize, explain |\n\n"
                "**Try asking:**\n"
                "- *\"Design a URL shortener for 100M users\"*\n"
                "- *\"I'm a 3rd year CS student targeting Google — give me my roadmap\"*\n"
                "- *\"Explain dynamic programming with Coin Change\"*\n\n"
                "> ⚡ *What do you want to master today?*"
            )

        if stream:
            def gen():
                for line in response.split("\n"):
                    for word in line.split(" "):
                        yield word + " "
                        time.sleep(0.006)
                    yield "\n"
            return gen()
        return response

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
