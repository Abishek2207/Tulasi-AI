"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/api";

interface Session {
  user: User & { accessToken?: string; name?: string; email?: string; image?: string };
}

export function useSession() {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("unauthenticated");
        setData(null);
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExp = payload.exp * 1000 < Date.now();
        if (isExp) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setStatus("unauthenticated");
          setData(null);
          return;
        }

        const userStr = localStorage.getItem("user");
        let userProfile = { id: 0, role: "student", ...payload };
        if (userStr) {
          try { userProfile = { ...userProfile, ...JSON.parse(userStr) }; } catch (e) {}
        }
        
        setData({
          user: {
            ...userProfile,
            name: userProfile.name || payload.sub,
            email: userProfile.email || payload.sub,
            accessToken: token
          } as any
        });
        setStatus("authenticated");
      } catch (err) {
        setStatus("unauthenticated");
        setData(null);
      }
    };

    checkSession();
    
    // Custom event to trigger re-renders on login/logout from within the same window
    const handleAuthChange = () => checkSession();
    window.addEventListener("tulasi-auth-change", handleAuthChange);
    window.addEventListener("storage", checkSession); // for cross-tab

    return () => {
      window.removeEventListener("tulasi-auth-change", handleAuthChange);
      window.removeEventListener("storage", checkSession);
    };
  }, []);

  // Expose an update function if needed to artificially trigger rechecking
  const update = async () => {
    window.dispatchEvent(new Event("tulasi-auth-change"));
  };

  return { data, status, update };
}

export function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("tulasi-auth-change"));
  window.location.href = callbackUrl || "/auth";
}

export function signIn(provider: string, options?: any) {
  // In our custom implementation, we just route to `/auth` because
  // the unified JWT login is handled there.
  window.location.href = "/auth";
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
