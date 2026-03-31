"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SessionData {
  user: any;
}

export function useSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          if (mounted) {
            setStatus("unauthenticated");
            setData(null);
          }
          return;
        }

        console.log("[Supabase Auth] Session recovered:", session.user.email);
        
        if (mounted) {
          setData({ user: session.user });
          setStatus("authenticated");
        }
      } catch (err) {
        if (mounted) setStatus("unauthenticated");
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Supabase Auth] State changed:", event);
      if (session) {
        if (mounted) {
          setData({ user: session.user });
          setStatus("authenticated");
        }

        // ────────────────────────────────────────────────────────
        // STEP 7 AUTOMATIC FIX: Insert user into Supabase DB if not exists
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          const { error: upsertErr } = await supabase.from('users').upsert({
            id: session.user.id,
            email: session.user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (upsertErr) console.error("⚠️ Failed to sync users table:", upsertErr);
        }
        // ────────────────────────────────────────────────────────

      } else {
        if (mounted) {
          setStatus("unauthenticated");
          setData(null);
        }
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const update = async () => {}; // Stub for backward compatibility

  return { data, status, update };
}

export async function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
  await supabase.auth.signOut();
  window.location.href = callbackUrl || "/auth";
}

export function signIn(provider: string, options?: any) {
  window.location.href = "/auth";
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
