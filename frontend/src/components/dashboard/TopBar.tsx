"use client";

import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";
import { signOut, useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Command, Zap, LogOut, User, ChevronDown, Camera } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useRouter } from "next/navigation";
import { TulasiLogo } from "@/components/TulasiLogo";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function TopBar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const { data: session } = useSession();
  const user = session?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setXp(stored.xp || 0);
      setLevel(stored.level || 1);
    } catch {}
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setSignOutModalOpen(false);
    setDropdownOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    await signOut({ callbackUrl: "/" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error("Profile photo must be less than 1MB");
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
         await authApi.updateProfile({ avatar: base64Data });
         toast.success("Profile photo updated!");
         // We should update the session/user local object here or force a reload
         const stored = JSON.parse(localStorage.getItem("user") || "{}");
         stored.avatar = base64Data;
         localStorage.setItem("user", JSON.stringify(stored));
         setTimeout(() => window.location.reload(), 500); 
      } catch (err) {
         toast.error("Failed to upload photo.");
      } finally {
         setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="topbar-bg" style={{
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
      }}>
        {/* Sidebar toggle */}
        <motion.button
          whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.06)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(toggleSidebar())}
          style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
            color: "var(--text-secondary)", cursor: "pointer", padding: "7px 10px",
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            transition: "all 0.15s ease",
          }}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </motion.button>

        {/* Logo — always visible; acts as home link on mobile */}
        <a
          href="/dashboard"
          style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}
          aria-label="Tulasi AI Home"
        >
          <TulasiLogo size={32} showText glow={false}
            style={{ gap: 8 }}
          />
        </a>

        {/* Search opens Command Palette */}
        <div className="desktop-only" style={{ flex: 1, maxWidth: 420, position: "relative" }}>
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
            }}
            className="glass-card"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "8px 12px",
              color: "var(--text-muted)", fontSize: 13, outline: "none",
              fontFamily: "var(--font-inter)",
              cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Search size={16} color="var(--brand-primary)" />
              <span>Search features, topics...</span>
            </span>
            <span style={{
              fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)",
              background: "rgba(255,255,255,0.04)", padding: "4px 6px", borderRadius: 5,
              border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 2
            }}><Command size={10} />K</span>
          </button>
        </div>

        {/* Mobile Search Icon */}
        <div className="mobile-only" style={{ flex: 1, display: "flex", justifyContent: "flex-end", marginRight: 8 }}>
          <button
             onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
             style={{ background: "transparent", border: "none", color: "var(--text-muted)", padding: 8, display: "flex" }}
          >
             <Search size={20} />
          </button>
        </div>

        {/* Neural Sync Indicator */}
        <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 20 }}>
          <div style={{ position: "relative", width: 8, height: 8 }}>
            <motion.div animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 2 }} 
              style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 900, color: "var(--text-secondary)", letterSpacing: 1.5, opacity: 0.6 }}>NEURAL SYNC: ONLINE</div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <UpgradeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

          {/* XP Badge */}
          {user && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 10,
              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)",
            }}>
              <Zap size={14} color="#8B5CF6" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "#8B5CF6", fontFamily: "var(--font-mono)" }}>
                {xp}<span className="desktop-only" style={{ marginLeft: 2 }}>XP</span>
              </span>
              <span className="desktop-only" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>|</span>
              <span className="desktop-only" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
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
          <NotificationCenter />
          <ThemeToggle />

          {/* Avatar Dropdown — clicking name/avatar opens menu, NOT logout directly */}
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 12px", borderRadius: 9,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontWeight: 500,
                transition: "all 0.15s ease",
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: user?.avatar ? `url(${user.avatar}) center/cover no-repeat` : "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: "white", flexShrink: 0,
              }}>
                {!user?.avatar && (user?.name || user?.email || "U")[0].toUpperCase()}
              </div>
              <span className="desktop-only" style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown size={12} style={{ opacity: 0.5, transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: 200, background: "rgba(15,15,25,0.98)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                    overflow: "hidden", zIndex: 100,
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* User info header */}
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name || "User"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{user?.email}</div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: "6px" }}>
                    <button
                      onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile"); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 9,
                        background: "transparent", border: "none",
                        color: "var(--text-secondary)", fontSize: 13, fontWeight: 500,
                        cursor: "pointer", textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <User size={15} style={{ opacity: 0.6 }} />
                      View Profile
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 9,
                        background: "transparent", border: "none",
                        color: "var(--text-secondary)", fontSize: 13, fontWeight: 500,
                        cursor: avatarUploading ? "wait" : "pointer", textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <Camera size={15} style={{ opacity: 0.6 }} />
                      {avatarUploading ? "Uploading..." : "Change Photo"}
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleAvatarUpload} />

                    <button
                      onClick={() => { setDropdownOpen(false); setSignOutModalOpen(true); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 9,
                        background: "transparent", border: "none",
                        color: "#F43F5E", fontSize: 13, fontWeight: 500,
                        cursor: "pointer", textAlign: "left",
                        transition: "background 0.15s",
                        marginTop: 2,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(244,63,94,0.08)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Sign Out Confirmation Modal ───────────────────────────────── */}
      <AnimatePresence>
        {signOutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 9999,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={() => setSignOutModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "rgba(13,13,22,0.98)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20, padding: "36px 32px",
                minWidth: 340, maxWidth: 400,
                boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(244,63,94,0.1)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 16 }}>👋</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8, fontFamily: "var(--font-outfit)" }}>
                Sign Out?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
                Are you sure you want to sign out? Your progress is always saved.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setSignOutModalOpen(false)}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 12,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                >
                  Stay In
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 12,
                    background: "linear-gradient(135deg, #EF4444, #F43F5E)",
                    border: "none",
                    color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
