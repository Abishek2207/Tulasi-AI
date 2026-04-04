"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { API_URL } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        console.log("[OAuth Callback] Processing authenticaton...");

        // 1. Wait for Supabase to process the URL and establish the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(`Supabase Session Error: ${sessionError.message}`);
        }

        if (!session) {
          throw new Error("Authentication failed: No session established from OAuth redirect.");
        }

        console.log("[OAuth Callback] Session confirmed for:", session.user.email);

        const userEmail = session.user.email;
        const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail?.split("@")[0] || "User";
        const provider = session.user.app_metadata?.provider || "google";

        // 2. Clear backend URL ensuring HTTPS and no trailing slash

        console.log("[OAuth Callback] Exchanging with backend...");

        // 3. Exchange with backend
        const res = await fetch(`${API_URL}/api/auth/google-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, name: userName, provider }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(`Backend rejected login: ${errorData.detail || res.status}`);
        }

        const result = await res.json();

        // 4. Validate & Store explicitly
        if (!result.access_token) {
          throw new Error("No access_token returned from FastAPI backend.");
        }

        console.log("[OAuth Callback] Token received. Saving to storage...");
        localStorage.setItem("token", result.access_token);
        localStorage.setItem("user", JSON.stringify(result.user));

        // Let the rest of the app know auth state might have updated
        window.dispatchEvent(new Event("tulasi-auth-change"));

        // 5. Short delay to guarantee state persistence before routing
        setTimeout(() => {
          if (mounted) {
            router.replace("/dashboard");
          }
        }, 300);

      } catch (err: any) {
        console.error("[OAuth Callback] Fatal Error:", err);
        if (mounted) {
          setErrorMsg(err.message || "Failed to authenticate. Please try again.");
          setStatus("error");
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Error UI
  if (status === "error") {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: "var(--font-outfit, sans-serif)" }}>
        <div style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 16, padding: "32px 40px", textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: "#FF8585", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Authentication Failed</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24, wordBreak: "break-word" }}>{errorMsg}</p>
          <button onClick={() => router.replace("/auth")} style={{ background: "white", color: "#111", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Loading UI
  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: "var(--font-outfit, sans-serif)" }}>
      <div style={{ width: 56, height: 56, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#A855F7", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Establishing secure connection...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
