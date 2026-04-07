"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { API_URL } from "@/lib/api";

// Global tracker to ensure one sync per session per user across all instances of the hook
const syncTracker = new Set<string>();

export interface SessionUser {
  id: string | number;
  email: string;
  name: string;
  username?: string;
  role: string;
  is_pro: boolean;
  xp: number;
  level: number;
  streak: number;
  invite_code?: string;
  avatar?: string;
  avatar_url?: string;
  accessToken?: string; // FastAPI JWT
  is_onboarded?: boolean;
  user_type?: string;
}

interface SessionData {
  user: SessionUser;
}

/**
 * Hybrid session hook — Priority order:
 * 1. localStorage JWT (email/password login) — ALWAYS takes priority
 * 2. Supabase OAuth session (Google/GitHub)
 *
 * Key fix: Supabase's null INITIAL_SESSION will NEVER overwrite a valid localStorage token.
 */
export function useSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [isRehydrating, setIsRehydrating] = useState(true);

  useEffect(() => {
    let mounted = true;

    // ── 1. Try to load from localStorage (email/password users) ──────────────
    function loadFromLocalStorage(): boolean {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) return false;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return false;
        }
        let userProfile = { ...JSON.parse(userStr), accessToken: token };
        if (userProfile.email && userProfile.email.toLowerCase() === "abishekramamoorthy22@gmail.com") {
          userProfile.role = "admin";
        }
        if (mounted) {
          setData({ user: userProfile });
          setStatus("authenticated");
        }
        return true;
      } catch {
        return false;
      }
    }

    // ── 2. Exchange Supabase OAuth token for FastAPI JWT ──────────────────────
    async function exchangeSupabaseForJWT(supabaseToken: string, email: string, fullName?: string, provider?: string): Promise<SessionUser> {
      try {
        const res = await fetch(`${API_URL}/api/auth/google-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: fullName || email.split("@")[0], provider: provider || "google" }),
          signal: AbortSignal.timeout(10_000),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.access_token) {
            localStorage.setItem("token", result.access_token);
            localStorage.setItem("user", JSON.stringify(result.user));
            return { ...result.user, accessToken: result.access_token };
          }
        }
      } catch (err: any) {
        if (err.name !== "TimeoutError" && err.name !== "AbortError") {
          console.error("[Auth] Failed to exchange Supabase token:", err);
        }
      }
      // Graceful fallback: user is valid via Supabase
      const isAdmin = email.toLowerCase() === "abishekramamoorthy22@gmail.com";
      return {
        id: email,
        email,
        name: fullName || email.split("@")[0],
        role: isAdmin ? "admin" : "student",
        is_pro: true,
        xp: 0,
        level: 1,
        streak: 0,
        accessToken: supabaseToken,
      };
    }

    async function syncUserToSupabase(session: any) {
      if (!session?.user?.id || syncTracker.has(session.user.id)) return;
      syncTracker.add(session.user.id);
      try {
        await supabase.from("users").upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
        }, { onConflict: "email" });
      } catch { /* silent */ }
      setTimeout(() => syncTracker.delete(session.user.id), 60_000);
    }

    // ── Init: localStorage FIRST, Supabase only if no local token ────────────
    async function init() {
      // CRITICAL: If we have a valid local JWT, skip Supabase entirely
      const hasLocalSession = loadFromLocalStorage();
      if (hasLocalSession) {
        console.log("[Auth] Local session detected and valid. Skipping OAuth sync.");
        return;
      }

      // No local JWT → check Supabase OAuth session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("[Auth] Supabase session found. Exchanging for JWT...");
          await syncUserToSupabase(session);
          const provider = session.user.app_metadata?.provider || "google";
          const userName = session.user.user_metadata?.full_name
            || session.user.user_metadata?.name
            || session.user.user_metadata?.user_name;
          const user = await exchangeSupabaseForJWT(session.access_token, session.user.email!, userName, provider);
          if (mounted) {
            setData({ user });
            setStatus("authenticated");
          }
        } else {
          // Double check one last time before marking as unauthenticated
          const finalCheck = localStorage.getItem("token");
          if (!finalCheck && mounted) {
            console.log("[Auth] No local or OAuth session found.");
            setStatus("unauthenticated");
          } else if (mounted) {
            loadFromLocalStorage();
          }
        }
      } catch (err) {
        console.error("[Auth] Initialization error:", err);
        if (mounted) {
          const fallback = loadFromLocalStorage();
          if (!fallback) setStatus("unauthenticated");
        }
      }
    }

    init().finally(() => {
      if (mounted) setIsRehydrating(false);
    });

    // ── Supabase auth state listener (OAuth only — NEVER overrides local JWT) ──
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // CRITICAL: If user has a local FastAPI JWT, Supabase events have no authority.
      // We check this at the very start to avoid any state clearing.
      if (typeof window !== "undefined" && localStorage.getItem("token")) {
        // If we are already authenticated locally, ignore Supabase SIGNED_OUT or INITIAL_SESSION
        return;
      }

      if (session?.user) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          await syncUserToSupabase(session);
        }
        const provider = session.user.app_metadata?.provider || "google";
        const userName = session.user.user_metadata?.full_name
          || session.user.user_metadata?.name
          || session.user.user_metadata?.user_name;
        const user = await exchangeSupabaseForJWT(session.access_token, session.user.email!, userName, provider);
        if (mounted) {
          setData({ user });
          setStatus("authenticated");
        }
      } else if (event === "SIGNED_OUT") {
        // ONLY clear if there's no local token (which we checked above, but double check for safety)
        if (mounted && !localStorage.getItem("token")) {
          console.log("[Auth] Supabase signed out and no local token. Resetting session.");
          setData(null);
          setStatus("unauthenticated");
        }
      }
    });

    // ── Listen for custom email/password login events ─────────────────────────
    const handleAuthChange = () => {
      console.log("[Auth] Auth change event detected. Reloading session...");
      loadFromLocalStorage();
    };
    window.addEventListener("tulasi-auth-change", handleAuthChange);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      window.removeEventListener("tulasi-auth-change", handleAuthChange);
    };
  }, []);

  const update = async () => {
    window.dispatchEvent(new Event("tulasi-auth-change"));
  };

  return { data, status, update, isRehydrating };
}

export async function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  await supabase.auth.signOut();
  window.location.href = callbackUrl || "/auth";
}

export function signIn(provider: string, options?: any) {
  window.location.href = "/auth";
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
