"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { TulasiLogo } from "@/components/TulasiLogo";
import { motion } from "framer-motion";

/**
 * DashboardRouter — reads user_type from BOTH session AND localStorage
 * to handle cases where session hasn't hydrated user_type yet.
 */
export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    // Read user_type from session first, fallback to localStorage
    let userType = user?.user_type;
    if (!userType && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          userType = parsed?.user_type;
        }
      } catch {}
    }

    setChecked(true);

    if (!user && status === "unauthenticated") {
      // Check localStorage token before redirecting
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/auth");
        return;
      }
      // Token exists but session not loaded yet — wait
      return;
    }

    if (!user) return;

    if (!user.is_onboarded) {
      router.replace("/onboarding");
      return;
    }

    if (user.role === "admin" || user.email?.toLowerCase() === "abishekramamoorthy22@gmail.com") {
      router.replace("/admin");
      return;
    }

    // Route users based on their selected user_type
    if (userType === "student") {
      router.replace("/dashboard/student");
    } else {
      router.replace("/dashboard/professional");
    }
  }, [user, status, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 40% 40%, #0D0E1A 0%, #05070A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "20%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Animated logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        <TulasiLogo size={88} splash glow />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
      >
        <motion.span
          style={{
            fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
            fontWeight: 900,
            fontSize: 22,
            background: "linear-gradient(135deg, #ffffff 0%, #00E5A0 55%, #A855F7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.03em",
          }}
        >
          TulasiAI
        </motion.span>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Initializing Neural Environment…
        </motion.div>
      </motion.div>

      {/* Progress bar */}
      <div style={{ width: 180, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
        <motion.div
          style={{ height: "100%", background: "linear-gradient(90deg, transparent, #00E5A0, #A855F7, transparent)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }` }} />
    </div>
  );
}
