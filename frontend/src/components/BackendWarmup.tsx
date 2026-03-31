"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TulasiLogo } from "@/components/TulasiLogo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com";
const PING_INTERVAL_MS = 4 * 60 * 1000; // ping every 4 minutes (Render sleeps at 15 min)
const WARMUP_RETRY_INTERVAL = 3000;       // retry every 3s during warmup

type BackendState = "unknown" | "online" | "warming";

/**
 * BackendWarmup
 *
 * Strategy:
 * 1. On mount, silently ping /api/health.
 * 2. If it fails or takes >3s, show a fullscreen warmup overlay.
 * 3. Keep pinging every 3s until the backend responds.
 * 4. Dismiss the overlay smoothly once online.
 * 5. Every 4 minutes thereafter, silently re-ping to prevent Render sleep.
 */
export function BackendWarmup() {
  const [state, setState] = useState<BackendState>("unknown");
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState(".");
  const warmupStart = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000); // 6s per ping
      const res = await fetch(`${API_URL}/api/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const startWarmup = () => {
      if (!mounted) return;
      warmupStart.current = Date.now();
      setState("warming");
      setElapsed(0);

      // Tick the elapsed counter
      elapsedRef.current = setInterval(() => {
        if (mounted) setElapsed(Math.floor((Date.now() - warmupStart.current) / 1000));
      }, 1000);

      // Animate the dots
      let d = 1;
      timerRef.current = setInterval(async () => {
        if (!mounted) return;
        d = (d % 3) + 1;
        setDots(".".repeat(d));

        const ok = await ping();
        if (ok && mounted) {
          clearInterval(timerRef.current!);
          clearInterval(elapsedRef.current!);
          setState("online");
          // Start keep-alive after first successful warmup
          startKeepAlive();
        }
      }, WARMUP_RETRY_INTERVAL);
    };

    const startKeepAlive = () => {
      keepAliveRef.current = setInterval(async () => {
        await ping(); // silent, never changes UI state
      }, PING_INTERVAL_MS);
    };

    // Initial silent ping — show UI only if backend is slow
    const initialCheck = async () => {
      const quickController = new AbortController();
      const quickTimeout = setTimeout(() => quickController.abort(), 3000);
      try {
        const res = await fetch(`${API_URL}/api/health`, {
          signal: quickController.signal,
          cache: "no-store",
        });
        clearTimeout(quickTimeout);
        if (res.ok && mounted) {
          setState("online");
          startKeepAlive();
          return;
        }
      } catch {
        clearTimeout(quickTimeout);
      }
      // Backend didn't respond in 3s — show warmup UI
      startWarmup();
    };

    initialCheck();

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {state === "warming" && (
        <motion.div
          key="warmup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(5, 7, 15, 0.93)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
          }}
        >
          {/* Ambient glow background */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 30% 60%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 40%, rgba(34,211,238,0.06) 0%, transparent 60%)",
          }} />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, zIndex: 1 }}
          >
            {/* Logo */}
            <TulasiLogo size={72} glow />

            {/* Title */}
            <div style={{ textAlign: "center" }}>
              <h2 style={{
                fontSize: 22, fontWeight: 800, color: "white",
                letterSpacing: "-0.03em", marginBottom: 8,
              }}>
                Waking up the backend{dots}
              </h2>
              <p style={{
                fontSize: 13, color: "rgba(255,255,255,0.4)",
                fontWeight: 400, maxWidth: 300, lineHeight: 1.6,
              }}>
                Render spins down after 15 min of inactivity.
                <br />Connecting now — usually takes 20–40 seconds.
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ width: 260, position: "relative" }}>
              <div style={{
                width: "100%", height: 3,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 99, overflow: "hidden",
              }}>
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: "50%", height: "100%",
                    background: "linear-gradient(90deg, transparent, #A855F7, #22D3EE, transparent)",
                    borderRadius: 99,
                  }}
                />
              </div>
              {elapsed > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 10, textAlign: "center",
                    fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {elapsed}s elapsed
                </motion.p>
              )}
            </div>

            {/* Tip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 6 }}
              style={{
                fontSize: 11, color: "rgba(255,255,255,0.2)",
                textAlign: "center", maxWidth: 260, lineHeight: 1.5,
              }}
            >
              Tip: Upgrade to Render Starter ($7/mo) to eliminate cold starts permanently.
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
