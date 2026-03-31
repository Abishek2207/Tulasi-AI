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

// ─── Types ─────────────────────────────────────────────────────────
interface Stats {
  total_users: number; active_24h: number; active_today: number;
  total_reviews: number; total_submissions: number;
  total_hackathon_participants: number; total_chat_messages: number;
  pro_users: number;
}
interface AdminUser {
  id: number; name: string; email: string; role: string; xp: number;
  level: number; streak: number; is_pro: boolean; created_at: string;
  last_seen: string; last_activity_date: string; is_active: boolean;
}
interface Review {
  id: number; name: string; role: string; review: string; rating: number;
  created_at: string; user_email: string; is_featured: boolean;
}
interface Activity {
  id: number; user_name: string; user_email: string; action_type: string;
  title: string; metadata: string; xp: number; created_at: string;
}
interface LeaderboardEntry {
  rank: number; id: number; name: string; email: string; xp: number;
  level: number; streak: number; is_pro: boolean; is_top10: boolean;
}
interface CodeAnalytics {
  total_submissions: number; accepted_count: number; wrong_answer_count: number;
  acceptance_rate: number; top_solvers: { name: string; email: string; solved_count: number; xp: number }[];
  unique_solvers: number; total_problems_available: number;
}
interface ChatAnalytics {
  total_messages: number; user_messages: number; ai_messages: number;
  active_users_7d: number; active_users_24h: number;
  last_conversations: { title: string; user_name: string; user_email: string; last_message: string; created_at: string }[];
}
interface Hackathon {
  id: number; name: string; organizer: string; status: string;
  deadline: string; prize: string; link: string; participants_count: number;
}
interface Analytics {
  growth: { date: string; signups: number; actions: number }[];
  segmentation: { name: string; value: number; color: string }[];
}

type Tab = "overview" | "users" | "reviews" | "activity" | "leaderboard" | "code" | "chat" | "hackathons";

