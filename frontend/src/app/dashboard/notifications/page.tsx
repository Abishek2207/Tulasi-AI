"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, BrainCircuit, Trophy, Flame, Zap, Star, Info, X } from "lucide-react";
import { API } from "@/lib/api";

type Notification = {
  id: string;
  type: "achievement" | "streak" | "ai" | "system" | "challenge";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  achievement: <Trophy size={18} color="#FFD93D" />,
  streak: <Flame size={18} color="#F43F5E" />,
  ai: <BrainCircuit size={18} color="#8B5CF6" />,
  system: <Info size={18} color="#06B6D4" />,
  challenge: <Zap size={18} color="#10B981" />,
};

const COLOR_MAP: Record<string, string> = {
  achievement: "#FFD93D",
  streak: "#F43F5E",
  ai: "#8B5CF6",
  system: "#06B6D4",
  challenge: "#10B981",
};

// Static welcome notifications — shown while real ones load
const DEFAULT_NOTIFS: Notification[] = [
  {
    id: "welcome-1",
    type: "ai",
    title: "Welcome to TulasiAI!",
    message: "Your AI Mentor is ready. Tap the mic on Voice AI or open AI Chat to begin your journey.",
    time: "Just now",
    read: false,
  },
  {
    id: "welcome-2",
    type: "challenge",
    title: "Daily Challenge Unlocked",
    message: "A new coding challenge is waiting for you in the Code Arena. Solve it to earn XP!",
    time: "Today",
    read: false,
  },
  {
    id: "welcome-3",
    type: "streak",
    title: "Keep Your Streak Alive!",
    message: "Log in daily and interact with TulasiAI to maintain your neural streak and climb the leaderboard.",
    time: "Today",
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) { setLoading(false); return; }

    fetch(`${API}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.notifications?.length) {
          setNotifications(d.notifications);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bell size={24} color="#8B5CF6" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", margin: 0 }}>
              Notifications
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            style={{
              padding: "8px 18px", borderRadius: 10,
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
              color: "#A78BFA", fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <CheckCircle size={14} /> Mark all read
          </motion.button>
        )}
      </motion.div>

      {/* Notifications List */}
      <AnimatePresence>
        {loading ? (
          // Skeleton loaders
          [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.1 }}
              style={{
                height: 80, borderRadius: 16, marginBottom: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)",
              }}
            />
          ))
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 20px" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <p style={{ color: "var(--text-muted)", fontSize: 15, fontWeight: 500 }}>
              No notifications yet. Complete challenges and interact with your AI Mentor to get updates!
            </p>
          </motion.div>
        ) : (
          notifications.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "16px 20px", borderRadius: 16, marginBottom: 10,
                background: notif.read ? "rgba(255,255,255,0.015)" : `rgba(${COLOR_MAP[notif.type] === "#FFD93D" ? "255,217,61" : COLOR_MAP[notif.type] === "#F43F5E" ? "244,63,94" : COLOR_MAP[notif.type] === "#8B5CF6" ? "139,92,246" : COLOR_MAP[notif.type] === "#06B6D4" ? "6,182,212" : "16,185,129"},0.05)`,
                border: `1px solid ${notif.read ? "rgba(255,255,255,0.05)" : `${COLOR_MAP[notif.type]}25`}`,
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              {/* Unread dot */}
              {!notif.read && (
                <div style={{
                  position: "absolute", top: 16, right: 48,
                  width: 8, height: 8, borderRadius: "50%",
                  background: COLOR_MAP[notif.type],
                  boxShadow: `0 0 8px ${COLOR_MAP[notif.type]}`,
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `${COLOR_MAP[notif.type]}15`, border: `1px solid ${COLOR_MAP[notif.type]}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {ICON_MAP[notif.type]}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 4 }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500 }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>
                  {notif.time}
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(notif.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.2)", padding: 4, borderRadius: 8,
                  display: "flex", alignItems: "center", flexShrink: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
