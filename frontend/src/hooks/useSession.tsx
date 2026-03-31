"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tulasi-ai-wgwl.onrender.com";

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
      // STEP 5 REFINED: Insert/Update user in Supabase DB with metadata
      try {
        const { error: upsertErr } = await supabase.from('users').upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString()
        }, { onConflict: 'email' });
        if (upsertErr) console.error("⚠️ Failed to sync users table:", upsertErr.message);
      } catch (err) {
        console.error("⚠️ Failed to sync users table:", err);
      }
    }

    async function exchangeSupabaseForJWT(supabaseToken: string, email: string) {
      try {
        const res = await fetch(`${API_URL}/api/auth/google-oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: email.split("@")[0], provider: "google" }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.access_token) {
            localStorage.setItem("token", result.access_token);
            localStorage.setItem("user", JSON.stringify(result.user));
            console.log("[Auth] FastAPI JWT obtained for:", email, "role:", result.user?.role);
            return { ...result.user, accessToken: result.access_token };
          }
        }
      } catch (err) {
        console.error("[Auth] Failed to exchange Supabase token for FastAPI JWT:", err);
      }
      return { id: email, email, name: email.split("@")[0], role: "student", is_pro: false, xp: 0, level: 1, streak: 0, accessToken: supabaseToken };
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

