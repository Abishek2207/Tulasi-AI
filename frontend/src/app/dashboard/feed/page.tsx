"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { API_URL } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { Lightbulb, Heart, MessageCircle, Flame, Plus, X, Send, Sparkles, TrendingUp, Clock, RefreshCw } from "lucide-react";

interface Idea {
  id: number;
  user_id: number;
  user_name: string;
  user_username?: string;
  user_avatar?: string;
  content: string;
  tags?: string;
  likes_count: number;
  comments_count: number;
  is_liked_by_me: boolean;
  is_following_creator: boolean;
  created_at: string;
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"global" | "network">("global");
  const [error, setError] = useState("");
  const socketReady = useRef(false);

  useEffect(() => {
    fetchFeed();
  }, [activeTab]);

  // Socket.io real-time: join "feed" room and listen for new posts / like updates
  useEffect(() => {
    const token = getToken();
    if (!token || socketReady.current) return;
    socketReady.current = true;

    socketService.connect(token);
    socketService.emit("join_room", { room: "feed" });

    const handleNewIdea = (idea: Idea) => {
      setPosts(prev => {
        if (prev.find(p => p.id === idea.id)) return prev;
        return [idea, ...prev];
      });
    };

    const handleLikeUpdate = (data: { idea_id: number; likes_count: number }) => {
      setPosts(prev => prev.map(p =>
        p.id === data.idea_id ? { ...p, likes_count: data.likes_count } : p
      ));
    };

    socketService.on("new_idea", handleNewIdea);
    socketService.on("idea_like_update", handleLikeUpdate);

    return () => {
      socketService.off("new_idea", handleNewIdea);
      socketService.off("idea_like_update", handleLikeUpdate);
    };
  }, []);

