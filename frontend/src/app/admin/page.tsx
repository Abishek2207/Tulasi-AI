"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { TulasiLogo } from "@/components/TulasiLogo";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import toast from "react-hot-toast";
import {
  adminApi, Stats, AdminUser, Review, Activity, LeaderboardEntry,
  CodeAnalytics, ChatAnalytics, Analytics, Hackathon,
  RevenueAnalytics, SystemHealth, AiUserProfile, Announcement, InviteCodeStats,
  RetentionData, HeatmapData, LiveUsers,
} from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";

type Tab = "overview" | "metrics" | "users" | "reviews" | "activity" | "leaderboard" | "code" | "chat" | "hackathons" | "revenue" | "health" | "tools";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:10000";
const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDT = (d?: string | null) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const Avatar = ({ name, pro }: { name: string; pro: boolean }) => (
  <div style={{ width: 36, height: 36, borderRadius: 10, background: pro ? "linear-gradient(135deg,#8B5CF6,#06B6D4)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: 14, flexShrink: 0 }}>
    {(name || "?")[0].toUpperCase()}
  </div>
);

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",    label: "Overview",       icon: "⚡" },
  { id: "metrics",     label: "Metrics",        icon: "📈" },
  { id: "users",       label: "Users",          icon: "👥" },
  { id: "revenue",     label: "Revenue",        icon: "💰" },
  { id: "reviews",     label: "Reviews",        icon: "⭐" },
  { id: "activity",    label: "Activity",       icon: "📡" },
  { id: "leaderboard", label: "Leaderboard",    icon: "🏆" },
  { id: "code",        label: "Code",           icon: "💻" },
  { id: "chat",        label: "Chat",           icon: "💬" },
  { id: "hackathons",  label: "Hackathons",     icon: "🚀" },
  { id: "health",      label: "System Health",  icon: "🩺" },
  { id: "tools",       label: "Admin Tools",    icon: "🛠️" },
];

const rankColor = (r: number) => r === 1 ? "#FFD700" : r === 2 ? "#C0C0C0" : r === 3 ? "#CD7F32" : r <= 10 ? "#8B5CF6" : "var(--text-muted)";
const rankBg = (r: number) => r === 1 ? "linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,165,0,0.06))" : r === 2 ? "linear-gradient(135deg,rgba(192,192,192,0.10),rgba(148,163,184,0.05))" : r === 3 ? "linear-gradient(135deg,rgba(205,127,50,0.10),rgba(184,115,51,0.04))" : r <= 10 ? "rgba(124,58,237,0.05)" : "transparent";

const TH: React.CSSProperties = { padding: "14px 20px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "14px 20px", fontSize: 13 };

const rowHover = (el: HTMLElement, on: boolean, featured = false) => {
  el.style.background = on ? (featured ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.025)") : (featured ? "rgba(255,215,0,0.03)" : "transparent");
};

const KPI = ({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub?: string }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className="glass-card premium-glow" style={{ padding: "22px 24px", borderTop: `2px solid ${color}`, position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)" }}>
    <div style={{ position: "absolute", right: -10, bottom: -10, fontSize: 80, opacity: 0.05, filter: "blur(2px)", transform: "rotate(-15deg)", pointerEvents: "none" }}>{icon}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 16, boxShadow: `0 0 10px ${color}20` }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</div>
    </div>
    <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "var(--font-outfit)", color: "white", textShadow: `0 0 24px ${color}60`, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, fontWeight: 500 }}>{sub}</div>}
  </motion.div>
);

const StatusBadge = ({ s }: { s: string }) => {
  const map: Record<string, string> = { Open: "badge-green", Active: "badge-green", Upcoming: "badge-yellow", Closed: "badge-pink", Ongoing: "badge-blue" };
  return <span className={`badge ${map[s] || "badge-blue"}`} style={{ fontSize: 10 }}>{s}</span>;
};