const API = process.env.NEXT_PUBLIC_API_URL;
const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDT = (d?: string | null) => d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const avatar = (name: string, pro: boolean) => (
  <div style={{ width: 36, height: 36, borderRadius: 10, background: pro ? "linear-gradient(135deg,#8B5CF6,#06B6D4)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: 14, flexShrink: 0 }}>
    {(name || "?")[0].toUpperCase()}
  </div>
);

// ─── Sidebar Nav ────────────────────────────────────────────────────
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
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
    if (status === "authenticated" && user?.role !== "admin") router.push("/dashboard");
  }, [status, user, router]);

  const h = useCallback((url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors" }).then(r => { if (!r.ok) throw new Error(r.status.toString()); return r.json(); }),
    [token]);

  const load = useCallback(async () => {
    if (!token || user?.role !== "admin") return;
    try {
      const [s, u, r, a, lb, ca, cha, hk, an] = await Promise.allSettled([
        h(`${API}/api/admin/stats`),
        h(`${API}/api/admin/users`),
        h(`${API}/api/admin/reviews`),
        h(`${API}/api/admin/activity`),
        h(`${API}/api/admin/leaderboard`),
        h(`${API}/api/admin/code-analytics`),
        h(`${API}/api/admin/chat-analytics`),
        h(`${API}/api/admin/hackathons`),
        h(`${API}/api/admin/analytics`),
      ]);
      if (s.status === "fulfilled" && !s.value.error) setStats(s.value);
      if (u.status === "fulfilled" && u.value.users) setUsers(u.value.users);
      if (r.status === "fulfilled" && r.value.reviews) setReviews(r.value.reviews);
      if (a.status === "fulfilled" && a.value.activity) setActivity(a.value.activity);
      if (lb.status === "fulfilled" && lb.value.leaderboard) setLeaderboard(lb.value.leaderboard);
      if (ca.status === "fulfilled") setCodeAnalytics(ca.value);
      if (cha.status === "fulfilled") setChatAnalytics(cha.value);
      if (hk.status === "fulfilled" && hk.value.hackathons) setHackathons(hk.value.hackathons);
      if (an.status === "fulfilled" && !an.value.error) setAnalytics(an.value);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, user, h]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const toggleUser = async (id: number, active: boolean) => {
    await fetch(`${API}/api/admin/toggle-user`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors", body: JSON.stringify({ user_id: id, is_active: !active }) });
    setUsers(u => u.map(x => x.id === id ? { ...x, is_active: !active } : x));
  };
  const deleteReview = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`${API}/api/admin/reviews/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors" });
    setReviews(r => r.filter(x => x.id !== id));
  };
  const featureReview = async (id: number) => {
    const res = await fetch(`${API}/api/admin/reviews/${id}/feature`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors" });
    const data = await res.json();
    setReviews(r => r.map(x => x.id === id ? { ...x, is_featured: data.is_featured } : x));
  };
  const seedHackathons = async () => {
    setSeeding(true); setSeedMsg("");
    try {
      const res = await fetch(`${API}/api/admin/seed-hackathons`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors" });
      const data = await res.json();
      setSeedMsg(data.message || "Done!");
      await load();
    } catch { setSeedMsg("Seed failed."); }
    finally { setSeeding(false); }
  };
  const deleteHackathon = async (id: number) => {
    if (!confirm("Delete hackathon?")) return;
    await fetch(`${API}/api/admin/hackathons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors" });
    setHackathons(h => h.filter(x => x.id !== id));
  };

  if (status === "loading" || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED" }} />
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-outfit)", fontSize: 16 }}>Loading dashboard…</span>
    </div>
  );

  const filteredUsers = users
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "xp" ? b.xp - a.xp : sortBy === "created_at" ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime());

  const rankBg = (rank: number) =>
    rank === 1 ? "linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,165,0,0.08))" :
    rank === 2 ? "linear-gradient(135deg,rgba(192,192,192,0.12),rgba(148,163,184,0.06))" :
    rank === 3 ? "linear-gradient(135deg,rgba(205,127,50,0.12),rgba(184,115,51,0.06))" :
    rank <= 10 ? "rgba(124,58,237,0.06)" : "transparent";

  const rankColor = (rank: number) => rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : rank <= 10 ? "#8B5CF6" : "var(--text-muted)";

  // ─── Shared table styles
  const TH_STYLE: React.CSSProperties = { padding: "14px 20px", textAlign: "left", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" };
  const TD_STYLE: React.CSSProperties = { padding: "14px 20px", fontSize: 13 };

  // ─── Status badge for hackathons
  const statusBadge = (s: string) => {
    const map: Record<string, string> = { Open: "badge-green", Upcoming: "badge-yellow", Closed: "badge-pink", Ongoing: "badge-blue" };
    return <span className={`badge ${map[s] || "badge-blue"}`} style={{ fontSize: 10 }}>{s}</span>;
  };

  // ─── KPI Card
  const KPI = ({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub?: string }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card"
      style={{ padding: "20px 24px", position: "relative", overflow: "hidden", borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{icon} {label}</div>
      <div style={{ fontSize: 38, fontWeight: 900, fontFamily: "var(--font-outfit)", color, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{sub}</div>}
    </motion.div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 220, background: "rgba(0,0,0,0.3)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TulasiLogo size={28} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "var(--font-outfit)" }}>Tulasi AI</div>
              <div style={{ fontSize: 10, color: "#F43F5E", fontWeight: 700, letterSpacing: 1 }}>🔒 ADMIN</div>
            </div>
          </div>
        </div>

        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", margin: "2px 12px", borderRadius: 10, border: "none", background: tab === t.id ? "rgba(124,58,237,0.15)" : "transparent", color: tab === t.id ? "#A78BFA" : "var(--text-muted)", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, transition: "all 0.15s", borderLeft: tab === t.id ? "2px solid #8B5CF6" : "2px solid transparent" }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
          </button>
        ))}

        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Signed in as</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button onClick={() => load()} style={{ marginTop: 10, width: "100%", padding: "7px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 6 }}>Platform Overview</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 32 }}>Real-time metrics — refreshes every 30 seconds</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
              <KPI label="Total Users"          value={stats?.total_users ?? 0}                icon="👥" color="#8B5CF6" />
              <KPI label="Active (24h)"          value={stats?.active_24h ?? 0}                icon="⚡" color="#10B981" sub={`${stats?.active_today ?? 0} active today`} />
              <KPI label="Total Reviews"         value={stats?.total_reviews ?? 0}             icon="⭐" color="#F59E0B" />
              <KPI label="Code Submissions"      value={stats?.total_submissions ?? 0}         icon="💻" color="#06B6D4" />
              <KPI label="Hackathon Sign-ups"    value={stats?.total_hackathon_participants ?? 0} icon="🚀" color="#F43F5E" />
              <KPI label="Chat Messages"         value={stats?.total_chat_messages ?? 0}       icon="💬" color="#A78BFA" />
              <KPI label="Pro Users"             value={stats?.pro_users ?? 0}                 icon="👑" color="#FFD700" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
              <div className="glass-card" style={{ padding: 24, height: 300 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>📈 User Growth (14 Days)</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={analytics?.growth || []}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <Tooltip contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                    <Area type="monotone" dataKey="signups" stroke="#8B5CF6" fill="url(#g1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card" style={{ padding: 24, height: 300 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>⚡ Platform Pulse (14 Days)</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={analytics?.growth || []}>
                    <XAxis dataKey="date" hide />
                    <Tooltip contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="actions" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card" style={{ padding: 24, height: 260 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>🔵 User Segmentation</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                  <div style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={analytics?.segmentation || []} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                          {(analytics?.segmentation || []).map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {analytics?.segmentation?.map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{s.name}</span>
                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-secondary)" }}>🏆 Top 5 Users</h3>
                {leaderboard.slice(0, 5).map(u => (
                  <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: rankColor(u.rank), minWidth: 24 }}>#{u.rank}</span>
                    {avatar(u.name, u.is_pro)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || "—"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.xp} XP · Lv {u.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>User Management</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{users.length} total users</p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search users…"
                  style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, width: 200 }} />
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, cursor: "pointer" }}>
                  <option value="xp">Sort: XP</option>
                  <option value="created_at">Sort: Join Date</option>
                  <option value="last_seen">Sort: Last Seen</option>
                </select>
              </div>
            </div>

            <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["User", "Rank", "Last Login", "Join Date", "XP / Level", "Status", "Action"].map(h => (
                        <th key={h} style={TH_STYLE}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                        <td style={TD_STYLE}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {avatar(u.name || u.email, u.is_pro)}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name || "—"}</div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={TD_STYLE}>
                          <span style={{ fontWeight: 800, color: rankColor(idx + 1), fontSize: 14 }}>#{idx + 1}</span>
                          {u.is_pro && <span style={{ marginLeft: 6, fontSize: 10, background: "rgba(139,92,246,0.15)", color: "#A78BFA", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>PRO</span>}
                        </td>
                        <td style={{ ...TD_STYLE, color: "var(--text-muted)" }}>{fmtDT(u.last_seen)}</td>
                        <td style={{ ...TD_STYLE, color: "var(--text-muted)" }}>{fmt(u.created_at)}</td>
                        <td style={TD_STYLE}>
                          <div style={{ fontWeight: 700, color: "#8B5CF6" }}>{u.xp.toLocaleString()} XP</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Level {u.level} · {u.streak}🔥</div>
                        </td>
                        <td style={TD_STYLE}>
                          <span className={`badge ${u.is_active ? "badge-green" : "badge-pink"}`} style={{ fontSize: 10 }}>
                            {u.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td style={TD_STYLE}>
                          {u.email !== user?.email && (
                            <button onClick={() => toggleUser(u.id, u.is_active)}
                              style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${u.is_active ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"}`, background: u.is_active ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)", color: u.is_active ? "#F43F5E" : "#10B981", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                              {u.is_active ? "Disable" : "Enable"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Review Management</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>{reviews.length} reviews — admin only, not public</p>

            <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Reviewer", "Email", "Rating", "Review", "Date", "Actions"].map(h => (
                        <th key={h} style={TH_STYLE}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: r.is_featured ? "rgba(255,215,0,0.03)" : "transparent" }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = r.is_featured ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.025)"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = r.is_featured ? "rgba(255,215,0,0.03)" : "transparent"}>
                        <td style={TD_STYLE}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.role || "Community"}</div>
                          {r.is_featured && <span style={{ fontSize: 9, background: "rgba(255,215,0,0.15)", color: "#FFD700", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>⭐ FEATURED</span>}
                        </td>
                        <td style={{ ...TD_STYLE, color: "var(--brand-secondary)", fontWeight: 600 }}>{r.user_email}</td>
                        <td style={TD_STYLE}>
                          <div style={{ display: "flex", gap: 2 }}>
                            {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < r.rating ? "#FFD93D" : "rgba(255,255,255,0.15)", fontSize: 13 }}>★</span>)}
                          </div>
                        </td>
                        <td style={{ ...TD_STYLE, maxWidth: 280 }}>
                          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.review}</p>
                        </td>
                        <td style={{ ...TD_STYLE, color: "var(--text-muted)" }}>{fmt(r.created_at)}</td>
                        <td style={TD_STYLE}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => featureReview(r.id)}
                              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(255,215,0,0.3)", background: "rgba(255,215,0,0.08)", color: "#FFD700", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                              {r.is_featured ? "Unstar" : "Feature"}
                            </button>
                            <button onClick={() => deleteReview(r.id)}
                              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#F43F5E", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACTIVITY */}
        {tab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Live Activity Feed</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{activity.length} events · auto-refreshes every 30s</p>
              </div>
              <button onClick={load} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                🔄 Refresh Now
              </button>
            </div>

            <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["User", "Action", "Details", "+XP", "Time"].map(h => (
                        <th key={h} style={TH_STYLE}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map(a => {
                      const ac = a.action_type;
                      const cls = ac.includes("login") ? "badge-green" : ac.includes("register") ? "badge-pink" : ac.includes("message") || ac.includes("chat") ? "badge-purple" : ac.includes("code") || ac.includes("solved") ? "badge-blue" : "badge-yellow";
                      return (
                        <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                          <td style={TD_STYLE}>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{a.user_name}</div>
                            <div style={{ fontSize: 11, color: "var(--brand-secondary)" }}>{a.user_email}</div>
                          </td>
                          <td style={TD_STYLE}>
                            <span className={`badge ${cls}`} style={{ fontSize: 9 }}>{a.action_type.replace(/_/g, " ").toUpperCase()}</span>
                          </td>
                          <td style={{ ...TD_STYLE, maxWidth: 260 }}>
                            <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title || "—"}</div>
                            {a.metadata && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.metadata}</div>}
                          </td>
                          <td style={TD_STYLE}>
                            {a.xp > 0 ? <span style={{ color: "#10B981", fontWeight: 800, fontSize: 13 }}>+{a.xp}</span> : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>—</span>}
                          </td>
                          <td style={{ ...TD_STYLE, color: "var(--text-muted)", fontSize: 12 }}>{fmtDT(a.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* LEADERBOARD */}
        {tab === "leaderboard" && (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Global Leaderboard</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>{leaderboard.length} ranked users · top 10 highlighted</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {leaderboard.map(u => (
                <motion.div key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(u.rank * 0.02, 0.3) }}
                  className="glass-card"
                  style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, background: rankBg(u.rank), borderColor: u.rank <= 3 ? rankColor(u.rank) + "30" : "var(--border)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}>
                  {/* Rank */}
                  <div style={{ width: 48, textAlign: "center", fontWeight: 900, fontSize: u.rank <= 3 ? 24 : 16, color: rankColor(u.rank), fontFamily: "var(--font-outfit)" }}>
                    {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
                  </div>
                  {avatar(u.name, u.is_pro)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      {u.name || "—"}
                      {u.is_pro && <span style={{ fontSize: 9, background: "rgba(139,92,246,0.2)", color: "#A78BFA", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>PRO 👑</span>}
                      {u.rank <= 10 && u.rank > 3 && <span style={{ fontSize: 9, background: "rgba(124,58,237,0.15)", color: "#8B5CF6", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>TOP 10</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{u.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: rankColor(u.rank), fontFamily: "var(--font-outfit)" }}>{u.xp.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>XP · Lv {u.level} · {u.streak}🔥</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CODE ANALYTICS */}
        {tab === "code" && (
          <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Code Practice Analytics</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>Submission insights and top performers</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16, marginBottom: 32 }}>
              <KPI label="Total Submissions"   value={codeAnalytics?.total_submissions ?? 0}       icon="📤" color="#8B5CF6" />
              <KPI label="Accepted"            value={codeAnalytics?.accepted_count ?? 0}          icon="✅" color="#10B981" />
              <KPI label="Acceptance Rate"     value={`${codeAnalytics?.acceptance_rate ?? 0}%`}  icon="📊" color="#06B6D4" />
              <KPI label="Problems Available"  value={codeAnalytics?.total_problems_available ?? 0} icon="🧩" color="#F59E0B" />
              <KPI label="Unique Solvers"      value={codeAnalytics?.unique_solvers ?? 0}          icon="👨‍💻" color="#F43F5E" />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>🏆 Top Solvers</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["#", "User", "Problems Solved", "XP"].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {codeAnalytics?.top_solvers?.map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                        <td style={{ ...TD_STYLE, fontWeight: 800, color: rankColor(i + 1), fontSize: 15 }}>{i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}</td>
                        <td style={TD_STYLE}>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.email}</div>
                        </td>
                        <td style={{ ...TD_STYLE, fontWeight: 800, color: "#10B981", fontSize: 18 }}>{s.solved_count}</td>
                        <td style={{ ...TD_STYLE, color: "#8B5CF6", fontWeight: 700 }}>{s.xp.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* CHAT ANALYTICS */}
        {tab === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Chat Analytics</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 28 }}>AI chat usage and conversation insights</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16, marginBottom: 32 }}>
              <KPI label="Total Messages"   value={chatAnalytics?.total_messages ?? 0}     icon="💬" color="#8B5CF6" />
              <KPI label="User Messages"    value={chatAnalytics?.user_messages ?? 0}      icon="👤" color="#06B6D4" />
              <KPI label="AI Responses"     value={chatAnalytics?.ai_messages ?? 0}        icon="🤖" color="#10B981" />
              <KPI label="Active (7d)"      value={chatAnalytics?.active_users_7d ?? 0}    icon="📅" color="#F59E0B" />
              <KPI label="Active (24h)"     value={chatAnalytics?.active_users_24h ?? 0}   icon="⚡" color="#F43F5E" />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>🕐 Last Conversations</h3>
              </div>
              {chatAnalytics?.last_conversations?.map((c, i) => (
                <div key={i} style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", alignItems: "flex-start", gap: 14 }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                  {avatar(c.user_name, false)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{c.user_name}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.user_email}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{fmtDT(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-secondary)", marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.last_message}</div>
                  </div>
                </div>
              ))}
              {(!chatAnalytics?.last_conversations?.length) && (
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No conversations yet</div>
              )}
            </div>
          </motion.div>
        )}

        {/* HACKATHONS */}
        {tab === "hackathons" && (
          <motion.div key="hackathons" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 4 }}>Hackathon Management</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{hackathons.length} hackathons in database</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {seedMsg && <span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>{seedMsg}</span>}
                <button onClick={seedHackathons} disabled={seeding}
                  style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: 12, cursor: seeding ? "not-allowed" : "pointer", fontWeight: 700 }}>
                  {seeding ? "⏳ Seeding…" : "🌱 Seed 20 Hackathons"}
                </button>
                <button onClick={() => {
                  const name = prompt("Hackathon Name?");
                  const organizer = prompt("Organizer?");
                  const desc = prompt("Description?");
                  const prize = prompt("Prize?") || "TBD";
                  const deadline = prompt("Deadline (YYYY-MM-DD)?") || "2026-12-31";
                  const link = prompt("Link?") || "#";
                  if (!name || !organizer || !desc) return;
                  fetch(`${API}/api/admin/hackathons`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors", body: JSON.stringify({ name, organizer, description: desc, prize, deadline, link }) })
                    .then(r => r.json()).then(h => setHackathons(p => [h, ...p]));
                }} className="btn-primary" style={{ padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
                  + Add New
                </button>
              </div>
            </div>

            <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Hackathon", "Organizer", "Status", "Deadline", "Prize", "Link", "Action"].map(h => (
                        <th key={h} style={TH_STYLE}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hackathons.map(h => (
                      <tr key={h.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.025)"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                        <td style={TD_STYLE}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                        </td>
                        <td style={{ ...TD_STYLE, color: "var(--text-secondary)" }}>{h.organizer}</td>
                        <td style={TD_STYLE}>{statusBadge(h.status)}</td>
                        <td style={{ ...TD_STYLE, color: "var(--text-muted)", fontSize: 12 }}>{h.deadline}</td>
                        <td style={{ ...TD_STYLE, color: "#10B981", fontWeight: 700, fontSize: 12 }}>{h.prize || "—"}</td>
                        <td style={TD_STYLE}>
                          {h.link && <a href={h.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--brand-secondary)", fontSize: 11, textDecoration: "none", fontWeight: 600 }}>↗ Visit</a>}
                        </td>
                        <td style={TD_STYLE}>
                          <button onClick={() => deleteHackathon(h.id)}
                            style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#F43F5E", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
