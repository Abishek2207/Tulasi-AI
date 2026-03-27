"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleSidebar } from "@/store/slices/uiSlice";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { DebugPanel } from "@/components/DebugPanel";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const user = session?.user;

  const hasLocalToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  useEffect(() => {
    if (status === "unauthenticated" && !hasLocalToken) router.push("/auth");
    if (status === "authenticated" && user?.role === "admin") router.push("/admin");
  }, [status, user, router, hasLocalToken]);

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

  if (!session && !hasLocalToken) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
      <BackgroundBeams />

      {/* ── Sidebar overlay (all screen sizes) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dark backdrop — visible and tappable on mobile */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(toggleSidebar())}
              style={{
                position: "fixed", inset: 0, zIndex: 48,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            />
            <motion.div
              key="sidebar"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content — never shifts on mobile ── */}
      <div className="dash-main" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
      }}>
        <TopBar />
        <main className="dash-content">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {children}
          </motion.div>
        </main>
      </div>

      <DebugPanel />
    </div>
  );
}