// Animated table row wrapper
const TR = ({ children, delay = 0, featured = false }: { children: React.ReactNode; delay?: number; featured?: boolean }) => (
  <motion.tr initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.25 }}
    style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: featured ? "rgba(255,215,0,0.02)" : "transparent" }}
    onMouseEnter={e => rowHover(e.currentTarget, true, featured)}
    onMouseLeave={e => rowHover(e.currentTarget, false, featured)}>
    {children}
  </motion.tr>
);

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const token = user?.accessToken;

  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeReviewTab, setActiveReviewTab] = useState<"pending" | "approved">("pending");
  const [activity, setActivity] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [codeAnalytics, setCodeAnalytics] = useState<CodeAnalytics | null>(null);
  const [chatAnalytics, setChatAnalytics] = useState<ChatAnalytics | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "created_at" | "last_seen">("xp");
  const [actionLoading, setActionLoading] = useState("");
  // AI Profile modal
  const [aiModal, setAiModal] = useState<{ open: boolean; data: AiUserProfile | null; loading: boolean }>({ open: false, data: null, loading: false });
  // Bulk select
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  // XP Editor modal
  const [xpModal, setXpModal] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [xpDelta, setXpDelta] = useState("100");
  const [xpReason, setXpReason] = useState("Admin bonus");
  const [xpLoading, setXpLoading] = useState(false);
  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annMessage, setAnnMessage] = useState("");
  const [annType, setAnnType] = useState("info");
  const [annExpiry, setAnnExpiry] = useState(24);
  const [annLoading, setAnnLoading] = useState(false);
  // Invite Codes
  const [inviteCodes, setInviteCodes] = useState<string[]>([]);
  const [inviteCount, setInviteCount] = useState(5);
  const [inviteGrantsPro, setInviteGrantsPro] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteStats, setInviteStats] = useState<InviteCodeStats | null>(null);
  // Metrics / Retention
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [liveUsers, setLiveUsers] = useState<LiveUsers | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated" && user?.role !== "admin") router.push("/dashboard");
  }, [status, user, router]);

  const load = useCallback(async () => {
    try {
      const [u, r, s, a, lb, ca, cha, hk, an, rev] = await Promise.allSettled([
        adminApi.users(), adminApi.reviews(), adminApi.stats(), adminApi.activity(),
        adminApi.leaderboard(), adminApi.code(), adminApi.chat(), adminApi.hackathons(),
        adminApi.analytics(), adminApi.revenue(),
      ]);
      if (u.status === "fulfilled") setUsers(u.value.users);
      if (r.status === "fulfilled") setReviews(r.value.reviews);
      if (s.status === "fulfilled") setStats(s.value);
      if (a.status === "fulfilled") setActivity(a.value.activity);
      if (lb.status === "fulfilled") setLeaderboard(lb.value.leaderboard);
      if (ca.status === "fulfilled") setCodeAnalytics(ca.value);
      if (cha.status === "fulfilled") setChatAnalytics(cha.value);
      if (hk.status === "fulfilled") setHackathons(hk.value.hackathons);
      if (an.status === "fulfilled") setAnalytics(an.value);
      if (rev.status === "fulfilled") setRevenue(rev.value);
    } catch (e) { console.error("[Admin] Load error:", e); }
    finally { setLoading(false); }
  }, []);

  const loadHealth = useCallback(async () => {
    try { const h = await adminApi.systemHealth(); setHealth(h); } catch {}
  }, []);

  useEffect(() => { if (tab === "health") loadHealth(); }, [tab, loadHealth]);

  const loadMetrics = useCallback(async () => {
    try {
      const [rt, hm, lu] = await Promise.allSettled([
        adminApi.retention(), adminApi.activityHeatmap(), adminApi.liveUsers()
      ]);
      if (rt.status === "fulfilled") setRetention(rt.value);
      if (hm.status === "fulfilled") setHeatmap(hm.value);
      if (lu.status === "fulfilled") setLiveUsers(lu.value);
    } catch {}
  }, []);

  useEffect(() => { if (tab === "metrics") loadMetrics(); }, [tab, loadMetrics]);

  // Live Users polling if anywhere on admin panel (for sidebar/topbar badge)
  useEffect(() => {
    const fetchLive = async () => { try { const d = await adminApi.liveUsers(); setLiveUsers(d); } catch {} };
    fetchLive();
    const t = setInterval(fetchLive, 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const openAiProfile = async (userId: number) => {
    setAiModal({ open: true, data: null, loading: true });
    try {
      const d = await adminApi.aiProfile(userId);
      setAiModal({ open: true, data: d, loading: false });
    } catch { setAiModal({ open: false, data: null, loading: false }); toast.error("AI Profile failed"); }
  };

  const runBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return toast.error("Select at least one user");
    setBulkLoading(true);
    try {
      const d = await adminApi.bulkAction(Array.from(selectedUsers), action);
      toast.success(d.message);
      setSelectedUsers(new Set());
      await load();
    } catch { toast.error("Bulk action failed"); }
    finally { setBulkLoading(false); }
  };

  const toggleUser = async (id: number, active: boolean) => {
    try { await adminApi.toggleUser(id, !active); setUsers(u => u.map(x => x.id === id ? { ...x, is_active: !active } : x)); }
    catch { toast.error("Failed to toggle user."); }
  };
  const deleteReview = async (id: number) => {
    if (!confirm("Delete this review permanently?")) return;
    try { await adminApi.deleteReview(id); setReviews(r => r.filter(x => x.id !== id)); toast.success("Review deleted."); }
    catch { toast.error("Failed to delete review."); }
  };
  const approveReview = async (id: number) => {
    try { 
      const d = await adminApi.approveReview(id);
      setReviews(r => r.map(x => x.id === id ? { ...x, is_approved: true } : x)); 
      toast.success(d.message || "Review approved!"); 
    } catch { toast.error("Failed to approve."); }
  };
  const featureReview = async (id: number) => {
    try { const d = await adminApi.featureReview(id); setReviews(r => r.map(x => x.id === id ? { ...x, is_featured: d.is_featured } : x)); }
    catch { toast.error("Failed to update."); }
  };

  const seedHackathons = async () => {
    setActionLoading("seedH");
    try { const d = await adminApi.seedHackathons(); toast.success(d.message); await load(); }
    catch { toast.error("Seed failed."); }
    finally { setActionLoading(""); }
  };
  const deleteHackathon = async (id: number) => {
    if (!confirm("Delete hackathon?")) return;
    try { await adminApi.deleteHackathon(id); setHackathons(h => h.filter(x => x.id !== id)); }
    catch { toast.error("Failed."); }

  // ── Tool handlers ──────────────────────────────────────────────────
  };
  const submitXpEdit = async () => {
    if (!xpModal.user) return;
    setXpLoading(true);
    try {
      const d = await adminApi.editXP(xpModal.user.id, parseInt(xpDelta), xpReason);
      toast.success(d.message);
      setUsers(u => u.map(x => x.id === xpModal.user!.id ? { ...x, xp: d.new_xp, level: d.new_level } : x));
      setXpModal({ open: false, user: null });
    } catch { toast.error("XP update failed"); }
    finally { setXpLoading(false); }
  };

  const loadAnnouncements = useCallback(async () => {
    try { const d = await adminApi.getAnnouncements(); setAnnouncements(d.announcements); } catch {}
  }, []);

  useEffect(() => { if (tab === "tools") { loadAnnouncements(); adminApi.inviteCodeStats().then(setInviteStats).catch(() => {}); } }, [tab, loadAnnouncements]);

  const createAnnouncement = async () => {
    if (!annMessage.trim()) return toast.error("Enter a message");
    setAnnLoading(true);
    try {
      await adminApi.createAnnouncement(annMessage, annType, annExpiry);
      toast.success("Announcement created!");
      setAnnMessage("");
      await loadAnnouncements();
    } catch { toast.error("Failed to create announcement"); }
    finally { setAnnLoading(false); }
  };

  const deleteAnnouncement = async (id: string) => {
    try { await adminApi.deleteAnnouncement(id); setAnnouncements(a => a.filter(x => x.id !== id)); toast.success("Deleted"); }
    catch { toast.error("Failed"); }
  };

  const generateInviteCodes = async () => {
    setInviteLoading(true);
    try {
      const d = await adminApi.generateInviteCodes(inviteCount, inviteGrantsPro);
      setInviteCodes(d.codes);
      toast.success(`${d.count} codes generated!`);
    } catch { toast.error("Generation failed"); }
    finally { setInviteLoading(false); }
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(inviteCodes.join("\n"));
    toast.success("All codes copied!");
  };

  const downloadCSV = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const url = `${API}/api/admin/export/users`;
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "tulasi_users.csv");
    // Add auth header via fetch + blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
        toast.success("CSV downloaded!");
      })
      .catch(() => toast.error("Download failed"));
  };

  const filteredUsers = users
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "xp" ? b.xp - a.xp : sortBy === "created_at" ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime());

  if (status === "loading" || loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: 48, height: 48, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
      {/* Cyberpunk Grid / Glow Overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 60%)", filter: "blur(120px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)", filter: "blur(120px)", zIndex: 0, pointerEvents: "none" }} />

      {/* ── SIDEBAR ── */}
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ width: 260, background: "rgba(5,5,12,0.6)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", padding: "32px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh", zIndex: 10 }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <TulasiLogo size={28} showText />
          <div style={{ marginTop: 8, fontSize: 10, color: "#F43F5E", fontWeight: 800, letterSpacing: 2, padding: "4px 10px", background: "rgba(244,63,94,0.1)", borderRadius: 6, display: "inline-block", border: "1px solid rgba(244,63,94,0.2)" }}>🔒 ADMIN PANEL</div>
        </div>

        {TABS.map((t, i) => (
          <motion.button key={t.id} onClick={() => setTab(t.id)}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", margin: "2px 10px", borderRadius: 10, border: "none", background: tab === t.id ? "rgba(139,92,246,0.15)" : "transparent", color: tab === t.id ? "#A78BFA" : "var(--text-muted)", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, transition: "all 0.15s", borderLeft: `2px solid ${tab === t.id ? "#8B5CF6" : "transparent"}` }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
          </motion.button>
        ))}

        <div style={{ marginTop: "auto", padding: "0 20px" }}>
          {liveUsers && (
            <div style={{ padding: "12px", background: "rgba(16,185,129,0.06)", borderRadius: 10, border: "1px solid rgba(16,185,129,0.2)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative", width: 12, height: 12 }}>
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: "absolute", inset: -4, background: "#10B981", borderRadius: "50%" }} />
                <div style={{ position: "absolute", inset: 0, background: "#10B981", borderRadius: "50%", boxShadow: "0 0 10px #10B981" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10B981" }}>{liveUsers.online_now} Online</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Last 5 mins</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button onClick={() => { setLoading(true); load(); }} style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            🔄 Refresh Data
          </button>
        </div>
      </motion.div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px", position: "relative", zIndex: 10 }}>
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Platform Overview</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>Live metrics — auto-refreshes every 30s</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 36 }}>
                <KPI label="Total Users"        value={stats?.total_users ?? 0}                  icon="👥" color="#8B5CF6" />
                <KPI label="Active 24h"         value={stats?.active_24h ?? 0}                   icon="⚡" color="#10B981" sub={`${stats?.active_today ?? 0} today`} />
                <KPI label="Total Reviews"      value={analytics?.total_reviews ?? 0}            icon="⭐" color="#F59E0B" />
                <KPI label="Pending Reviews"    value={analytics?.pending_reviews ?? 0}          icon="⏳" color="#F43F5E" />
                <KPI label="Submissions"        value={stats?.total_submissions ?? 0}            icon="💻" color="#06B6D4" />
                <KPI label="AI Chats"           value={stats?.total_chat_messages ?? 0}          icon="💬" color="#A78BFA" />
                <KPI label="Pro Users"          value={stats?.pro_users ?? 0}                    icon="👑" color="#FFD700" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
                {[
                  { title: "📈 User Growth (14 Days)", chart: "area" },
                  { title: "⚡ Platform Pulse (14 Days)", chart: "bar" },
                ].map(({ title, chart }) => (
                  <div key={title} className="glass-card" style={{ padding: 24, height: 280 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>{title}</h3>
                    <ResponsiveContainer width="100%" height="85%">
                      {chart === "area" ? (
                        <AreaChart data={analytics?.growth || []}>
                          <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
                          <XAxis dataKey="date" hide /><Tooltip contentStyle={{ background: "rgba(8,8,16,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                          <Area type="monotone" dataKey="signups" stroke="#8B5CF6" fill="url(#g1)" strokeWidth={2} />
                        </AreaChart>
                      ) : (
                        <BarChart data={analytics?.growth || []}>
                          <XAxis dataKey="date" hide /><Tooltip contentStyle={{ background: "rgba(8,8,16,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                          <Bar dataKey="actions" fill="#10B981" radius={[4,4,0,0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ))}

                <div className="glass-card" style={{ padding: 24, height: 240, display: "flex", gap: 32, alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>🔵 User Segmentation</h3>
                    <div style={{ width: 140, height: 140 }}>
                      <ResponsiveContainer>
                        <PieChart><Pie data={analytics?.segmentation || []} innerRadius={42} outerRadius={65} paddingAngle={4} dataKey="value">
                          {(analytics?.segmentation || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie><Tooltip contentStyle={{ background: "rgba(8,8,16,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} /></PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analytics?.segmentation?.map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{s.name}</span>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>🏆 Top 5 Users</h3>
                  {leaderboard.slice(0, 5).map((u, i) => (
                    <motion.div key={u.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ fontWeight: 900, fontSize: 18, color: rankColor(u.rank), minWidth: 28 }}>
                        {u.rank <= 3 ? ["🥇","🥈","🥉"][u.rank-1] : `#${u.rank}`}
                      </span>
                      <Avatar name={u.name} pro={u.is_pro} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name || "—"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.xp.toLocaleString()} XP · Lv {u.level}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── METRICS / RETENTION ── */}
          {tab === "metrics" && (
            <motion.div key="metrics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Usage & Retention Metrics</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>In-depth insights into user stickiness and activity patterns</p>
                </div>
              </div>

              {!retention || !heatmap ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)", fontSize: 13 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", margin: "0 auto 16px" }} />
                  Running retention analysis...
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                  
                  {/* Retention KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
                    <KPI label="D1 Retention"   value={`${retention.d1_retention}%`}  icon="⏳" color="#8B5CF6" />
                    <KPI label="D7 Retention"   value={`${retention.d7_retention}%`}  icon="🗓️" color="#3B82F6" />
                    <KPI label="D30 Retention"  value={`${retention.d30_retention}%`} icon="📅" color="#F43F5E" />
                    <KPI label="DAU / MAU"      value={`${retention.dau_mau_ratio}%`} icon="🔥" color="#F59E0B" />
                    <div className="glass-card premium-glow" style={{ padding: "22px 24px", borderTop: "2px solid #10B981" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>Active Users</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#10B981", marginTop: 4 }}>{retention.active_7d} <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>(7D)</span></div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>vs {retention.active_30d} (30D)</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    {/* Weekly Cohorts Table */}
                    <div className="glass-card" style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🗓️ Weekly Cohort Retention</h3>
                      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                            <tr>
                              <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Cohort Week</th>
                              <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Users</th>
                              <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Retained</th>
                              <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {retention.weekly_retention.map((w, i) => (
                              <tr key={i} style={{ borderBottom: i < retention.weekly_retention.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                                <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}>{w.week}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, textAlign: "right", color: "var(--text-secondary)" }}>{w.cohort_size}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, textAlign: "right", color: "#10B981", fontWeight: 700 }}>{w.retained}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, textAlign: "right", fontWeight: 800, color: w.rate > 40 ? "#10B981" : w.rate > 20 ? "#F59E0B" : "#F43F5E" }}>{w.rate}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Live Users List */}
                    <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, background: "#10B981", borderRadius: "50%", boxShadow: "0 0 8px #10B981" }} />
                        Online Now ({liveUsers?.online_now || 0})
                      </h3>
                      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                        {liveUsers?.online_users?.length === 0 ? (
                          <div style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No users active in last 5 mins</div>
                        ) : liveUsers?.online_users?.map(u => (
                          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                            <Avatar name={u.name} pro={false} />
                            <div style={{ flex: 1, overflow: "hidden" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{u.name || "—"}</div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{u.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>📡 Server Activity Heatmap</h3>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Interaction frequency mapped by Day and Hour (UTC)</p>
                    <div style={{ display: "flex" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 8, paddingTop: 16 }}>
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <div key={d} style={{ fontSize: 10, height: 16, color: "var(--text-muted)", lineHeight: "16px", textAlign: "right" }}>{d}</div>)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 4, marginBottom: 4 }}>
                          {Array.from({length:24}).map((_,h) => <div key={h} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "var(--text-muted)" }}>{h%4===0 ? `${h}h` : ""}</div>)}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {Array.from({length:7}).map((_,d) => (
                            <div key={d} style={{ display: "flex", gap: 4 }}>
                              {Array.from({length:24}).map((_,h) => {
                                const cell = heatmap.matrix.find(x => x.day_index === d && x.hour === h);
                                const max = heatmap.peak?.count || 1;
                                const alpha = cell ? Math.max(0.05, cell.count / max) : 0.05;
                                return (
                                  <div key={h} title={`${cell?.count || 0} activities`}
                                    style={{ flex: 1, height: 16, borderRadius: 3, background: `rgba(139,92,246,${alpha})`, border: alpha > 0.05 ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.03)" }} />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>User Management</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{users.length} total users {selectedUsers.size > 0 && <span style={{ color: "#8B5CF6", fontWeight: 700 }}>· {selectedUsers.size} selected</span>}</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search users…"
                    style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, width: 200, outline: "none" }} />
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 13, cursor: "pointer" }}>
                    <option value="xp">Sort: XP</option>
                    <option value="created_at">Sort: Join Date</option>
                    <option value="last_seen">Sort: Last Seen</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Bar */}
              <AnimatePresence>
                {selectedUsers.size > 0 && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: "flex", gap: 10, marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA" }}>⚡ Bulk Actions ({selectedUsers.size} users):</span>
                    {[["grant_pro", "👑 Grant PRO", "#A78BFA"], ["revoke_pro", "🚫 Revoke PRO", "#F59E0B"], ["enable", "✅ Enable All", "#10B981"], ["disable", "🚫 Disable All", "#F43F5E"]].map(([action, label, color]) => (
                      <button key={action} onClick={() => runBulkAction(action)} disabled={bulkLoading}
                        style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${color}40`, background: `${color}15`, color, fontSize: 11, cursor: "pointer", fontWeight: 700, opacity: bulkLoading ? 0.5 : 1 }}>
                        {label}
                      </button>
                    ))}
                    <button onClick={() => setSelectedUsers(new Set())} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>Clear</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1060 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={TH}><input type="checkbox" onChange={e => setSelectedUsers(e.target.checked ? new Set(filteredUsers.filter(u => u.email !== user?.email).map(u => u.id)) : new Set())} checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.filter(u => u.email !== user?.email).length} /></th>
                        {["User", "XP / Level", "Streak 🔥", "Pro", "Status", "Joined", "Last Seen", "Actions"].map(h => (
                          <th key={h} style={TH}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={9} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No users found</td></tr>
                      ) : filteredUsers.map((u, idx) => (
                        <TR key={u.id} delay={Math.min(idx * 0.025, 0.4)}>
                          <td style={{ ...TD, width: 40 }}>
                            {u.email !== user?.email && (
                              <input type="checkbox" checked={selectedUsers.has(u.id)}
                                onChange={e => setSelectedUsers(prev => { const n = new Set(prev); e.target.checked ? n.add(u.id) : n.delete(u.id); return n; })} />
                            )}
                          </td>
                          <td style={TD}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar name={u.name || u.email} pro={u.is_pro} />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name || "—"}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={TD}>
                            <div style={{ fontWeight: 800, color: "#8B5CF6", fontSize: 14 }}>{(u.xp || 0).toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Level {u.level || 1}</div>
                          </td>
                          <td style={{ ...TD, textAlign: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: 16, color: u.streak > 0 ? "#F59E0B" : "var(--text-muted)" }}>{u.streak || 0}🔥</div>
                          </td>
                          <td style={{ ...TD, textAlign: "center" }}>
                            {u.is_pro
                              ? <span style={{ fontSize: 10, background: "rgba(139,92,246,0.15)", color: "#A78BFA", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>👑 PRO</span>
                              : <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>—</span>}
                          </td>
                          <td style={TD}>
                            <span className={`badge ${u.is_active ? "badge-green" : "badge-pink"}`} style={{ fontSize: 10 }}>
                              {u.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td style={{ ...TD, color: "var(--text-muted)", fontSize: 12 }}>{fmt(u.created_at)}</td>
                          <td style={{ ...TD, color: "var(--text-muted)", fontSize: 12 }}>{fmtDT(u.last_seen)}</td>
                          <td style={TD}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => openAiProfile(u.id)}
                                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "#A78BFA", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                                ✨ AI
                              </button>
                              {u.email !== user?.email && (
                                <button onClick={() => toggleUser(u.id, u.is_active)}
                                  style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${u.is_active ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"}`, background: u.is_active ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)", color: u.is_active ? "#F43F5E" : "#10B981", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                                  {u.is_active ? "Disable" : "Enable"}
                                </button>
                              )}
                            </div>
                          </td>
                        </TR>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REVIEWS ── */}
          {tab === "reviews" && (() => {
            const pendingList = reviews.filter(r => !r.is_approved);
            const approvedList = reviews.filter(r => r.is_approved);
            const currentList = activeReviewTab === "pending" ? pendingList : approvedList;

            return (
              <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Review Management</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{reviews.length} total reviews</p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <button onClick={() => setActiveReviewTab("pending")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: activeReviewTab === "pending" ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)", color: activeReviewTab === "pending" ? "#A78BFA" : "var(--text-muted)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "0.2s" }}>
                    Pending ({pendingList.length})
                  </button>
                  <button onClick={() => setActiveReviewTab("approved")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: activeReviewTab === "approved" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", color: activeReviewTab === "approved" ? "#10B981" : "var(--text-muted)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "0.2s" }}>
                    Approved ({approvedList.length})
                  </button>
                </div>

                <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          {["Reviewer", "Rating", "Review", "Date", "Actions"].map(h => <th key={h} style={TH}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {currentList.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No {activeReviewTab} reviews found.</td></tr>
                        ) : currentList.map((r, i) => (
                          <TR key={r.id} delay={i * 0.03} featured={r.is_featured}>
                            <td style={TD}>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                              <div style={{ fontSize: 11, color: "var(--brand-primary)" }}>{r.role || "Community"}</div>
                              {r.is_featured && <span style={{ fontSize: 9, background: "rgba(255,215,0,0.15)", color: "#FFD700", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>⭐ FEATURED</span>}
                            </td>
                            <td style={TD}>
                              <div style={{ display: "flex", gap: 2 }}>
                                {Array.from({ length: 5 }, (_, idx) => <span key={idx} style={{ color: idx < r.rating ? "#FFD93D" : "rgba(255,255,255,0.12)", fontSize: 14 }}>★</span>)}
                              </div>
                            </td>
                            <td style={{ ...TD, maxWidth: 320 }}>
                              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.review}</p>
                            </td>
                            <td style={{ ...TD, color: "var(--text-muted)", fontSize: 12 }}>{fmt(r.created_at)}</td>
                            <td style={TD}>
                              <div style={{ display: "flex", gap: 6 }}>
                                {activeReviewTab === "pending" ? (
                                  <button onClick={() => approveReview(r.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                                    Approve
                                  </button>
                                ) : null}
                                {activeReviewTab === "approved" ? (
                                  <button onClick={() => featureReview(r.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.08)", color: "#FFD700", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                                    {r.is_featured ? "Unstar" : "Feature"}
                                  </button>
                                ) : null}
                                <button onClick={() => deleteReview(r.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#F43F5E", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>Delete</button>
                              </div>
                            </td>
                          </TR>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── ACTIVITY ── */}
          {tab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Live Activity Feed</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{activity.length} events · refreshes every 30s</p>
                </div>
                <button onClick={() => { setLoading(true); load(); }} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>🔄 Refresh</button>
              </div>

              <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                    <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["User", "Action", "Details", "+XP", "Time"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                      {activity.map((a, i) => {
                        const ac = a.action_type;
                        const cls = ac.includes("login") ? "badge-green" : ac.includes("register") ? "badge-pink" : ac.includes("chat") ? "badge-purple" : ac.includes("code") || ac.includes("solved") ? "badge-blue" : "badge-yellow";
                        return (
                          <TR key={a.id} delay={Math.min(i * 0.02, 0.4)}>
                            <td style={TD}><div style={{ fontWeight: 700, fontSize: 13 }}>{a.user_name}</div><div style={{ fontSize: 11, color: "var(--brand-secondary)" }}>{a.user_email}</div></td>
                            <td style={TD}><span className={`badge ${cls}`} style={{ fontSize: 9 }}>{a.action_type.replace(/_/g, " ").toUpperCase()}</span></td>
                            <td style={{ ...TD, maxWidth: 260 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title || "—"}</div>
                              {a.metadata && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.metadata}</div>}
                            </td>
                            <td style={TD}>{a.xp > 0 ? <span style={{ color: "#10B981", fontWeight: 800 }}>+{a.xp}</span> : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}</td>
                            <td style={{ ...TD, color: "var(--text-muted)", fontSize: 12 }}>{fmtDT(a.created_at)}</td>
                          </TR>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── LEADERBOARD ── */}
          {tab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Global Leaderboard</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>{leaderboard.length} ranked users</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leaderboard.map((u, i) => (
                  <motion.div key={u.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5), type: "spring", stiffness: 280, damping: 22 }}
                    className="glass-card"
                    style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, background: rankBg(u.rank), borderColor: u.rank <= 3 ? rankColor(u.rank) + "30" : "var(--border)", transition: "transform 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)"}>
                    <div style={{ width: 48, textAlign: "center", fontWeight: 900, fontSize: u.rank <= 3 ? 26 : 16, color: rankColor(u.rank), fontFamily: "var(--font-outfit)" }}>
                      {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
                    </div>
                    <Avatar name={u.name} pro={u.is_pro} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
                        {u.name || "—"}
                        {u.is_pro && <span style={{ fontSize: 9, background: "rgba(139,92,246,0.2)", color: "#A78BFA", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>PRO 👑</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 20, color: rankColor(u.rank), fontFamily: "var(--font-outfit)" }}>{u.xp.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>XP · Lv {u.level} · {u.streak}🔥</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CODE ANALYTICS ── */}
          {tab === "code" && (
            <motion.div key="code" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Code Analytics</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>Submission insights and top solvers</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
                <KPI label="Total Submissions"  value={codeAnalytics?.total_submissions ?? 0}       icon="📤" color="#8B5CF6" />
                <KPI label="Accepted"           value={codeAnalytics?.accepted_count ?? 0}          icon="✅" color="#10B981" />
                <KPI label="Acceptance Rate"    value={`${codeAnalytics?.acceptance_rate ?? 0}%`}  icon="📊" color="#06B6D4" />
                <KPI label="Problems Available" value={codeAnalytics?.total_problems_available ?? 0} icon="🧩" color="#F59E0B" />
                <KPI label="Unique Solvers"     value={codeAnalytics?.unique_solvers ?? 0}          icon="👨‍💻" color="#F43F5E" />
              </div>
              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>🏆 Top Solvers</h3></div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["#", "User", "Problems Solved", "XP"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {codeAnalytics?.top_solvers?.map((s, i) => (
                      <TR key={i} delay={i * 0.04}>
                        <td style={{ ...TD, fontWeight: 900, color: rankColor(i+1), fontSize: 18 }}>{i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</td>
                        <td style={TD}><div style={{ fontWeight: 700 }}>{s.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.email}</div></td>
                        <td style={{ ...TD, fontWeight: 800, color: "#10B981", fontSize: 20 }}>{s.solved_count}</td>
                        <td style={{ ...TD, color: "#8B5CF6", fontWeight: 700 }}>{s.xp.toLocaleString()}</td>
                      </TR>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── CHAT ANALYTICS ── */}
          {tab === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Chat Analytics</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>AI conversation insights</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
                <KPI label="Total Messages"  value={chatAnalytics?.total_messages ?? 0}    icon="💬" color="#8B5CF6" />
                <KPI label="User Messages"   value={chatAnalytics?.user_messages ?? 0}     icon="👤" color="#06B6D4" />
                <KPI label="AI Responses"    value={chatAnalytics?.ai_messages ?? 0}       icon="🤖" color="#10B981" />
                <KPI label="Active (7 Days)" value={chatAnalytics?.active_users_7d ?? 0}   icon="📅" color="#F59E0B" />
                <KPI label="Active (24h)"    value={chatAnalytics?.active_users_24h ?? 0}  icon="⚡" color="#F43F5E" />
              </div>
              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>🕐 Recent Conversations</h3></div>
                {chatAnalytics?.last_conversations?.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", gap: 14 }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                    <Avatar name={c.user_name} pro={false} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{c.user_name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.user_email}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{fmtDT(c.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-secondary)", marginBottom: 4 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.last_message}</div>
                    </div>
                  </motion.div>
                ))}
                {!chatAnalytics?.last_conversations?.length && <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>No conversations yet</div>}
              </div>
            </motion.div>
          )}

          {/* ── HACKATHONS ── */}
          {tab === "hackathons" && (
            <motion.div key="hackathons" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Hackathon Management</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{hackathons.length} in database</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={seedHackathons} disabled={actionLoading === "seedH"}
                    style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: 12, cursor: actionLoading === "seedH" ? "not-allowed" : "pointer", fontWeight: 700 }}>
                    {actionLoading === "seedH" ? "⏳ Seeding…" : "🌱 Seed Hackathons"}
                  </button>
                </div>
              </div>

              <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                    <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["Hackathon", "Organizer", "Status", "Deadline", "Prize Pool", "Mode", "Action"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                    <tbody>
                      {hackathons.map((h, i) => (
                        <TR key={h.id} delay={Math.min(i * 0.025, 0.5)}>
                          <td style={TD}><div style={{ fontWeight: 700, fontSize: 13 }}>{h.title || h.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>#{h.id}</div></td>
                          <td style={{ ...TD, color: "var(--text-secondary)" }}>{h.organizer}</td>
                          <td style={TD}><StatusBadge s={h.status} /></td>
                          <td style={{ ...TD, color: "var(--text-muted)", fontSize: 12 }}>{h.deadline}</td>
                          <td style={{ ...TD, color: "#10B981", fontWeight: 700 }}>{(h as any).prize_pool || h.prize || "TBD"}</td>
                          <td style={{ ...TD, fontSize: 12 }}>{(h as any).mode || "Online"}</td>
                          <td style={TD}>
                            <button onClick={() => deleteHackathon(h.id)}
                              style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#F43F5E", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Delete</button>
                          </td>
                        </TR>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REVENUE ── */}
          {tab === "revenue" && (
            <motion.div key="revenue" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Revenue & Finance</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>Pro subscriptions, MRR, and payment analytics</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 16, marginBottom: 32 }}>
                <KPI label="Pro Users" value={revenue?.total_pro_users ?? 0} icon="👑" color="#A78BFA" />
                <KPI label="Paying Subs" value={revenue?.paying_subscribers ?? 0} icon="💳" color="#10B981" />
                <KPI label="MRR (INR)" value={`₹${(revenue?.mrr_inr ?? 0).toLocaleString()}`} icon="💰" color="#F59E0B" />
                <KPI label="ARR (INR)" value={`₹${(revenue?.arr_inr ?? 0).toLocaleString()}`} icon="📈" color="#06B6D4" />
                <KPI label="Conversion" value={`${revenue?.conversion_rate ?? 0}%`} icon="🎯" color="#F43F5E" />
                <KPI label="Via Referral" value={revenue?.referral_pro ?? 0} icon="🔗" color="#8B5CF6" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div className="glass-card" style={{ padding: 24, height: 280 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>📅 Monthly Pro Growth</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={revenue?.monthly_chart || []}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <Tooltip contentStyle={{ background: "rgba(8,8,16,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="new_pro" fill="#A78BFA" name="New Pro" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass-card" style={{ padding: 24, height: 280 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>💵 Monthly Revenue (INR)</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={revenue?.monthly_chart || []}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                      <Tooltip contentStyle={{ background: "rgba(8,8,16,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="revenue_inr" fill="#10B981" name="Revenue INR" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}><h3 style={{ fontSize: 15, fontWeight: 700 }}>🆕 Recent Pro Activations</h3></div>
                {revenue?.recent_pro_activations?.map((a, i) => (
                  <div key={i} style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 14 }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                    <Avatar name={a.name} pro />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.email}</div>
                    </div>
                    {a.via_referral && <span style={{ fontSize: 9, background: "rgba(139,92,246,0.15)", color: "#A78BFA", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>🔗 Referral</span>}
                    <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>👑 PRO</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmt(a.created_at)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SYSTEM HEALTH ── */}
          {tab === "health" && (
            <motion.div key="health" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>System Health</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Live infrastructure and AI model status</p>
                </div>
                <button onClick={loadHealth} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>🔄 Refresh</button>
              </div>

              {health ? (
                <>
                  {/* Status banner */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "16px 24px", borderRadius: 14, marginBottom: 28, background: health.status === "operational" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", border: `1px solid ${health.status === "operational" ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: health.status === "operational" ? "#10B981" : "#F43F5E", boxShadow: `0 0 10px ${health.status === "operational" ? "#10B981" : "#F43F5E"}` }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: health.status === "operational" ? "#10B981" : "#F43F5E" }}>
                      {health.status === "operational" ? "✅ All Systems Operational" : "⚠️ Degraded Performance Detected"}
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>Response: {health.server.response_time_ms}ms · Python {health.server.python_version}</span>
                  </motion.div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                    {/* DB Stats */}
                    <div className="glass-card" style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20, display: "flex", gap: 8, alignItems: "center" }}>
                        <span>🗄️ Database</span>
                        <span className={`badge ${health.database.status === "healthy" ? "badge-green" : "badge-pink"}`} style={{ fontSize: 9 }}>{health.database.status.toUpperCase()}</span>
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {[
                          { label: "Latency", value: `${health.database.latency_ms}ms`, color: health.database.latency_ms < 100 ? "#10B981" : "#F59E0B" },
                          { label: "Size", value: health.database.size_label, color: "#06B6D4" },
                        ].map(s => (
                          <div key={s.label} style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginTop: 4 }}>{s.value}</div>
                          </div>
                        ))}
                      </div>
                      {Object.entries(health.database.table_stats || {}).map(([table, count]) => (
                        <div key={table} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
                          <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{table.replace("_", " ")}</span>
                          <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>{(count as number).toLocaleString()} rows</span>
                        </div>
                      ))}
                    </div>

                    {/* AI Models */}
                    <div className="glass-card" style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>🤖 AI Model Status</h3>
                      {Object.entries(health.ai_models || {}).map(([name, m]: [string, any]) => (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.available ? "#10B981" : "rgba(255,255,255,0.2)", boxShadow: m.available ? "0 0 8px #10B981" : "none", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{name}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.model}</div>
                          </div>
                          <span className={`badge ${m.available ? "badge-green" : "badge-pink"}`} style={{ fontSize: 9 }}>{m.status.replace("_", " ").toUpperCase()}</span>
                        </div>
                      ))}
                      <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: 20, marginBottom: 12 }}>⚙️ Features</h3>
                      {Object.entries(health.features || {}).map(([feat, on]: [string, any]) => (
                        <div key={feat} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ color: "var(--text-muted)", textTransform: "capitalize" }}>{feat.replace("_", " ")}</span>
                          <span style={{ color: on ? "#10B981" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{on ? "✅ Active" : "❌ Off"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", margin: "0 auto 16px" }} />
                  Loading system health...
                </div>
              )}
            </motion.div>
          )}

          {/* ── ADMIN TOOLS ── */}
          {tab === "tools" && (
            <motion.div key="tools" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>🛠️ Admin Tools</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>Power tools for platform management</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

                {/* XP Editor */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, display: "flex", gap: 8 }}>⚡ XP Editor</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Manually add or remove XP from any user. Select a user from the Users tab using the ✨ AI button area.</p>
                  <div style={{ padding: "14px 16px", background: "rgba(139,92,246,0.06)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "#A78BFA", marginBottom: 8, fontWeight: 700 }}>Quick XP Edit — Search User</div>
                    <input placeholder="Search user by name..." list="user-list-dl"
                      id="xp-user-search"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, outline: "none", marginBottom: 8 }}
                      onChange={e => {
                        const found = users.find(u => u.name?.toLowerCase() === e.target.value.toLowerCase() || u.email?.toLowerCase() === e.target.value.toLowerCase());
                        if (found) setXpModal({ open: true, user: found });
                      }} />
                    <datalist id="user-list-dl">
                      {users.map(u => <option key={u.id} value={u.name || u.email} />)}
                    </datalist>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    {[-500, -100, +100, +500].map(v => (
                      <button key={v} onClick={() => { const u = users[0]; if (u) setXpModal({ open: true, user: u }); setXpDelta(String(v)); }}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${v < 0 ? "rgba(244,63,94,0.3)" : "rgba(139,92,246,0.3)"}`, background: v < 0 ? "rgba(244,63,94,0.08)" : "rgba(139,92,246,0.08)", color: v < 0 ? "#F43F5E" : "#A78BFA", fontSize: 11, cursor: "pointer", fontWeight: 800 }}>
                        {v > 0 ? "+" : ""}{v}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>💡 Click ✨ AI button on any user in the Users tab, then use the XP editor from there.</p>
                </div>

                {/* CSV Export */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>📊 Data Export</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Export platform data as CSV files for analysis, reporting, or backups.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <button onClick={downloadCSV}
                      style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: 13, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                      ⬇️ Export All Users (CSV)
                    </button>
                    <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
                      Includes: ID, Name, Email, Role, XP, Level, Streak, Pro Status, Join Date, Last Seen
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#A78BFA" }}>{users.length}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Total Users</div>
                      </div>
                      <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#10B981" }}>{users.filter(u => u.is_pro).length}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Pro Users</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcements */}
                <div className="glass-card" style={{ padding: 24, gridColumn: "1 / -1" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>📢 Global Announcements</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Create platform-wide banners visible to all logged-in users.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, marginBottom: 16 }}>
                    <input value={annMessage} onChange={e => setAnnMessage(e.target.value)} placeholder="Enter announcement message..."
                      style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, outline: "none" }} />
                    <select value={annType} onChange={e => setAnnType(e.target.value)}
                      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 12, cursor: "pointer" }}>
                      <option value="info">ℹ️ Info</option>
                      <option value="success">✅ Success</option>
                      <option value="warning">⚠️ Warning</option>
                      <option value="error">🚨 Alert</option>
                    </select>
                    <select value={annExpiry} onChange={e => setAnnExpiry(Number(e.target.value))}
                      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 12, cursor: "pointer" }}>
                      <option value={1}>1h</option>
                      <option value={6}>6h</option>
                      <option value={24}>24h</option>
                      <option value={72}>3 days</option>
                      <option value={0}>Never</option>
                    </select>
                    <button onClick={createAnnouncement} disabled={annLoading}
                      style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.4)", background: "rgba(139,92,246,0.15)", color: "#A78BFA", fontSize: 12, cursor: "pointer", fontWeight: 700, opacity: annLoading ? 0.6 : 1 }}>
                      {annLoading ? "Sending..." : "📢 Broadcast"}
                    </button>
                  </div>
                  {announcements.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No active announcements</div>
                  ) : announcements.map(a => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, marginBottom: 8,
                        background: a.type === "success" ? "rgba(16,185,129,0.08)" : a.type === "warning" ? "rgba(245,158,11,0.08)" : a.type === "error" ? "rgba(244,63,94,0.08)" : "rgba(6,182,212,0.08)",
                        border: `1px solid ${a.type === "success" ? "rgba(16,185,129,0.2)" : a.type === "warning" ? "rgba(245,158,11,0.2)" : a.type === "error" ? "rgba(244,63,94,0.2)" : "rgba(6,182,212,0.2)"}` }}>
                      <span style={{ fontSize: 16 }}>{a.type === "success" ? "✅" : a.type === "warning" ? "⚠️" : a.type === "error" ? "🚨" : "ℹ️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.message}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>#{a.id} · Expires: {a.expires_at ? fmt(a.expires_at) : "Never"}</div>
                      </div>
                      <button onClick={() => deleteAnnouncement(a.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#F43F5E", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>Delete</button>
                    </motion.div>
                  ))}
                </div>

                {/* Invite Code Generator */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>🔑 Invite Code Generator</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Generate unique invite codes for campaigns, partnerships, and beta testers.</p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                    <input type="number" min={1} max={50} value={inviteCount} onChange={e => setInviteCount(Number(e.target.value))}
                      style={{ width: 70, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, outline: "none" }} />
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                      <input type="checkbox" checked={inviteGrantsPro} onChange={e => setInviteGrantsPro(e.target.checked)} />
                      <span style={{ color: "#A78BFA", fontWeight: 700 }}>👑 PRO Codes</span>
                    </label>
                    <button onClick={generateInviteCodes} disabled={inviteLoading}
                      style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "#A78BFA", fontSize: 12, cursor: "pointer", fontWeight: 700, opacity: inviteLoading ? 0.6 : 1 }}>
                      {inviteLoading ? "Generating..." : "⚡ Generate"}
                    </button>
                    {inviteCodes.length > 0 && (
                      <button onClick={copyAllCodes} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>📋 Copy All</button>
                    )}
                  </div>
                  {inviteCodes.length > 0 && (
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 12, maxHeight: 200, overflowY: "auto", border: "1px solid var(--border)" }}>
                      {inviteCodes.map((code, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < inviteCodes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                          <code style={{ fontSize: 12, color: inviteGrantsPro ? "#A78BFA" : "#06B6D4", fontFamily: "monospace", letterSpacing: 1 }}>{code}</code>
                          <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }}
                            style={{ padding: "2px 8px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)", fontSize: 10, cursor: "pointer" }}>Copy</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invite Code Stats */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>📈 Referral Stats</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#A78BFA" }}>{inviteStats?.total_referred_users ?? 0}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Referred Users</div>
                    </div>
                    <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#06B6D4" }}>{inviteStats?.unique_codes_used ?? 0}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Unique Codes Used</div>
                    </div>
                  </div>
                  {inviteStats?.top_codes?.length ? (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Top Codes</div>
                      {inviteStats.top_codes.slice(0, 8).map(c => (
                        <div key={c.code} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
                          <code style={{ color: "#A78BFA", fontFamily: "monospace" }}>{c.code}</code>
                          <span style={{ color: "#10B981", fontWeight: 700 }}>{c.users} user{c.users !== 1 ? "s" : ""}</span>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No referrals yet</div>}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── XP EDITOR MODAL ── */}
      <AnimatePresence>
        {xpModal.open && xpModal.user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setXpModal({ open: false, user: null })}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: 420, background: "rgba(8,8,18,0.97)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 20, padding: 28, boxShadow: "0 0 60px rgba(245,158,11,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>⚡ XP Editor</div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>{xpModal.user.name || xpModal.user.email}</div>
                  <div style={{ fontSize: 12, color: "#A78BFA" }}>Current XP: {(xpModal.user.xp || 0).toLocaleString()} · Level {xpModal.user.level}</div>
                </div>
                <button onClick={() => setXpModal({ open: false, user: null })} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "white", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 6 }}>XP DELTA (+ to add, − to subtract)</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {[-500, -100, +100, +500].map(v => (
                    <button key={v} onClick={() => setXpDelta(String(v))} style={{ flex: 1, padding: "6px 0", borderRadius: 7, border: `1px solid ${v < 0 ? "rgba(244,63,94,0.3)" : "rgba(139,92,246,0.3)"}`, background: xpDelta === String(v) ? (v < 0 ? "rgba(244,63,94,0.2)" : "rgba(139,92,246,0.2)") : "transparent", color: v < 0 ? "#F43F5E" : "#A78BFA", fontSize: 11, cursor: "pointer", fontWeight: 800, transition: "all 0.15s" }}>
                      {v > 0 ? "+" : ""}{v}
                    </button>
                  ))}
                </div>
                <input type="number" value={xpDelta} onChange={e => setXpDelta(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 14, outline: "none", fontWeight: 700, textAlign: "center" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 6 }}>REASON</label>
                <input value={xpReason} onChange={e => setXpReason(e.target.value)} placeholder="Reason for XP adjustment..."
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setXpModal({ open: false, user: null })}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={submitXpEdit} disabled={xpLoading}
                  style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 800, opacity: xpLoading ? 0.7 : 1 }}>
                  {xpLoading ? "Applying..." : `⚡ Apply ${parseInt(xpDelta) > 0 ? "+" : ""}${xpDelta} XP`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI PROFILE MODAL ── */}
      <AnimatePresence>
        {aiModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAiModal({ open: false, data: null, loading: false })}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "90%", maxWidth: 580, maxHeight: "85vh", overflowY: "auto", background: "rgba(8,8,18,0.97)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 20, padding: 32, boxShadow: "0 0 80px rgba(139,92,246,0.3)" }}>
              {aiModal.loading ? (
                <div style={{ textAlign: "center", padding: 48 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 48, height: 48, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", margin: "0 auto 16px" }} />
                  <div style={{ color: "#A78BFA", fontWeight: 700, fontSize: 14 }}>✨ AI is analyzing this user...</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>Scanning activity patterns, XP history, and behavior signals</div>
                </div>
              ) : aiModal.data ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "#A78BFA", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>✨ AI User Profile</div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{aiModal.data.name || aiModal.data.email}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { if (aiModal.data) { const u = users.find(x => x.id === aiModal.data!.user_id); if (u) setXpModal({ open: true, user: u }); }}}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)", color: "#F59E0B", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>⚡ Edit XP</button>
                      <button onClick={() => setAiModal({ open: false, data: null, loading: false })} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "white", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "Engagement", value: aiModal.data.ai_profile.engagement_level, color: aiModal.data.ai_profile.engagement_level === "High" ? "#10B981" : aiModal.data.ai_profile.engagement_level === "Low" ? "#F43F5E" : "#F59E0B" },
                      { label: "Churn Risk", value: aiModal.data.ai_profile.churn_risk, color: aiModal.data.ai_profile.churn_risk === "Low" ? "#10B981" : aiModal.data.ai_profile.churn_risk === "High" || aiModal.data.ai_profile.churn_risk === "Critical" ? "#F43F5E" : "#F59E0B" },
                      { label: "User Type", value: aiModal.data.ai_profile.user_type, color: "#A78BFA" },
                    ].map(s => (
                      <div key={s.label} style={{ padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20, padding: "16px", background: "rgba(139,92,246,0.06)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.15)" }}>{aiModal.data.ai_profile.summary}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {[
                      { title: "💪 Strengths", items: aiModal.data.ai_profile.strengths, color: "#10B981" },
                      { title: "⚠️ Weaknesses", items: aiModal.data.ai_profile.weaknesses, color: "#F59E0B" },
                    ].map(({ title, items, color }) => (
                      <div key={title}>
                        <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
                        {items.map((s, i) => <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>• {s}</div>)}
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: "#06B6D4", fontWeight: 700, marginBottom: 4 }}>💡 ADMIN RECOMMENDATION</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{aiModal.data.ai_profile.admin_recommendation}</div>
                  </div>
                  {aiModal.data.fallback && <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>⚠️ AI unavailable — rule-based fallback used</div>}
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
