"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminStats {
  total_users: number;
  students: number;
  active_today: number;
  admins: number;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  xp: number;
  created_at: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const token = user?.accessToken;

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/auth"); return; }
    if (status === "authenticated" && user?.role !== "admin") { router.push("/dashboard"); return; }
  }, [status, user, router]);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors" }).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors" }).then(r => r.json()),
    ]).then(([s, u]) => { setStats(s as AdminStats); setUsers((u.users as AdminUser[]) || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [token, user]);

  const toggleUser = async (userId: number, isActive: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/toggle-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials:"include", mode:"cors",
      body: JSON.stringify({ user_id: userId, is_active: !isActive }),
    });
    setUsers(u => u.map(us => us.id === userId ? { ...us, is_active: !isActive } : us));
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
        <div style={{ marginBottom: 40, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #FF6B9D, #6C63FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⚙️</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-outfit)" }}>Admin Dashboard</h1>
              <span className="badge badge-pink" style={{ padding: "4px 12px" }}>🔒 Restricted</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>Platform control — only you can see this</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
            {[
              { label: "Total Users", value: stats.total_users, icon: "👥", color: "#6C63FF" },
              { label: "Students", value: stats.students, icon: "🎓", color: "#43E97B" },
              { label: "Active Today", value: stats.active_today, icon: "⚡", color: "#FFD93D" },
              { label: "Admins", value: stats.admins, icon: "⚙️", color: "#FF6B9D" },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="dash-card" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "var(--font-outfit)", color: s.color }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Users */}
        <h2 style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-outfit)", marginBottom: 20 }}>User Management ({users.length})</h2>
        <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["User", "Email", "Role", "XP", "Joined", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                >
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 15 }}>
                      {(u.name || u.email || "U")[0].toUpperCase()}
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13 }}><div style={{ fontWeight: 600 }}>{u.name || "—"}</div><div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>{u.email}</div></td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className={`badge ${u.role === "admin" ? "badge-pink" : "badge-green"}`} style={{ fontSize: 11 }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-secondary)" }}>{u.xp}</td>
                  <td style={{ padding: "14px 18px", fontSize: 12, color: "var(--text-muted)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <span className={`badge ${u.is_active ? "badge-green" : "badge-pink"}`} style={{ fontSize: 11 }}>{u.is_active ? "Active" : "Disabled"}</span>
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    {u.email !== user?.email && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => toggleUser(u.id, u.is_active)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${u.is_active ? "rgba(255,107,107,0.3)" : "rgba(67,233,123,0.3)"}`, background: "transparent", color: u.is_active ? "#FF8585" : "#43E97B", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                        {u.is_active ? "Disable" : "Enable"}
                      </motion.button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
