"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";

/** Syncs the backend JWT from the NextAuth session into localStorage.
 *  This ensures all API calls using resolveToken() can find the token,
 *  regardless of whether the user logged in via credentials or OAuth.
 */
function TokenSync() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.accessToken) {
      // Save the backend JWT so resolveToken() in api.ts can find it
      localStorage.setItem("token", session.user.accessToken as string);
      // Also keep the user object fresh for dashboard components
      const stored = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
      localStorage.setItem("user", JSON.stringify({ ...stored, ...session.user }));
    } else if (session === null) {
      // Session is explicitly null means user is logged out — clear token
      localStorage.removeItem("token");
    }
  }, [session]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <TokenSync />
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
