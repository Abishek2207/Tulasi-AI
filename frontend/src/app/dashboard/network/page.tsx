"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { API_URL } from "@/lib/api";
import { Users, Search, UserPlus, UserCheck, Clock, X, CheckCircle, XCircle } from "lucide-react";

interface UserResult {
  id: number;
  username?: string;
  name: string;
  avatar?: string;
  is_following: boolean;
  request_status: "none" | "pending" | "accepted" | "rejected";
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
}

function Avatar({ user, size = 48 }: { user: Pick<UserResult, "id" | "name" | "avatar">; size?: number }) {
  return user.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      style={{ width: size, height: size, borderRadius: size * 0.35, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.35, flexShrink: 0,
        background: `linear-gradient(135deg, hsl(${(user.id * 67) % 360}, 65%, 50%), hsl(${(user.id * 67 + 40) % 360}, 75%, 60%))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: size * 0.38, color: "white",
      }}
    >
      {user.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function FollowButton({ userId, status, onUpdate }: { userId: number; status: string; onUpdate: (id: number, newStatus: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const token = getToken();
    try {
      if (status === "accepted") {
        // Unfollow
        await fetch(`${API_URL}/api/follow/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        onUpdate(userId, "none");
      } else if (status === "none" || status === "rejected") {
        // Follow request
        const res = await fetch(`${API_URL}/api/follow/${userId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        onUpdate(userId, data.follow_status || "pending");
      }
    } catch (e) {
      console.error("Follow action failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const config: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
    none:     { label: "Follow", icon: <UserPlus size={14} />, bg: "rgba(139,92,246,0.15)", color: "#A78BFA" },
    pending:  { label: "Pending", icon: <Clock size={14} />, bg: "rgba(234,179,8,0.12)", color: "#FCD34D" },
    accepted: { label: "Following", icon: <UserCheck size={14} />, bg: "rgba(34,197,94,0.12)", color: "#4ADE80" },
    rejected: { label: "Follow", icon: <UserPlus size={14} />, bg: "rgba(139,92,246,0.15)", color: "#A78BFA" },
  };
  const c = config[status] ?? config["none"];

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      disabled={loading || status === "pending"}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 18px", borderRadius: 12, border: "none",
        background: c.bg, color: c.color,
        fontSize: 13, fontWeight: 700, cursor: status === "pending" ? "default" : "pointer",
        opacity: loading ? 0.6 : 1, transition: "all 0.2s",
      }}
    >
      {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7 }} style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} /> : c.icon}
      {loading ? "..." : c.label}
    </motion.button>
  );
}

export default function NetworkPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const url = `${API_URL}/api/users/search?q=${encodeURIComponent(q.trim())}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setUsers(data.users || []);
      setSearched(true);
    } catch (e: any) {
      setError("Could not load users. Retrying...");
      // Auto-retry once
      setTimeout(() => searchUsers(q), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Load all users on mount (q="")
  useEffect(() => {
    searchUsers("");
  }, []);

  // Debounced search on input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(query), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const updateFollowStatus = (id: number, newStatus: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, request_status: newStatus as any, is_following: newStatus === "accepted" } : u));
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <motion.div
            animate={{ boxShadow: ["0 8px 20px rgba(139,92,246,0.3)", "0 8px 40px rgba(139,92,246,0.5)", "0 8px 20px rgba(139,92,246,0.3)"] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Users size={20} color="white" />
          </motion.div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: 2 }}>People Discovery</div>
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 8, lineHeight: 1 }}>
          Grow Your{" "}
          <span style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Network
          </span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Discover and connect with students and professionals on TulasiAI.</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ position: "relative", marginBottom: 32 }}>
        <Search size={18} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          id="network-search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or username..."
          style={{
            width: "100%", padding: "16px 16px 16px 50px",
            borderRadius: 16, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", color: "white",
            fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
          onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
        {query && (
          <button onClick={() => setQuery("")}
            style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={16} />
          </button>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: 20, padding: "12px 18px", background: "rgba(244,63,94,0.08)", borderRadius: 12, border: "1px solid rgba(244,63,94,0.15)", color: "#F87171", fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.15 }}
              style={{ height: 80, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && searched && users.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: "white" }}>No users found</div>
          <div style={{ fontSize: 14 }}>Try a different name or username.</div>
        </motion.div>
      )}

      {/* User Cards */}
      {!loading && users.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {users.length} {users.length === 1 ? "person" : "people"} found
          </div>
          <AnimatePresence>
            {users.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(i * 0.04, 0.2) }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "18px 24px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
                }}
              >
                {/* Ambient gradient */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

                <Avatar user={user} size={52} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                    {user.username ? `@${user.username}` : "No username set"}
                  </div>
                </div>

                {user.id !== currentUserId && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => window.location.href = `/dashboard/messages?user=${user.id}`}
                      style={{
                        padding: "8px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)", color: "white",
                        fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                      }}
                    >
                      Message
                    </motion.button>
                    <FollowButton userId={user.id} status={user.request_status} onUpdate={updateFollowStatus} />
                  </div>
                )}

                {user.id === currentUserId && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, padding: "6px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
                    You
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
