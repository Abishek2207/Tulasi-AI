"use client";

import { useBackendWake } from "@/hooks/useBackendWake";

/**
 * BackendBanner — silently keeps the backend alive with no visible UI.
 * The health check fires in the background every 4 minutes.
 * Users never see any "server waking up" messages.
 */
export function BackendBanner() {
  // Just run the hook for its side effect (keep-alive pings).
  // Never render anything to the user.
  useBackendWake();
  return null;
}
