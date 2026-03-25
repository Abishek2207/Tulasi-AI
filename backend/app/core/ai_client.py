import os
import time
import json
import httpx
import google.generativeai as genai
from typing import List, Dict, Optional, Generator, Union
from app.core.config import settings

class AIClientError(Exception):
    """Base error for AI client"""
    pass

class HybridAIClient:
    def __init__(self):
        self.gemini_key = settings.effective_gemini_key
        self.openrouter_key = settings.OPENROUTER_API_KEY
        self.openrouter_model = settings.OPENROUTER_MODEL or "mistralai/mistral-7b-instruct:free"
        self.groq_key = settings.GROQ_API_KEY
        
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
        
        self.gemini_models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.0-pro"]

    def _format_for_gemini(self, message: str, history: List[Dict], image_data: Optional[bytes] = None) -> List[Dict]:
        contents = []
        for m in (history or []):
            role = "user" if m.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [m.get("content", "")]})
        
        current_parts = [message]
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

    def _format_for_openrouter(self, message: str, history: List[Dict]) -> List[Dict]:
        messages = []
        for m in (history or []):
            role = "assistant" if m.get("role") == "model" else m.get("role", "user")
            messages.append({"role": role, "content": m.get("content", "")})
        messages.append({"role": "user", "content": message})
        return messages

    def _call_groq(self, messages: List[Dict], stream: bool = False) -> Union[str, Generator]:
        groq_key = os.getenv("GROQ_API_KEY") or self.groq_key
        if not groq_key:
            raise AIClientError("Missing GROQ_API_KEY environment variable")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        payload = {"model": "llama3-8b-8192", "messages": messages, "stream": stream}
        if stream:
            def gen():
                with httpx.stream("POST", url, headers=headers, json=payload, timeout=30.0) as response:
                    if response.status_code != 200:
                        raise AIClientError(f"Groq API error ({response.status_code}): {response.text}")
                    for line in response.iter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]": break
                            try:
                                content = json.loads(data_str)["choices"][0]["delta"].get("content", "")
                                if content: yield content
                            except: continue
            return gen()
        else:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, headers=headers, json=payload)
                if response.status_code != 200:
                    raise AIClientError(f"Groq API error ({response.status_code}): {response.text}")
                return response.json()["choices"][0]["message"]["content"]

    def _call_gemini(self, contents: List[Dict], model_name: str, stream: bool = False) -> Union[str, Generator]:
        # Read key fresh from env on EVERY call to avoid pydantic caching at boot
        gemini_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") or self.gemini_key
        if not gemini_key:
            raise AIClientError("Gemini API key is missing.")
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel(model_name)
            
        if stream:
            response = model.generate_content(contents, stream=True)
            def gen():
                for chunk in response:
                    if hasattr(chunk, "text") and chunk.text:
                        yield chunk.text
            return gen()
        else:
            response = model.generate_content(contents)
            if response and hasattr(response, "text") and response.text:
                return response.text
            return "No response generated."

    def _call_openrouter(self, messages: List[Dict], stream: bool = False) -> Union[str, Generator]:
        openrouter_key = os.getenv("OPENROUTER_API_KEY") or self.openrouter_key
        if not openrouter_key:
            raise AIClientError("Missing OPENROUTER_API_KEY environment variable")

        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "HTTP-Referer": "https://tulasiai.vercel.app",
            "X-Title": "Tulasi AI",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.openrouter_model,
            "messages": messages,
            "stream": stream
        }

        if stream:
            def gen():
                with httpx.stream("POST", url, headers=headers, json=payload, timeout=30.0) as response:
                    if response.status_code != 200:
                        raise AIClientError(f"OpenRouter API error ({response.status_code}): {response.text}")
                    for line in response.iter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                content = data["choices"][0]["delta"].get("content", "")
                                if content:
                                    yield content
                            except:
                                continue
            return gen()
        else:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, headers=headers, json=payload)
                if response.status_code != 200:
                    raise AIClientError(f"OpenRouter API error ({response.status_code}): {response.text}")
                data = response.json()
                return data["choices"][0]["message"]["content"]

    def get_response(self, message: str, history: List[Dict] = None, image_data: Optional[bytes] = None, stream: bool = False) -> Union[str, Generator]:
        """
        Main entry point for AI responses.
        Tries Gemini models first (with retries), falls back to OpenRouter, then Groq.
        """
        history = history or []
        gemini_contents = self._format_for_gemini(message, history, image_data=image_data)
        errors = []
        
        if stream:
            def master_gen():
                # 1. Try Gemini Models
                for model_name in self.gemini_models:
                    for attempt in range(2):
                        try:
                            print(f"📡 [AI] Trying Gemini {model_name} (attempt {attempt + 1})")
                            model_gen = self._call_gemini(gemini_contents, model_name, stream=True)
                            for chunk in model_gen:
                                yield chunk
                            return
                        except Exception as e:
                            err_msg = f"Gemini {model_name}: {str(e)}"
                            print(f"⚠️ [AI] {err_msg}")
                            if err_msg not in errors: errors.append(err_msg)
                            if attempt == 1:
                                break
                
                # 2. Fallback to OpenRouter
                or_messages = self._format_for_openrouter(message, history)
                print(f"🔄 [AI] Falling back to OpenRouter ({self.openrouter_model})")
                try:
                    or_gen = self._call_openrouter(or_messages, stream=True)
                    for chunk in or_gen:
                        yield chunk
                    return
                except Exception as e:
                    err_msg = f"OpenRouter: {str(e)}"
                    print(f"❌ [AI] {err_msg}")
                    if err_msg not in errors: errors.append(err_msg)

                # 3. Fallback to Groq
                print(f"🔄 [AI] Falling back to Groq (llama3-8b-8192)")
                try:
                    groq_gen = self._call_groq(or_messages, stream=True)
                    for chunk in groq_gen:
                        yield chunk
                    return
                except Exception as e:
                    err_msg = f"Groq: {str(e)}"
                    print(f"❌ [AI] {err_msg}")
                    if err_msg not in errors: errors.append(err_msg)
                    yield f"⏳ AI is currently unavailable. (Errors: {'; '.join(errors)})"
            return master_gen()
        else:
            # Non-streaming fallback
            for model_name in self.gemini_models:
                for attempt in range(2):
                    try:
                        print(f"📡 [AI] Trying Gemini {model_name} (attempt {attempt + 1})")
                        return self._call_gemini(gemini_contents, model_name, stream=False)
                    except Exception as e:
                        err_msg = f"Gemini {model_name}: {str(e)}"
                        print(f"⚠️ [AI] {err_msg}")
                        if err_msg not in errors: errors.append(err_msg)
                        if attempt == 1:
                            break
            
            or_messages = self._format_for_openrouter(message, history)
            print(f"🔄 [AI] Falling back to OpenRouter ({self.openrouter_model})")
            try:
                return self._call_openrouter(or_messages, stream=False)
            except Exception as e:
                err_msg = f"OpenRouter: {str(e)}"
                print(f"❌ [AI] {err_msg}")
                if err_msg not in errors: errors.append(err_msg)

            # 3. Groq fallback
            print(f"🔄 [AI] Falling back to Groq (llama3-8b-8192)")
            try:
                return self._call_groq(or_messages, stream=False)
            except Exception as e:
                err_msg = f"Groq: {str(e)}"
                print(f"❌ [AI] {err_msg}")
                if err_msg not in errors: errors.append(err_msg)
                return f"⏳ AI is currently unavailable. (Errors: {'; '.join(errors)})"

# Singleton
ai_client = HybridAIClient()
