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
    // Ping every 10 minutes (Render sleep starts at 15 mins)
    const INTERVAL = 10 * 60 * 1000; 

    const ping = async () => {
      try {
        console.log("[KeepAlive] 🛰️ Pinging backend to prevent sleep...");
        await healthCheck();
      } catch (e) {
        // Silent failure is okay for keep-alive
      }
    };

    // Initial ping
    ping();

    const timer = setInterval(ping, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return null; // Invisible component
}
