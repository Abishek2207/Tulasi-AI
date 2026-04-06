"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { 
  Send, Heart, MessageCircle, UserPlus, Search, 
  CheckCircle, Sparkles, Globe, Users, TrendingUp,
  MoreHorizontal, Share2, Plus, BrainCircuit
} from "lucide-react";
import { socketService } from "@/lib/socket";
import { usersApi, messagesApi } from "@/lib/api";
import { toast } from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const currentUserId = (user as any)?.id;
  
  const [activeTab, setActiveTab] = useState<"global" | "network">("global");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Stats (Simulated for UI richness)
  const stats = {
    ideas_shared: 12,
    contributions: 48,
    engagement: "92%"
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab]);

  // Socket Listeners
  useEffect(() => {
    if (socketService) {
      const handleNewIdea = (idea: any) => {
        // If we are on global tab, or if it's our own idea, or if it's from someone we follow
        if (activeTab === "global" || idea.user_id === currentUserId || idea.is_following_creator) {
          setIdeas(prev => [idea, ...prev.filter(i => i.id !== idea.id)]);
          if (idea.user_id !== currentUserId) {
            toast(`@${idea.user_username} just shared a new idea!`, { icon: "🚀" });
          }
        }
      };

      const handleLikeUpdate = (data: { idea_id: number; likes_count: number }) => {
        setIdeas(prev => prev.map(i => i.id === data.idea_id ? { ...i, likes_count: data.likes_count } : i));
      };

      socketService.on("new_idea", handleNewIdea);
      socketService.on("idea_like_update", handleLikeUpdate);

      return () => {
        socketService.off("new_idea", handleNewIdea);
        socketService.off("idea_like_update", handleLikeUpdate);
      };
    }
  }, [activeTab, currentUserId]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feed?tab=${activeTab}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setIdeas(await res.json());
      }
    } catch (e) {
      console.error("Feed error:", e);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newIdea.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/feed/idea`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ content: newIdea })
      });
      if (res.ok) {
        const posted = await res.json();
        // Socket will typically handle the broadcast, but we update UI immediately
        setIdeas(prev => [posted, ...prev]);
        setNewIdea("");
        toast.success("Idea beamed to the community!");
      }
    } catch (e) {
      toast.error("failed to share idea");
    }
  };

  const handleLike = async (ideaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/feed/${ideaId}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(prev => prev.map(i => i.id === ideaId ? { 
          ...i, 
          likes_count: data.likes_count, 
          is_liked_by_me: data.status === "liked" 
        } : i));
      }
    } catch (e) {}
  };

  // User Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await usersApi.search(searchQuery);
        setSearchResults(data.users || []);
      } catch (e) {}
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFollow = async (userId: number) => {
    try {
      const res = await messagesApi.followUser(userId);
      if (res.status === "success") {
        setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, request_status: res.follow_status } : u));
        toast.success(res.follow_status === "accepted" ? "Following!" : "Request sent!");
      }
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  return (
    <div style={{ padding: "0 24px 24px", maxWidth: 1200, margin: "0 auto" }}>
      
      {/* ── Header Area ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(to right, #fff, rgba(255,255,255,0.5))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>Idea Engine</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 4 }}>Neural feed of collective intelligence</p>
        </div>
        
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <button 
            onClick={() => setActiveTab("global")}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              background: activeTab === "global" ? "rgba(255,255,255,0.08)" : "transparent",
              color: activeTab === "global" ? "white" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s"
            }}
          >
            <Globe size={16} /> Global
          </button>
          <button 
            onClick={() => setActiveTab("network")}
            style={{ 
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              background: activeTab === "network" ? "rgba(255,255,255,0.08)" : "transparent",
              color: activeTab === "network" ? "white" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s"
            }}
          >
            <Users size={16} /> My Network
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 320px", gap: 32, alignItems: "start" }}>
        
        {/* ── Left Profile Column ── */}
        <div style={{ position: "sticky", top: 100 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 24, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to bottom right, #8B5CF6, #06B6D4)", opacity: 0.2 }} />
            
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "4px solid rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "white" }}>
                {user?.name?.[0].toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>{user?.name}</h3>
              <p style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700, margin: "2px 0 0" }}>@{user?.username || "identity_pending"}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{stats.ideas_shared}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Ideas</div>
              </div>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{stats.contributions}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Score</div>
              </div>
            </div>

            <button style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              View Profile
            </button>
          </div>

          <div style={{ marginTop: 24, padding: "0 12px" }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Trending Topics</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["#SaaS", "#AI_Agent", "#Robotics", "#Fintech", "#Neural", "#CleanTech"].map(tag => (
                <span key={tag} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600, cursor: "pointer" }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center Feed Column ── */}
        <div style={{ minWidth: 0 }}>
          {/* Post Composer */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24, padding: "20px 24px", marginBottom: 32, backdropFilter: "blur(20px)"
          }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Plus size={20} color="#8B5CF6" />
              </div>
              <textarea
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder="Synchronize your latest idea with the collective brain..."
                rows={2}
                style={{
                  width: "100%", background: "none", border: "none", outline: "none",
                  color: "white", fontSize: 16, fontFamily: "inherit",
                  resize: "none", padding: "10px 0"
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{ background: "rgba(255,255,255,0.03)", border: "none", padding: 8, borderRadius: 10, cursor: "pointer" }}><Plus size={18} color="rgba(255,255,255,0.4)" /></button>
                <button style={{ background: "rgba(255,255,255,0.03)", border: "none", padding: 8, borderRadius: 10, cursor: "pointer" }}><Globe size={18} color="rgba(255,255,255,0.4)" /></button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePost}
                disabled={!newIdea.trim()}
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "white",
                  border: "none", borderRadius: 12, padding: "10px 24px", fontWeight: 800, fontSize: 14,
                  cursor: newIdea.trim() ? "pointer" : "not-allowed", opacity: newIdea.trim() ? 1 : 0.5,
                  boxShadow: "0 8px 16px -4px rgba(139, 92, 246, 0.4)"
                }}
              >
                Share Idea
              </motion.button>
            </div>
          </div>

          {/* Ideas Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ height: 200, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 2s infinite" }} />
              ))
            ) : ideas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 40px", background: "rgba(255,255,255,0.02)", borderRadius: 32, border: "1px dotted rgba(255,255,255,0.1)" }}>
                <BrainCircuit size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                <h3 style={{ color: "white", fontSize: 18, fontWeight: 800 }}>No neural activity yet</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, maxWidth: 300, margin: "8px auto 0" }}>Start following creators or switch to Global to see what's happening.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {ideas.map((idea, idx) => (
                  <motion.div 
                    key={idea.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 24, padding: 24, position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: idea.user_avatar ? `url(${idea.user_avatar}) center/cover` : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>
                          {!idea.user_avatar && (idea.user_name?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: "white" }}>{idea.user_name}</span>
                            <CheckCircle size={14} color="#06B6D4" fill="rgba(6,182,212,0.1)" />
                          </div>
                          <div style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 700 }}>@{idea.user_username || "tulasi_engineer"}</div>
                        </div>
                      </div>
                      <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer" }}>
                        <MoreHorizontal size={20} />
                      </button>
                    </div>

                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: "0 0 24px", fontWeight: 500 }}>
                      {idea.content}
                    </p>

                    <div style={{ display: "flex", gap: 32, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
                      <button 
                        onClick={() => handleLike(idea.id)}
                        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: idea.is_liked_by_me ? "#F43F5E" : "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700 }}
                      >
                        <Heart size={20} fill={idea.is_liked_by_me ? "#F43F5E" : "none"} strokeWidth={idea.is_liked_by_me ? 0 : 2} />
                        <span>{idea.likes_count}</span>
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700 }}>
                        <MessageCircle size={20} />
                        <span>{idea.comments_count}</span>
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700, marginLeft: "auto" }}>
                        <Share2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ── Right Discovery Column ── */}
        <div style={{ position: "sticky", top: 100 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Search size={18} color="rgba(255,255,255,0.3)" />
              <input
                type="text"
                placeholder="Discover engineers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", color: "white", width: "100%", fontSize: 14, fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Sparkles size={16} color="#06D6A0" />
              <h2 style={{ fontSize: 14, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>People to follow</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {searchLoading ? (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 20 }}>Scanning network...</div>
              ) : searchResults.length === 0 ? (
                // Suggestions placeholders when no search results
                <div style={{ opacity: 0.5 }}>
                   <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>Start typing to find engineers</p>
                </div>
              ) : searchResults.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: u.avatar ? `url(${u.avatar}) center/cover` : "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "white"
                    }}>
                      {!u.avatar && (u.name?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#8B5CF6", fontWeight: 700 }}>@{u.username}</div>
                    </div>
                  </div>

                  {u.request_status === "none" && (
                    <button
                      onClick={() => handleFollow(u.id)}
                      style={{ background: "white", color: "black", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 900, cursor: "pointer" }}
                    >
                      Follow
                    </button>
                  )}
                  {u.request_status === "pending" && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>Sent</span>
                  )}
                  {u.request_status === "accepted" && (
                    <CheckCircle size={18} color="#10B981" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: 24, padding: 16, textAlign: "center" }}>
             <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>Tulasi AI Semantic Social v4.0.1</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
