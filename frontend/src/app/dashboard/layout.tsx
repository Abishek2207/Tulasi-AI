"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { DebugPanel } from "@/components/DebugPanel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const user = session?.user;

  const hasLocalToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  useEffect(() => {
    // Allow access if NextAuth session exists OR a backend JWT token is in localStorage.
    if (status === "unauthenticated" && !hasLocalToken) router.push("/auth");
    if (status === "authenticated" && user?.role === "admin") router.push("/admin");
  }, [status, user, router, hasLocalToken]);

  // Sync NextAuth session token → localStorage so all API calls and DebugPanel work
  // This is critical for OAuth users (Google/GitHub) who never go through the email login flow
  useEffect(() => {
    if (status === "authenticated" && user) {
      const sessionToken = (user as { accessToken?: string }).accessToken;
      if (sessionToken && !localStorage.getItem("token")) {
        localStorage.setItem("token", sessionToken);
      }
      if (!localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify({
          id: (user as { id?: string }).id,
          email: user.email,
          name: user.name,
          role: (user as { role?: string }).role,
        }));
      }
    }
  }, [status, user]);

  if (status === "loading") return (

    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED" }}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading your workspace...</p>
    </div>
  );

  // Allow rendering if NextAuth session OR a local backend JWT token exists
  if (!session && !hasLocalToken) return null;


  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
      <BackgroundBeams />
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 }}
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? 260 : 0,
        transition: "margin-left 0.22s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}>
        <TopBar />
        <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </main>
      </div>
      <DebugPanel />
    </div>
  );
}
