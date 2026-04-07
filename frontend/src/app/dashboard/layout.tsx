"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleSidebar, updateStats } from "@/store/slices/uiSlice";
import { activityApi } from "@/lib/api";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { XPNotificationSystem } from "@/components/XPNotification";
import { AIManagerInsightOverlay } from "@/components/AIManagerInsightOverlay";
import { TulasiLogo } from "@/components/TulasiLogo";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { OnboardingModal } from "@/components/OnboardingModal";
import { PageTransition } from "@/components/PageTransition";
import { UsernameModal } from "@/components/UsernameModal";

/** Safe hook — avoids SSR crash and only fires on real resize events. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDesktop;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const isDesktop = useIsDesktop();
  const user = session?.user;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const hasLocalToken = mounted && !!localStorage.getItem("token");

  useEffect(() => {
    if (status === "unauthenticated" && !hasLocalToken) router.push("/auth");
    if (status === "authenticated" && user?.role === "admin") router.push("/admin");
  }, [status, user, router, hasLocalToken]);

  // Sync Stats to Redux
  useEffect(() => {
    const fetchGlobalStats = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      if (!token) return;
      try {
        const stats = await activityApi.getStats(token);
        if (stats) {
          dispatch(updateStats({
            xp: (stats as any).xp || 0,
            level: (stats as any).level_name || "Novice",
            streak: (stats as any).streak || 0
          }));
        }
      } catch (e) {}
    };
    if (status === "authenticated") fetchGlobalStats();
  }, [status, dispatch]);

  const isFounder = session?.user?.email?.toLowerCase() === "abishekramamoorthy22@gmail.com";

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <TulasiLogo size={72} glow showText={false} isFounder={isFounder} />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em" }}
        >
          Neural Link Establishing…
        </motion.div>
      </div>
    );
  }

  // Optimistic rendering: If we have a local token, don't show the full-screen sync message
  // to avoid artificial delays. The hooks/components will handle their own loading states.
  if (status === "loading" && !hasLocalToken) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <TulasiLogo size={72} glow showText={false} />
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em" }}
      >
        Neural Link Establishing…
      </motion.div>
    </div>
  );

  if (!session && !hasLocalToken) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent", position: "relative" }}>
      <BackgroundBeams />

      {/* ── Sidebar ── */}
      <AnimatePresence mode="wait">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && !isDesktop && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(toggleSidebar())}
              style={{
                position: "fixed", inset: 0, zIndex: 48,
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              key="sidebar-mobile"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      {isDesktop && (
        <motion.div
          animate={{ 
            width: sidebarOpen ? 280 : 0,
            opacity: sidebarOpen ? 1 : 0,
          }}
          style={{ 
            flexShrink: 0, 
            overflow: "hidden", 
            borderRight: "1px solid rgba(255,255,255,0.04)",
            zIndex: 49
          }}
        >
          <div style={{ width: 280 }}>
            <Sidebar />
          </div>
        </motion.div>
      )}

      {/* ── Main content area ── */}
      <div className="dash-main" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
      }}>
        <TopBar />
        <AnnouncementBanner />
        <main className="dash-content">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      <XPNotificationSystem />
      <OnboardingModal />
      <AIManagerInsightOverlay />
      
      {user && !user.username && (
        <UsernameModal
          isOpen={true}
          onSuccess={(newUsername) => {
            // Patch the stored user object so the modal disappears without full page reload
            const stored = localStorage.getItem("user");
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                parsed.username = newUsername;
                localStorage.setItem("user", JSON.stringify(parsed));
              } catch {}
            }
            // Fire the auth-change event so useSession re-reads localStorage
            window.dispatchEvent(new Event("tulasi-auth-change"));
          }}
        />
      )}
    </div>
  );
}
