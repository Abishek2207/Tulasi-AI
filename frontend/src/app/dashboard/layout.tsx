"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { BackendBanner } from "@/components/dashboard/BackendBanner";
import { DebugPanel } from "@/components/DebugPanel";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const user = session?.user as any;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated" && user?.role === "admin") router.push("/admin");
  }, [status, user, router]);

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(108,99,255,0.2)", borderTopColor: "#6C63FF" } as any}
      />
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading your workspace...</p>
    </div>
  );

  if (!session) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
      <BackgroundBeams />
      <BackendBanner />
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -280, opacity: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 } as any}>
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 0, transition: "margin-left 0.22s ease", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
