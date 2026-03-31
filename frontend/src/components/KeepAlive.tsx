"use client";

import { useEffect } from "react";
import { healthCheck } from "@/lib/api";

/**
 * 🛰️ KeepAlive Component
 * 
 * Prevents Render's free tier from sleeping while a user has a tab open.
 * Pings the backend health endpoint every 10 minutes.
 */
export function KeepAlive() {
  useEffect(() => {
    // Ping every 8 minutes (Render sleep starts at 15 mins)
    // 8 mins is safer to account for network jitter.
    const INTERVAL = 8 * 60 * 1000; 
    let lastPing = 0;

    const ping = async () => {
      const now = Date.now();
      // Throttle pings to at most once every 3 minutes to avoid flooding
      if (now - lastPing < 3 * 60 * 1000) return;
      
      try {
        console.log("[KeepAlive] 🛰️ Heartbeat: Ensuring Tulasi AI stays optimized...");
        await healthCheck();
        lastPing = Date.now();
      } catch (e) {
        // Silent failure
      }
    };

    // Initial ping
    ping();

    // Event-based pings (Proactive wakeup when user returns)
    const handleActivity = () => {
      if (document.visibilityState === "visible") ping();
    };

    window.addEventListener("visibilitychange", handleActivity);
    window.addEventListener("focus", handleActivity);

    const timer = setInterval(ping, INTERVAL);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener("visibilitychange", handleActivity);
      window.removeEventListener("focus", handleActivity);
    };
  }, []);

  return null; // Invisible component
}
