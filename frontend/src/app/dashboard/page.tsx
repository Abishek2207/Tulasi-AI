"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function DashboardRouter() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
         router.replace("/auth");
      } else if (!user.is_onboarded) {
         router.replace("/onboarding");
      } else if (user.user_type?.toUpperCase() === "STUDENT") {
         router.replace("/dashboard/student");
      } else if (user.user_type?.toUpperCase() === "PROFESSOR") {
         router.replace("/dashboard/professor");
      } else {
         router.replace("/dashboard/professional");
      }
    }
  }, [user, isLoaded, router]);

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#4ECDC4", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Initializing Neural Environment...</span>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
