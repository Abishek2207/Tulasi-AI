/**
 * useToken — Global auth token hook for Tulasi AI.
 *
 * Priority:
 *  1. session.user.accessToken (credentials login — JWT from backend)
 *  2. localStorage "token"     (stored explicitly on login/register)
 *  3. undefined                (user is a guest / OAuth with no backend JWT yet)
 *
 * Usage:
 *   const token = useToken();
 */
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useToken(): string {
  const { data: session } = useSession();
  const [token, setToken] = useState<string>(() => {
    // SSR-safe: no localStorage on server
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  });

  useEffect(() => {
    const sessionToken = (session?.user as any)?.accessToken;
    if (sessionToken) {
      // Refresh localStorage with the latest session token
      localStorage.setItem("token", sessionToken);
      setToken(sessionToken);
    } else if (typeof window !== "undefined") {
      const stored = localStorage.getItem("token");
      if (stored) setToken(stored);
    }
  }, [session]);

  return token;
}
