"use client";

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/api";

interface BackendState {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const HEALTH_INTERVAL_MS = 90 * 1000; // 90 seconds — keeps Railway alive aggressively

export function useBackendWake() {
  const [state, setState] = useState<BackendState>({
    isOnline: true,     // Optimistic default — don't flash errors on load
    isChecking: false,
    lastChecked: null,
  });

  const checkHealth = useCallback(async () => {
    setState((s) => ({ ...s, isChecking: true }));
    try {
      const res = await fetch(`${API_URL}/api/health`, {
        headers: {"Content-Type":"application/json","Authorization":`Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`},
        credentials:"omit", mode:"cors",
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
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

  // Keep-alive every 90 seconds — prevents Railway cold starts
  useEffect(() => {
    const interval = setInterval(checkHealth, HEALTH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Wake backend instantly when device wakes from sleep or tab regains focus
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") checkHealth();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", checkHealth);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", checkHealth);
    };
  }, [checkHealth]);

  return {
    isOnline: state.isOnline,
    isChecking: state.isChecking,
    lastChecked: state.lastChecked,
    wakeNow: checkHealth,
  };
}
