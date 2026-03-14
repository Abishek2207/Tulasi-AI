"use client";

import { useEffect } from "react";
import { healthCheck } from "@/lib/api";

/**
 * Dashboard BackendBanner — fires silent keep-alive health checks.
 * NEVER shows server status messages to users.
 */
export function BackendBanner() {
  useEffect(() => {
    // Silent check on mount
    healthCheck().catch(() => {/* fail silently */});

    // Keep-alive every 4 minutes to prevent Render cold starts
    const id = setInterval(() => {
      healthCheck().catch(() => {/* fail silently */});
    }, 4 * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  // Never render anything to the user
  return null;
}
