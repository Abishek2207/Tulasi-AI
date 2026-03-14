"use client";

import { useState, useEffect, useCallback } from "react";

interface BackendState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const HEALTH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

export function useBackendWake() {
  const [state, setState] = useState<BackendState>({
    isOnline: true,     // Optimistic default
    isChecking: false,
    lastChecked: null,
  });

  const checkHealth = useCallback(async () => {
    setState((s) => ({ ...s, isChecking: true }));
    try {
      const res = await fetch("/api/health", {
        signal: AbortSignal.timeout(10_000), // 10s timeout
        cache: "no-store",
      });
      const isOnline = res.ok;
      setState({ isOnline, isChecking: false, lastChecked: new Date() });
      return isOnline;
    } catch {
      setState({ isOnline: false, isChecking: false, lastChecked: new Date() });
      return false;
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Keep-alive ping every 4 minutes (prevents Render cold starts)
  useEffect(() => {
    const interval = setInterval(checkHealth, HEALTH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isOnline: state.isOnline,
    isChecking: state.isChecking,
    lastChecked: state.lastChecked,
    wakeNow: checkHealth,
  };
}
