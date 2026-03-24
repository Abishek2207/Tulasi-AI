"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCheck, Zap, Trophy, Flame, BrainCircuit, Target, Gift } from "lucide-react";

interface Notification {
  id: string;
  type: "xp" | "streak" | "achievement" | "interview" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: string;
}

const STORAGE_KEY = "tulasi_notifications_v1";

const DEFAULT_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "xp", title: "+50 XP Earned", message: "You completed a Mock Interview session.", time: "2m ago", read: false, icon: "⚡" },
  { id: "2", type: "streak", title: "🔥 3-Day Streak!", message: "Consistency is compounding. Keep going!", time: "1h ago", read: false, icon: "🔥" },
  { id: "3", type: "achievement", title: "Achievement Unlocked", message: "First Roadmap Generated — 'AI Engineer Path'", time: "3h ago", read: false, icon: "🏆" },
  { id: "4", type: "interview", title: "Interview Score Ready", message: "Your latest session scored 82/100 — Excellent!", time: "Yesterday", read: true, icon: "🎯" },
  { id: "5", type: "system", title: "Welcome to Orbit!", message: "Your premium career engine is ready. Start with AI Chat.", time: "2d ago", read: true, icon: "🚀" },
];

const TYPE_COLORS: Record<string, string> = {
  xp: "#8B5CF6",
  streak: "#F43F5E",
  achievement: "#FFD93D",
  interview: "#06B6D4",
  system: "#10B981",
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Load from localStorage or use defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setNotifications(stored ? JSON.parse(stored) : DEFAULT_NOTIFICATIONS);
    } catch {
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (notifications.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: 36, height: 36, borderRadius: 9,
          background: open ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)"}`,
          color: open ? "#8B5CF6" : "rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
          transition: "all 0.15s ease",
        }}
      >
        <Bell size={16} />
        {/* Badge */}
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute", top: -4, right: -4,
              width: 16, height: 16, borderRadius: "50%",
              background: "#F43F5E",
              border: "2px solid #05070D",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 900, color: "white",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 360, zIndex: 9000,
              background: "rgba(10, 10, 20, 0.97)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18,
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={15} color="#8B5CF6" />
                <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Notifications</span>
                {unread > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#F43F5E", background: "rgba(244,63,94,0.1)", padding: "2px 7px", borderRadius: 20 }}>
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ fontSize: 11, color: "rgba(139,92,246,0.8)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 340, overflowY: "auto", padding: "6px 0" }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                  <Gift size={28} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  All caught up!
                </div>
              ) : notifications.map(n => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => markRead(n.id)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 16px", cursor: "pointer",
                    background: n.read ? "transparent" : "rgba(139,92,246,0.04)",
                    borderLeft: n.read ? "3px solid transparent" : `3px solid ${TYPE_COLORS[n.type]}`,
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${TYPE_COLORS[n.type]}15`,
                    border: `1px solid ${TYPE_COLORS[n.type]}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 600 : 800, color: n.read ? "rgba(255,255,255,0.6)" : "white", marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, fontWeight: 600 }}>{n.time}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: 2, flexShrink: 0 }}
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                <button
                  onClick={() => setNotifications([])}
                  style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
