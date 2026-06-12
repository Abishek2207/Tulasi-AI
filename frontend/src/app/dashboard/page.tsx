"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const forceSelect = searchParams.get("select") === "true";

  useEffect(() => {
    if (status === "loading") return;

    if (!user && status === "unauthenticated") {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.replace("/auth");
      }
      return;
    }

    if (user && !user.is_onboarded) {
      router.replace("/onboarding");
      return;
    }

    if (forceSelect) return; // Stay on selection screen if requested

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

    // We no longer auto-redirect here. 
    // The user requested: "login pananthuku aprm 2 keaknum" 
    // This ensures they always see the Student vs Professional selection screen.
  }, [user, status, router, forceSelect]);

  if (status === "loading" || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "#05070A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TulasiLogo size={64} glow splash />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 40% 40%, #0D0E1A 0%, #05070A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 40,
        position: "relative",
        overflow: "hidden",
        padding: 24,
      }}
    >
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "20%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, zIndex: 10 }}
      >
        <TulasiLogo size={64} glow />
        <h1 style={{
          fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
          fontWeight: 800,
          fontSize: 32,
          color: "white",
          marginTop: 16,
          textAlign: "center"
        }}>
          Welcome back, {user.name?.split(" ")[0] || "Engineer"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>Select your workspace to continue</p>
      </motion.div>

      <div style={{ display: "flex", gap: 24, zIndex: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.push("/dashboard/student")}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(139,92,246,0.3)",
            padding: "40px 32px",
            borderRadius: 24,
            cursor: "pointer",
            width: 280,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139,92,246,0.1)";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.transform = "translateY(0px)";
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 8 }}>Student Hub</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Access your college roadmap, AI mentors, and internship matching.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push("/dashboard/professional")}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(16,185,129,0.3)",
            padding: "40px 32px",
            borderRadius: 24,
            cursor: "pointer",
            width: 280,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(16,185,129,0.1)";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.transform = "translateY(0px)";
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 8 }}>Professional Hub</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Access your upskilling modules, interview prep, and career growth tools.</p>
        </motion.div>
      </div>
    </div>
  );
}
