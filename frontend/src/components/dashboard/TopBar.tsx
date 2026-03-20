"use client";

import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { useState } from "react";

export default function TopBar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const { data: session } = useSession();
  const user = session?.user as any;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{
      height: 72,
      borderBottom: "1px solid var(--border)",
      background: "rgba(10,10,15,0.7)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: 20,
      position: "sticky",
      top: 0,
      zIndex: 40,
    } as any}>
      {/* Sidebar toggle */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleSidebar())}
        style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 8, borderRadius: 8, display: "flex", alignItems: "center", fontSize: 20 } as any}
      >
        {sidebarOpen ? "✕" : "☰"}
      </motion.button>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: 500, position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 15 }}>🔍</span>
        <input
          placeholder="Search features, topics, hackathons..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "9px 16px 9px 40px",
            color: "white",
            fontSize: 13,
            outline: "none",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={e => e.target.style.borderColor = "rgba(108,99,255,0.5)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        
        {/* Glow animated Pro Upgrade button */}
        {!user?.is_pro && (
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            style={{ 
              padding: "7px 16px", fontSize: 13, borderRadius: 10, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #8B5CF6, #38BDF8)", color: "white", fontWeight: 700 
            }}
          >
            Upgrade to Pro
          </motion.button>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Sign out */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-ghost"
          style={{ padding: "7px 16px", fontSize: 13, borderRadius: 10 } as any}
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
