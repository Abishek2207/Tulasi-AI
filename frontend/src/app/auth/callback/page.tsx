"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth with ?code=... in the URL.
 * This page calls exchangeCodeForSession(), which sets the session cookie,
 * then redirects the user to /dashboard.
 *
 * Required Supabase redirect URI:
 *   https://tulasiai.vercel.app/auth/callback
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);

        // ── PKCE flow: exchange the ?code param ──────────────────────────────
        const code = url.searchParams.get("code");
        if (code) {
          console.log("[OAuth Callback] Exchanging auth code for session...");
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("[OAuth Callback] Code exchange failed:", error.message);
            setErrorMsg(error.message);
            setStatus("error");
            return;
          }

          const session = data.session;
          console.log("[OAuth Callback] Session established:", session?.user?.email);

          // ── Upsert user into DB ────────────────────────────────────────────
          if (session?.user) {
            const { error: upsertErr } = await supabase.from("users").upsert(
              {
                id: session.user.id,
                email: session.user.email,
                name:
                  session.user.user_metadata?.full_name ||
                  session.user.user_metadata?.name ||
                  null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
            if (upsertErr) {
              console.warn("[OAuth Callback] users upsert warning:", upsertErr.message);
            }
          }

          router.replace("/dashboard");
          return;
        }

        // ── Implicit / hash flow: session is already set by Supabase JS ──────
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          console.error(
            "[OAuth Callback] No session after OAuth redirect.",
            sessionError?.message
          );
          setErrorMsg(
            sessionError?.message || "Authentication failed — no session found."
          );
          setStatus("error");
          return;
        }

        console.log(
          "[OAuth Callback] Session found via hash:",
          sessionData.session.user.email
        );
        router.replace("/dashboard");
      } catch (err: any) {
        console.error("[OAuth Callback] Unexpected error:", err);
        setErrorMsg(err?.message || "Unknown error during authentication.");
        setStatus("error");
      }
    };

    handleCallback();
  }, [router]);

  if (status === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0B0C10",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontFamily: "var(--font-outfit, sans-serif)",
        }}
      >
        <div
          style={{
            background: "rgba(255,107,107,0.1)",
            border: "1px solid rgba(255,107,107,0.3)",
            borderRadius: 16,
            padding: "32px 40px",
            textAlign: "center",
            maxWidth: 440,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2
            style={{
              color: "#FF8585",
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Authentication Failed
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
            {errorMsg}
          </p>
          <button
            onClick={() => router.replace("/auth")}
            style={{
              background: "white",
              color: "#111",
              border: "none",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B0C10",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: "var(--font-outfit, sans-serif)",
      }}
    >
      {/* Animated spinner */}
      <div
        style={{
          width: 56,
          height: 56,
          border: "3px solid rgba(255,255,255,0.08)",
          borderTopColor: "#A855F7",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
        Signing you in…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