  const fetchFeed = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/feed?tab=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load feed");
      const data: Idea[] = await res.json();
      setPosts(data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Failed to load feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: number) => {
    const token = getToken();
    // Optimistic UI update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes_count: p.is_liked_by_me ? p.likes_count - 1 : p.likes_count + 1, is_liked_by_me: !p.is_liked_by_me }
        : p
    ));
    try {
      await fetch(`${API_URL}/api/feed/${postId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: p.is_liked_by_me ? p.likes_count + 1 : p.likes_count - 1, is_liked_by_me: !p.is_liked_by_me }
          : p
      ));
    }
  };

  const handlePost = async () => {
    if (!newContent.trim()) return;
    setSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${API_URL}/api/feed/idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newContent, tags: newTags }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to post");
      const idea: Idea = await res.json();
      setPosts(prev => [idea, ...prev]);
      setNewContent(""); setNewTags("");
      setShowCreate(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const parseTags = (tags?: string) =>
    tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <motion.div
                animate={{ boxShadow: ["0 8px 20px rgba(139,92,246,0.3)", "0 8px 40px rgba(139,92,246,0.5)", "0 8px 20px rgba(139,92,246,0.3)"] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #8B5CF6, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lightbulb size={20} color="white" />
              </motion.div>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: 2 }}>Community Intelligence Feed</div>
            </div>
            <h1 style={{ fontSize: "clamp(30px,5vw,44px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 8, lineHeight: 1 }}>
              Idea <span style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Feed</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Real-time wins, insights & breakthroughs from the community.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => fetchFeed(true)}
              style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                <RefreshCw size={16} />
              </motion.div>
            </motion.button>
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 12px 28px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 14, background: "linear-gradient(135deg, #8B5CF6, #EC4899)", border: "none", color: "white", fontWeight: 900, fontSize: 14, cursor: "pointer", boxShadow: "0 8px 20px rgba(139,92,246,0.3)" }}>
              <Plus size={16} /> Share
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 14, width: "fit-content", border: "1px solid rgba(255,255,255,0.05)" }}>
        {[{ id: "global" as const, icon: <TrendingUp size={14} />, label: "🌍 Global" }, { id: "network" as const, icon: <Clock size={14} />, label: "👥 Network" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, transition: "all 0.2s", background: activeTab === tab.id ? "rgba(139,92,246,0.15)" : "transparent", color: activeTab === tab.id ? "#A78BFA" : "var(--text-muted)" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3].map(i => (
            <motion.div key={i} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              style={{ height: 160, borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ padding: 24, textAlign: "center", color: "#F87171", background: "rgba(244,63,94,0.06)", borderRadius: 20, border: "1px solid rgba(244,63,94,0.15)" }}>
          ⚠️ {error} — <button onClick={() => fetchFeed()} style={{ background: "none", border: "none", color: "#A78BFA", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No posts yet</div>
          <div style={{ fontSize: 14 }}>Be the first to share something with the community!</div>
        </div>
      )}

      {/* Posts */}
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AnimatePresence>
            {posts.map((post, i) => {
              const tags = parseTags(post.tags);
              const isTrending = post.likes_count >= 10;
              return (
                <motion.div key={post.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  style={{ padding: 28, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" }}>
                  {/* Ambient */}
                  <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

                  {/* Author */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    {post.user_avatar ? (
                      <img src={post.user_avatar} alt={post.user_name} style={{ width: 40, height: 40, borderRadius: 14, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: `linear-gradient(135deg, hsl(${(post.user_id * 67) % 360}, 70%, 55%), hsl(${(post.user_id * 67 + 40) % 360}, 80%, 65%))`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "white", flexShrink: 0 }}>
                        {post.user_name[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>{post.user_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{timeAgo(post.created_at)}</div>
                    </div>
                    {isTrending && (
                      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 900, color: "#F97316", background: "rgba(249,115,22,0.1)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(249,115,22,0.2)" }}>
                        <Flame size={12} fill="#F97316" /> Hot
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.88)", lineHeight: 1.75, marginBottom: tags.length > 0 ? 14 : 0, whiteSpace: "pre-wrap" }}>
                    {post.content}
                  </p>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                      {tags.map((tag, ti) => (
                        <span key={ti} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(139,92,246,0.1)", color: "#A78BFA", fontWeight: 700, border: "1px solid rgba(139,92,246,0.2)" }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleLike(post.id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 800, padding: "7px 16px", borderRadius: 12, border: "none", cursor: "pointer", transition: "all 0.2s", background: post.is_liked_by_me ? "rgba(236,72,153,0.12)" : "rgba(255,255,255,0.04)", color: post.is_liked_by_me ? "#EC4899" : "var(--text-secondary)" }}>
                      <Heart size={16} fill={post.is_liked_by_me ? "#EC4899" : "none"} />
                      {post.likes_count}
                    </motion.button>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "var(--text-muted)", padding: "7px 14px" }}>
                      <MessageCircle size={16} /> {post.comments_count}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 560, background: "rgba(13,13,21,0.98)", borderRadius: 28, border: "1px solid rgba(139,92,246,0.3)", padding: 36, boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sparkles size={20} color="#8B5CF6" />
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Share with Community</h2>
                </div>
                <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(244,63,94,0.08)", borderRadius: 10, fontSize: 13, color: "#F87171" }}>⚠️ {error}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Your Idea / Win / Insight</label>
                  <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                    placeholder="Share a placement result, a DSA insight, a project you built, or anything valuable for the community..."
                    rows={5}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", letterSpacing: 1, display: "block", marginBottom: 8, textTransform: "uppercase" }}>Tags <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>(comma separated)</span></label>
                  <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="placement, dsa, startup..."
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
                <motion.button whileHover={{ scale: 1.02, boxShadow: "0 10px 28px rgba(139,92,246,0.4)" }} whileTap={{ scale: 0.98 }}
                  onClick={handlePost} disabled={submitting || !newContent.trim()}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #8B5CF6, #EC4899)", border: "none", color: "white", fontWeight: 900, fontSize: 15, cursor: submitting ? "wait" : "pointer", opacity: !newContent.trim() ? 0.6 : 1, marginTop: 4 }}>
                  {submitting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                  ) : <><Send size={16} /> Publish to Feed</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
