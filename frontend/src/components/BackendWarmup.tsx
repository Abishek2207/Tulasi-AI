"use client";

import { useEffect, useRef } from "react";
import { healthCheck } from "@/lib/api";

/**
 * 🔥 BackendWarmup Component
 * 
 * This is an aggressive, silent "Handshake" component designed to wake up 
 * the Render backend as soon as the user hits the landing page.
 * 
 * It runs strictly on mount and uses a fast-retry strategy to ensure 
 * that by the time the user clicks "Login" or "Dashboard", the 
 * backend is already warm and ready.
 */
export function BackendWarmup() {
  const warmedUp = useRef(false);

  useEffect(() => {
    if (warmedUp.current) return;
    warmedUp.current = true;

    let retries = 0;
    const MAX_RETRIES = 5;
    const INITIAL_DELAY = 1000;

    const wake = async () => {
      try {
        console.log(`[Warmup] ⚡ Sending wake-up signal to Tulasi AI Backend (Attempt ${retries + 1})...`);
        const res = await healthCheck();
        if (res && res.status === "ok") {
          console.log("[Warmup] ✅ Backend is Awake & Optimized!");
          return;
        }
      } catch (e) {
        if (retries < MAX_RETRIES) {
          retries++;
          const nextDelay = INITIAL_DELAY * Math.pow(1.5, retries);
          console.warn(`[Warmup] ⏳ Backend is cold-starting. Retrying in ${Math.round(nextDelay)}ms...`);
          setTimeout(wake, nextDelay);
        } else {
          console.error("[Warmup] ❌ Backend failed to wake up after multiple attempts.");
        }
      }
    };

    // Trigger immediate wake-up call
    wake();

    // Also wake up when user switches back to this tab (if they opened and waited)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        wake();
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return null; // Silent & Invisible
}
