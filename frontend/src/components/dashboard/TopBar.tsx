"use client";

import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { useState, useEffect } from "react";
import { Menu, X, Search, Command, Zap } from "lucide-react";

export default function TopBar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const { data: session } = useSession();
  const user = session?.user as any;
  const [modalOpen, setModalOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setXp(stored.xp || 0);
      setLevel(stored.level || 1);
    } catch {}
  }, []);

  return (
    <div style={{
      height: 64,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      background: "rgba(9,9,15,0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 16,
      position: "sticky",
      top: 0,
      zIndex: 40,
    } as any}>
      {/* Sidebar toggle */}
      <motion.button
        whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.06)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => dispatch(toggleSidebar())}
        style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "7px 10px",
          borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          transition: "all 0.15s ease",
        } as any}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </motion.button>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center"
        }}><Search size={14} /></span>
        <input
          placeholder="Search features, topics..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 9, padding: "8px 16px 8px 36px",
            color: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none",
            fontFamily: "var(--font-inter)",
            transition: "all 0.15s ease",
          }}
          onFocus={e => {
            (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.4)";
            (e.target as HTMLInputElement).style.background = "rgba(139,92,246,0.04)";
          }}
          onBlur={e => {
            (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.06)";
            (e.target as HTMLInputElement).style.background = "rgba(255,255,255,0.03)";
          }}
        />
        <span style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)",
          background: "rgba(255,255,255,0.04)", padding: "4px 6px", borderRadius: 5,
          border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 2
        }}><Command size={10} />K</span>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

        {/* XP Badge */}
        {user && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 8,
            background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)",
          }}>
            <Zap size={14} color="#8B5CF6" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", fontFamily: "var(--font-mono)" }}>
              {xp} XP
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>|</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
              Lv {level}
            </span>
          </div>
        )}

        {/* Upgrade button for free users */}
        {!user?.is_pro && (
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setModalOpen(true)}
            style={{
              padding: "7px 14px", fontSize: 12, borderRadius: 8, border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              color: "white", fontWeight: 700,
              boxShadow: "0 2px 12px rgba(139,92,246,0.2)",
              transition: "all 0.15s ease",
            }}
          >
            <Zap size={14} style={{ display: "inline", marginBottom: -2, marginRight: 4 }} /> 
            Upgrade
          </motion.button>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Avatar + Sign out */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 12px", borderRadius: 9,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontWeight: 500,
              transition: "all 0.15s ease",
            } as any}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "white",
            }}>
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name?.split(" ")[0] || "Sign Out"}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
