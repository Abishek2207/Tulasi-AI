"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { TulasiLogo } from "@/components/TulasiLogo";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import toast from "react-hot-toast";
import {
  adminApi, Stats, AdminUser, Review, Activity, LeaderboardEntry,
  CodeAnalytics, ChatAnalytics, Analytics, Hackathon
} from "@/lib/api";

type Tab = "overview" | "users" | "reviews" | "activity" | "leaderboard" | "code" | "chat" | "hackathons";

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
  { id: "users",       label: "Users",          icon: "👥" },
  { id: "reviews",     label: "Reviews",        icon: "⭐" },
  { id: "activity",    label: "Activity",       icon: "📡" },
  { id: "leaderboard", label: "Leaderboard",    icon: "🏆" },
  { id: "code",        label: "Code Analytics", icon: "💻" },
  { id: "chat",        label: "Chat Analytics", icon: "💬" },
  { id: "hackathons",  label: "Hackathons",     icon: "🚀" },
];

const rankColor = (r: number) => r === 1 ? "#FFD700" : r === 2 ? "#C0C0C0" : r === 3 ? "#CD7F32" : r <= 10 ? "#8B5CF6" : "var(--text-muted)";
const rankBg = (r: number) => r === 1 ? "linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,165,0,0.06))" : r === 2 ? "linear-gradient(135deg,rgba(192,192,192,0.10),rgba(148,163,184,0.05))" : r === 3 ? "linear-gradient(135deg,rgba(205,127,50,0.10),rgba(184,115,51,0.04))" : r <= 10 ? "rgba(124,58,237,0.05)" : "transparent";

const TH: React.CSSProperties = { padding: "14px 20px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "14px 20px", fontSize: 13 };

const rowHover = (el: HTMLElement, on: boolean, featured = false) => {
  el.style.background = on ? (featured ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.025)") : (featured ? "rgba(255,215,0,0.03)" : "transparent");
};

const KPI = ({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub?: string }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className="glass-card" style={{ padding: "22px 24px", borderTop: `3px solid ${color}`, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", right: 16, top: 16, fontSize: 28, opacity: 0.12 }}>{icon}</div>
    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>{icon} {label}</div>
    <div style={{ fontSize: 38, fontWeight: 900, fontFamily: "var(--font-outfit)", color, letterSpacing: "-1.5px", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{sub}</div>}
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [codeAnalytics, setCodeAnalytics] = useState<CodeAnalytics | null>(null);
  const [chatAnalytics, setChatAnalytics] = useState<ChatAnalytics | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "created_at" | "last_seen">("xp");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated" && user?.role !== "admin") router.push("/dashboard");
  }, [status, user, router]);

  const load = useCallback(async () => {
    try {
      const [u, r, s, a, lb, ca, cha, hk, an] = await Promise.allSettled([
        adminApi.users(), adminApi.reviews(), adminApi.stats(), adminApi.activity(),
        adminApi.leaderboard(), adminApi.code(), adminApi.chat(), adminApi.hackathons(), adminApi.analytics(),
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
    } catch (e) { console.error("[Admin] Load error:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const toggleUser = async (id: number, active: boolean) => {
    try { await adminApi.toggleUser(id, !active); setUsers(u => u.map(x => x.id === id ? { ...x, is_active: !active } : x)); }
    catch { toast.error("Failed to toggle user."); }
  };
  const deleteReview = async (id: number) => {
    if (!confirm("Delete this review permanently?")) return;
    try { await adminApi.deleteReview(id); setReviews(r => r.filter(x => x.id !== id)); toast.success("Review deleted."); }
    catch { toast.error("Failed to delete review."); }
  };
  const featureReview = async (id: number) => {
    try { const d = await adminApi.featureReview(id); setReviews(r => r.map(x => x.id === id ? { ...x, is_featured: d.is_featured } : x)); }
    catch { toast.error("Failed to update."); }
  };
  const purgeFake = async () => {
    if (!confirm("This will DELETE all seed/dummy reviews (Alex Chen, Sarah Jenkins etc.) permanently. Continue?")) return;
    setActionLoading("purge");
    try {
      const d = await adminApi.purgeFakeReviews();
      toast.success(d.message);
      await load();
    } catch (e: any) { toast.error(e.message || "Purge failed."); }
    finally { setActionLoading(""); }
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── SIDEBAR ── */}
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ width: 224, background: "rgba(5,5,12,0.7)", backdropFilter: "blur(20px)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
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

        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button onClick={() => { setLoading(true); load(); }} style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            🔄 Refresh Data
          </button>
        </div>
      </motion.div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Platform Overview</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>Live metrics — auto-refreshes every 30s</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 16, marginBottom: 36 }}>
                <KPI label="Total Users"        value={stats?.total_users ?? 0}                  icon="👥" color="#8B5CF6" />
                <KPI label="Active 24h"         value={stats?.active_24h ?? 0}                   icon="⚡" color="#10B981" sub={`${stats?.active_today ?? 0} today`} />
                <KPI label="Reviews"            value={stats?.total_reviews ?? 0}                icon="⭐" color="#F59E0B" />
                <KPI label="Submissions"        value={stats?.total_submissions ?? 0}            icon="💻" color="#06B6D4" />
                <KPI label="Hackathon Signups"  value={stats?.total_hackathon_participants ?? 0} icon="🚀" color="#F43F5E" />
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

          {/* ── USERS ── */}
          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>User Management</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{users.length} total registered users</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
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

              <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 960 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["User", "XP / Level", "Streak 🔥", "Chats Today", "Pro", "Status", "Joined", "Last Seen", "Action"].map(h => (
                          <th key={h} style={TH}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan={9} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No users found</td></tr>
                      ) : filteredUsers.map((u, idx) => (
                        <TR key={u.id} delay={Math.min(idx * 0.025, 0.4)}>
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
                            {u.streak > 0 && <div style={{ fontSize: 10, color: "var(--text-muted)" }}>best: {(u as any).longest_streak || u.streak}</div>}
                          </td>
                          <td style={{ ...TD, textAlign: "center", fontWeight: 700, color: "#06B6D4" }}>{(u as any).chats_today ?? "—"}</td>
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
                            {u.email !== user?.email && (
                              <button onClick={() => toggleUser(u.id, u.is_active)}
                                style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${u.is_active ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"}`, background: u.is_active ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)", color: u.is_active ? "#F43F5E" : "#10B981", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                                {u.is_active ? "Disable" : "Enable"}
                              </button>
                            )}
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
          {tab === "reviews" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Review Management</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{reviews.length} total reviews</p>
                </div>
                <button onClick={purgeFake} disabled={actionLoading === "purge"}
                  style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#F43F5E", fontSize: 12, cursor: actionLoading === "purge" ? "not-allowed" : "pointer", fontWeight: 700 }}>
                  {actionLoading === "purge" ? "⏳ Purging…" : "🗑️ Purge Fake Reviews"}
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
                      {reviews.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No real reviews yet. First one could be yours! 🚀</td></tr>
                      ) : reviews.map((r, i) => (
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
                              <button onClick={() => featureReview(r.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.08)", color: "#FFD700", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                                {r.is_featured ? "Unstar" : "Feature"}
                              </button>
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
          )}

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

        </AnimatePresence>
      </div>
    </div>
  );
}
