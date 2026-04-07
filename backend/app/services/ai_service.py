"""
services/ai_service.py
-----------------------
Async AI service layer for TulasiAI.
Wraps the existing HybridAIClient (Gemini → OpenRouter → Groq → Mock)
in a clean, async-native interface with timeout handling and structured errors.

Usage:
    from app.services.ai_service import ai_service
    response = await ai_service.generate_ai_response("Explain binary search")
"""

import asyncio
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger("tulasi.ai_service")

# Default timeout for all AI calls (seconds)
AI_TIMEOUT_SECONDS = 30


class AIServiceError(Exception):
    """Raised when all AI providers fail and no fallback is available."""
    pass


class AIService:
    """
    Async wrapper over HybridAIClient.
    Provides:
      - async/await interface via asyncio.to_thread
      - configurable timeout
      - structured error returns with fallback message
      - docstring-friendly, clean API surface
    """

    FALLBACK_RESPONSE = (
        "⚡ Our AI system is experiencing high demand right now. "
        "Please try again in a few seconds — Tulasi AI will be back shortly!"
    )

    def __init__(self):
        # Lazy-load the client to avoid circular imports at module level
        self._client = None

    def _get_client(self):
        """Lazy-initialise the HybridAIClient singleton."""
        if self._client is None:
            from app.core.ai_client import ai_client
            self._client = ai_client
        return self._client

    async def generate_ai_response(
        self,
        prompt: str,
        history: Optional[List[Dict]] = None,
        system_instruction: Optional[str] = None,
        force_model: Optional[str] = None,
        stream: bool = False,
    ) -> str:
        """
        Generate an AI response asynchronously.

        Args:
            prompt:             The user's message / question.
            history:            Prior conversation messages [{role, content}].
            system_instruction: Optional system prompt override.
            force_model:        Optional model override (passed to HybridAIClient).
            stream:             If True, returns the raw generator (caller handles).

        Returns:
            AI-generated response string, or FALLBACK_RESPONSE on total failure.

        Raises:
            AIServiceError: Only if stream=True and all providers fail (caller must handle).
        """
        client = self._get_client()
        history = history or []

        if stream:
            # For streaming, return the generator directly (sync gen, run in thread)
            # Caller is responsible for consuming the generator
            try:
                gen = await asyncio.wait_for(
                    asyncio.to_thread(
                        client.get_response,
                        prompt,
                        history,
                        None,          # image_data
                        True,          # stream=True
                        system_instruction,
                        force_model,
                    ),
                    timeout=AI_TIMEOUT_SECONDS,
                )
                return gen
            except asyncio.TimeoutError:
                logger.error(f"[AIService] Timeout ({AI_TIMEOUT_SECONDS}s) generating streaming response.")
                raise AIServiceError("AI response timed out. Please try again.")
            except Exception as e:
                logger.error(f"[AIService] Streaming error: {e}")
                raise AIServiceError(str(e))

        # ── Non-streaming path ─────────────────────────────────────────────────
        try:
            response: str = await asyncio.wait_for(
                asyncio.to_thread(
                    client.get_response,
                    prompt,
                    history,
                    None,              # image_data
                    False,             # stream=False
                    system_instruction,
                    force_model,
                ),
                timeout=AI_TIMEOUT_SECONDS,
            )

            if response and response != "No response generated.":
                return response

            logger.warning("[AIService] Empty response from all providers — returning fallback.")
            return self.FALLBACK_RESPONSE

        except asyncio.TimeoutError:
            logger.error(f"[AIService] Timeout ({AI_TIMEOUT_SECONDS}s) — returning fallback.")
            return self.FALLBACK_RESPONSE

        except Exception as e:
            logger.error(f"[AIService] Unexpected error: {e} — returning fallback.")
            return self.FALLBACK_RESPONSE

    async def generate_structured_response(
        self,
        prompt: str,
        schema_hint: str = "",
        system_instruction: Optional[str] = None,
    ) -> str:
        """
        Convenience method for prompts expecting structured JSON output.
        Adds a JSON formatting instruction to the system prompt.

        Args:
            prompt:           Main prompt asking for structured data.
            schema_hint:      Optional description of the expected JSON shape.
            system_instruction: Additional system context.

        Returns:
            Raw AI response (string). Caller is responsible for json.loads().
        """
        json_instruction = (
            "You are a precise AI assistant. Always respond with valid JSON only. "
            "Do not include markdown fences or explanations. "
        )
        if schema_hint:
            json_instruction += f"Expected schema: {schema_hint}"

        combined = f"{system_instruction}\n{json_instruction}" if system_instruction else json_instruction

        return await self.generate_ai_response(
            prompt=prompt,
            system_instruction=combined,
        )


# Singleton — import this across the project
ai_service = AIService()
