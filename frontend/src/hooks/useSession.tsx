"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";

// Global tracker to ensure one sync per session per user across all instances of the hook
const syncTracker = new Set<string>();

export interface SessionUser {
  id: string | number;
  email: string;
  name: string;
  role: string;
  is_pro: boolean;
  xp: number;
  level: number;
  streak: number;
  invite_code?: string;
  avatar?: string;
  avatar_url?: string;
  accessToken?: string; // FastAPI JWT
}

interface SessionData {
  user: SessionUser;
}

/**
 * Hybrid session hook:
 * 1. Listens to Supabase auth state (handles Google OAuth redirects)
 * 2. When Supabase session exists, calls /api/auth/google-oauth to get a FastAPI JWT
 * 3. Also syncs user metadata to the Supabase 'users' table
 */
export function useSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    let mounted = true;

    async function loadFromLocalStorage() {
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
        const userProfile = { ...JSON.parse(userStr), accessToken: token };
        if (mounted) {
          setData({ user: userProfile });
          setStatus("authenticated");
        }
        return true;
      } catch {
        return false;
      }
    }

    async function syncUserToSupabase(session: any) {
      if (!session?.user?.id || syncTracker.has(session.user.id)) return;
      syncTracker.add(session.user.id);
      
      try {
        const { error: upsertErr } = await supabase.from('users').upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString()
        }, { onConflict: 'email' });
        
        if (upsertErr) {
          if (upsertErr.message?.includes("Lock broken") || upsertErr.message?.includes("AbortError")) {
            console.warn("[Auth Sync] Lock handled by another tab/request. Skipping.");
          } else {
            console.error("⚠️ Failed to sync users table:", upsertErr.message);
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.message?.includes("Lock broken")) {
          console.warn("[Auth Sync] AbortError detected. Concurrent sync handled.");
        } else {
          console.error("⚠️ Failed to sync users table:", err);
        }
      } finally {
        // Clear from tracker after a delay to allow re-syncing if needed after a long time
        setTimeout(() => syncTracker.delete(session.user.id), 60_000);
      }
    }

    async function exchangeSupabaseForJWT(supabaseToken: string, email: string, fullName?: string) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10s max
      try {
        const res = await fetch(`${API_URL}/api/auth/google-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: fullName || email.split("@")[0], provider: "google" }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const result = await res.json();
          if (result.access_token) {
            localStorage.setItem("token", result.access_token);
            localStorage.setItem("user", JSON.stringify(result.user));
            console.log("[Auth] FastAPI JWT obtained for:", email, "role:", result.user?.role);
            return { ...result.user, accessToken: result.access_token };
          }
        } else {
          console.warn("[Auth] Backend returned", res.status, "for google-oauth \u2014 using Supabase fallback.");
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          console.warn("[Auth] Backend took >10s to respond, using Supabase session fallback.");
        } else {
          console.error("[Auth] Failed to exchange Supabase token for FastAPI JWT:", err);
        }
      }
      // Graceful fallback: user is valid via Supabase, just no FastAPI JWT yet
      return { id: email, email, name: fullName || email.split("@")[0], role: "student", is_pro: true, xp: 0, level: 1, streak: 0, accessToken: supabaseToken };
    }

    async function init() {
      const hasLocalSession = await loadFromLocalStorage();
      if (hasLocalSession) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log("[Supabase Auth] Session found:", session.user.email);
          await syncUserToSupabase(session);
          const user = await exchangeSupabaseForJWT(session.access_token, session.user.email!);
          if (mounted) {
            setData({ user });
            setStatus("authenticated");
          }
        } else {
          if (mounted) setStatus("unauthenticated");
        }
      } catch {
        if (mounted) setStatus("unauthenticated");
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Supabase Auth] State changed:", event);
      if (session?.user) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          await syncUserToSupabase(session);
        }
        const user = await exchangeSupabaseForJWT(session.access_token, session.user.email!);
        if (mounted) {
          setData({ user });
          setStatus("authenticated");
        }
      } else if (event === "SIGNED_OUT") {
        if (mounted) {
          setData(null);
          setStatus("unauthenticated");
        }
      }
    });

    const handleAuthChange = async () => {
      await loadFromLocalStorage();
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

  return { data, status, update };
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

