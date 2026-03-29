"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TulasiLogo } from "@/components/TulasiLogo";

interface AdminStats {
  total_users: number;
  students: number;
  active_today: number;
  admins: number;
  pro_users: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  xp: number;
  created_at: string;
  is_active: boolean;
  is_pro: boolean;
}

interface AdminReview {
  id: number;
  name: string;
  role: string;
  review: string;
  rating: number;
  created_at: string;
  user_email: string;
}

interface AdminActivity {
  id: number;
  user_name: string;
  user_email: string;
  action_type: string;
  title: string;
  metadata: string;
  xp: number;
  created_at: string;
}

interface AdminAnalytics {
  growth: { date: string, signups: number, actions: number }[];
  segmentation: { name: string, value: number, color: string }[];
}

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "reviews" | "activity" | "hackathons" | "analytics">("users");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const token = user?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth"); return; }
    if (status === "authenticated" && user?.role !== "admin") { router.push("/dashboard"); return; }
  }, [status, user, router]);

  const fetchData = async () => {
    if (!token || user?.role !== "admin") return;
    try {
      const fetchWithAuth = (url: string) => 
        fetch(url, { 
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
          credentials: "include", 
          mode: "cors" 
        }).then(async r => {
          if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
          return r.json();
        });

      const [s, u, r, a, an, h] = await Promise.all([
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/activity`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hackathons`),
      ]);

      if (s && !s.error) setStats(s as AdminStats); 
      if (u && u.users) setUsers((u.users as AdminUser[]) || []); 
      if (r && r.reviews) setReviews((r.reviews as AdminReview[]) || []);
      if (a && a.activity) setActivity((a.activity as AdminActivity[]) || []);
      if (h && h.hackathons) setHackathons(h.hackathons);
      
      if (an && !an.error) {
        setAnalytics(an as AdminAnalytics);
      } else {
        // Fallback for analytics if specific error returned
        console.warn("Analytics error:", an?.error);
        setAnalytics({ growth: [], segmentation: [] });
      }
    } catch (e) {
      console.error("Admin fetch error:", e);
      // Optional: Set some error state to show a "Retry" button
    } finally {
      setLoading(false);
    }
  };

  const safeDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Unknown Date" : d.toLocaleDateString();
  };

  const safeDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Unknown Time" : d.toLocaleString();
  };

  useEffect(() => {
    fetchData();
  }, [token, user]);

  const toggleUser = async (userId: number, isActive: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/toggle-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors",
      body: JSON.stringify({ user_id: userId, is_active: !isActive }),
    });
    setUsers(u => u.map(us => us.id === userId ? { ...us, is_active: !isActive } : us));
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors",
    });
    setReviews(revs => revs.filter(r => r.id !== reviewId));
  };

  if (status === "loading" || loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid rgba(108,99,255,0.2)", borderTopColor: "#6C63FF" }} />
    </div>
  );

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", padding: "36px" }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: 16, 
              background: "rgba(108,99,255,0.08)", 
              border: "1px solid rgba(108,99,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center" 
            }}>
              <TulasiLogo size={32} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-outfit)" }}>Admin Dashboard</h1>
                <span className="badge badge-pink" style={{ padding: "4px 12px" }}>🔒 Restricted</span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>Platform control — only you can see this</p>
            </div>
          </div>
          
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 12 }}>
            <button 
              onClick={() => setActiveTab("users")}
              style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: activeTab === "users" ? "#6C63FF" : "transparent", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab("reviews")}
              style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: activeTab === "reviews" ? "#6C63FF" : "transparent", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Reviews
            </button>
            <button 
              onClick={() => setActiveTab("activity")}
              style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: activeTab === "activity" ? "#6C63FF" : "transparent", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Activity
            </button>
            <button 
              onClick={() => setActiveTab("hackathons")}
              style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: activeTab === "hackathons" ? "#6C63FF" : "transparent", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Hackathons
            </button>
            <button 
              onClick={() => setActiveTab("analytics")}
              style={{ padding: "8px 24px", borderRadius: 10, border: "none", background: activeTab === "analytics" ? "#6C63FF" : "transparent", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
            {[
              { label: "Total Students", value: stats.students, icon: "👥", color: "#6C63FF" },
              { label: "Active Today", value: stats.active_today, icon: "⚡", color: "#43E97B" },
              { label: "Pro Upgrades", value: stats.pro_users || 0, icon: "💎", color: "#A78BFA" },
              { label: "Est. MRR (₹)", value: `₹${(stats.pro_users || 0) * 100}`, icon: "💰", color: "#10B981", highlight: true },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card" style={{ position: "relative", overflow: "hidden", padding: 24, border: s.highlight ? `1px solid ${s.color}50` : undefined, background: s.highlight ? `linear-gradient(135deg, rgba(255,255,255,0.02), ${s.color}10)` : undefined }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", color: s.highlight ? s.color : "white", letterSpacing: "-1px" }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "users" ? (
          <>
            <h2 style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: 20 }}>User Matrix ({users.length})</h2>
            <div className="glass-card" style={{ overflow: "hidden", padding: 0, background: "rgba(255,255,255,0.015)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["User", "Tier", "Role", "XP", "Joined", "Status", "Action"].map(h => (
                      <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 12, background: u.is_pro ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "white", fontSize: 15 }}>
                            {(u.name || u.email || "U")[0].toUpperCase()}
                          </div>
                          <div>
                             <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name || "—"}</div>
                             <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {u.is_pro ? <span style={{ padding: "4px 8px", background: "rgba(139,92,246,0.15)", color: "#A78BFA", borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>PRO 👑</span> : <span style={{ padding: "4px 8px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>Free</span>}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span className={`badge ${u.role === "admin" ? "badge-pink" : "badge-green"}`} style={{ fontSize: 11 }}>{u.role.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{u.xp}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" }}>{safeDate(u.created_at)}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <span className={`badge ${u.is_active ? "badge-green" : "badge-pink"}`} style={{ fontSize: 11 }}>{u.is_active ? "Active" : "Disabled"}</span>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {u.email !== user?.email && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => toggleUser(u.id, u.is_active)}
                            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${u.is_active ? "rgba(244,63,94,0.3)" : "rgba(16,185,129,0.3)"}`, background: u.is_active ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)", color: u.is_active ? "#F43F5E" : "#10B981", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                            {u.is_active ? "Disable" : "Enable"}
                          </motion.button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === "reviews" ? (
          <>
            <h2 style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: 20 }}>Review Intelligence ({reviews.length})</h2>
            <div className="glass-card" style={{ overflow: "hidden", padding: 0, background: "rgba(255,255,255,0.015)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Reviewer", "Gmail", "Rating", "Feedback", "Date", "Action"].map(h => (
                      <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{r.role || "Community"}</div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--brand-secondary)", fontWeight: 600 }}>{r.user_email}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} style={{ color: i < r.rating ? "#FFD93D" : "rgba(255,255,255,0.1)", fontSize: 14 }}>★</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", maxWidth: 300 }}>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{r.review}</p>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" }}>{safeDate(r.created_at)}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => deleteReview(r.id)}
                          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.1)", color: "#F43F5E", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                          Delete
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === "hackathons" ? (
          <>
             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-outfit)", margin: 0 }}>Hackathon Listings ({hackathons.length})</h2>
              <button 
                onClick={() => {
                  const name = prompt("Hackathon Name?");
                  const organizer = prompt("Organizer?");
                  const desc = prompt("Description?");
                  const prize = prompt("Prize?");
                  const deadline = prompt("Deadline (YYYY-MM-DD)?");
                  const link = prompt("Link?");
                  if (!name || !organizer || !desc) return;
                  
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hackathons`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors",
                    body: JSON.stringify({ name, organizer, description: desc, prize, deadline, link }),
                  }).then(r => r.json()).then(h => setHackathons(prev => [h, ...prev]));
                }}
                className="btn-primary" style={{ padding: "8px 20px", borderRadius: 10, fontSize: 12, fontWeight: 800 }}
              >
                + Add Hackathon
              </button>
            </div>

            <div className="glass-card" style={{ overflow: "hidden", padding: 0, background: "rgba(255,255,255,0.015)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Event", "Organizer", "Prize", "Deadline", "Action"].map(h => (
                      <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hackathons.map(h => (
                    <tr key={h.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{h.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{h.status}</div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-primary)" }}>{h.organizer}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "#10B981", fontWeight: 700 }}>{h.prize}</td>
                      <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--text-muted)" }}>{h.deadline}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <button 
                          onClick={() => {
                            if (!confirm("Delete hackathon?")) return;
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hackathons/${h.id}`, {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors",
                            }).then(() => setHackathons(prev => prev.filter(item => item.id !== h.id)));
                          }}
                          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.1)", color: "#F43F5E", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === "activity" ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-outfit)", margin: 0 }}>Live Usage Telemetry ({activity.length})</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => fetchData()}
                style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                <span>🔄</span> Refresh
              </motion.button>
            </div>
            <div className="glass-card" style={{ overflow: "hidden", padding: 0, background: "rgba(255,255,255,0.015)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["User", "Action Map", "Session Details", "XP", "Timestamp"].map(h => (
                      <th key={h} style={{ padding: "16px 20px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activity.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{a.user_name}</div>
                        <div style={{ color: "var(--brand-secondary)", fontSize: 12, fontWeight: 600 }}>{a.user_email}</div>
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span className={`badge ${
                          a.action_type.includes("login") ? "badge-green" : 
                          a.action_type.includes("register") ? "badge-pink" : 
                          a.action_type.includes("message") ? "badge-purple" : 
                          "badge-blue"
                        }`} style={{ fontSize: 10, display: "inline-block", padding: "2px 8px" }}>
                          {a.action_type.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", maxWidth: 280 }}>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title || "No Title Logged"}</div>
                        {a.metadata && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.metadata}</div>}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        {a.xp > 0 ? (
                          <span style={{ color: "#10B981", fontWeight: 800, fontSize: 13 }}>+{a.xp} XP</span>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>System</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: 12, color: "var(--text-muted)" }}>
                        {safeDateTime(a.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            <div className="glass-card" style={{ padding: 24, height: 400 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>User Growth (14 Days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.growth || []}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ background: "rgba(10,10,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    itemStyle={{ color: "#8B5CF6" }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorSignups)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: 24, height: 400 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Platform pulse (14 Days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.growth || []}>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ background: "rgba(10,10,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    itemStyle={{ color: "#10B981" }}
                  />
                  <Bar dataKey="actions" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card" style={{ padding: 24, height: 360, gridColumn: "span 2" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>User Segmentation</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                <div style={{ width: 250, height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={analytics?.segmentation || []}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(analytics?.segmentation || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: "rgba(10,10,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {analytics?.segmentation?.map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                      <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{s.value} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
