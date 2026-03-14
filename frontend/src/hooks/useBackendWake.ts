"use client";

import { useState, useEffect, useCallback } from "react";

interface BackendState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const HEALTH_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes — prevents Render cold starts

export function useBackendWake() {
  const [state, setState] = useState<BackendState>({
    isOnline: true,     // Optimistic default — don't flash errors on load
    isChecking: false,
    lastChecked: null,
  });

  const checkHealth = useCallback(async () => {
    setState((s) => ({ ...s, isChecking: true }));
    try {
      const res = await fetch("/api/health", {
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
        headers: { "x-check": "keepalive" },
      });
      setState({ isOnline: res.ok, isChecking: false, lastChecked: new Date() });
      return res.ok;
    } catch {
      // Silent failure — never surface this to users
      setState({ isOnline: false, isChecking: false, lastChecked: new Date() });
      return false;
    }
  }, []);

  // Silent check on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Keep-alive every 4 minutes — prevents Render sleep
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
