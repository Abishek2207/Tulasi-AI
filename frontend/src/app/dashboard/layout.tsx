"use client";

import { useSession } from "@/hooks/useSession";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleSidebar, updateStats } from "@/store/slices/uiSlice";
import { activityApi, API_URL } from "@/lib/api";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import BottomNav from "@/components/dashboard/BottomNav";
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
  const { data: session, status, isRehydrating } = useSession();
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
    if (!mounted || isRehydrating) return;
    
    if (status === "unauthenticated") {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("[Dashboard] Unauthenticated and no local token. Redirecting...");
        router.push("/auth");
      }
    }
    
    if (status === "authenticated") {
      if (user && !user.is_onboarded) {
        router.replace("/onboarding");
        return;
      }
      if (user?.role === "admin") {
        router.push("/admin");
      }
    }
  }, [status, user, router, mounted]);

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

  useEffect(() => {
    const wakeup = async () => {
      try {
        await fetch(`${API_URL}/api/health`).catch(() => null);
        console.log("[Sync] Pre-emptive wake-up call sent to backend.");
      } catch (e) {}
    };
    if (mounted) wakeup();
  }, [mounted]);

  const isFounder = session?.user?.email?.toLowerCase() === "abishekramamoorthy22@gmail.com";

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
        <TulasiLogo size={72} glow showText={false} isFounder={isFounder} />
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em" }}>
          Neural Link Establishing…
        </motion.div>
      </div>
    );
  }

  if ((status === "loading" || isRehydrating) && !hasLocalToken) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <TulasiLogo size={72} glow showText={false} />
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em" }}>
        Neural Link Establishing…
      </motion.div>
    </div>
  );

  if (!session && !hasLocalToken) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent", position: "relative" }}>
      <BackgroundBeams />

      <AnimatePresence mode="wait">
        {sidebarOpen && !isDesktop && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => dispatch(toggleSidebar())}
              style={{ position: "fixed", inset: 0, zIndex: 51, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
            <motion.div key="sidebar-mobile" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 52 }}>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isDesktop && (
        <motion.div animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }} style={{ flexShrink: 0, overflow: "hidden", borderRight: "1px solid rgba(255,255,255,0.04)", zIndex: 49 }}>
          <div style={{ width: 280 }}><Sidebar /></div>
        </motion.div>
      )}

      <div className="dash-main" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0, paddingBottom: isDesktop ? 0 : 70 }}>
        <TopBar />
        <AnnouncementBanner />
        <main className="dash-content" style={{ flex: 1, position: "relative" }}>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {!isDesktop && <BottomNav />}

      <XPNotificationSystem />
      <OnboardingModal />
      <AIManagerInsightOverlay />
      
      {user && !user.username && (
        <UsernameModal isOpen={true} onSuccess={(newUsername) => {
          const stored = localStorage.getItem("user");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.username = newUsername;
              localStorage.setItem("user", JSON.stringify(parsed));
            } catch {}
          }
          window.dispatchEvent(new Event("tulasi-auth-change"));
        }} />
      )}
    </div>
  );
}
