"""
services/analytics_service.py
------------------------------
PostHog analytics integration for TulasiAI.
Tracks key user events: signup, message_sent, image_uploaded.

All calls are fire-and-forget (non-blocking).
Gracefully no-ops if POSTHOG_API_KEY is not set.
"""

import asyncio
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("tulasi.analytics")


class AnalyticsService:
    """
    Lightweight async wrapper around PostHog event tracking.
    Uses the REST API directly to avoid sync blocking on the PostHog SDK.
    """

    def __init__(self):
        self.api_key = settings.POSTHOG_API_KEY
        self.enabled = bool(self.api_key and self.api_key != "")
        self._host = "https://app.posthog.com"

        if self.enabled:
            logger.info("✅ PostHog Analytics enabled.")
        else:
            logger.warning("⚠️ PostHog Analytics disabled — POSTHOG_API_KEY not set.")

    async def track(
        self,
        event: str,
        user_id: str,
        properties: Optional[dict] = None,
    ) -> None:
        """
        Send a PostHog event asynchronously.
        Never raises — failures are silently logged.

        Args:
            event:      Event name, e.g. "user_signup"
            user_id:    Distinct ID (user email or user.id as string)
            properties: Optional dict of event metadata
        """
        if not self.enabled:
            return

        payload = {
            "api_key": self.api_key,
            "event": event,
            "distinct_id": str(user_id),
            "properties": properties or {},
        }

        # Fire and forget — schedule as background task
        asyncio.create_task(self._send(payload))

    async def _send(self, payload: dict) -> None:
        """Internal: sends event to PostHog capture endpoint."""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(
                    f"{self._host}/capture/",
                    json=payload,
                )
        except Exception as e:
            logger.warning(f"[PostHog] Failed to send event '{payload.get('event')}': {e}")

    # ── Pre-built event helpers ─────────────────────────────────────────

    async def track_signup(self, user_id: str, email: str, provider: str = "email") -> None:
        """Track a new user registration."""
        await self.track(
            event="user_signup",
            user_id=user_id,
            properties={"email": email, "provider": provider},
        )

    async def track_message_sent(self, user_id: str, session_id: str = "") -> None:
        """Track an AI chat message being sent."""
        await self.track(
            event="message_sent",
            user_id=user_id,
            properties={"session_id": session_id},
        )

    async def track_image_uploaded(self, user_id: str, public_id: str = "") -> None:
        """Track a Cloudinary image upload."""
        await self.track(
            event="image_uploaded",
            user_id=user_id,
            properties={"public_id": public_id},
        )


# Singleton — import this everywhere
analytics_service = AnalyticsService()
