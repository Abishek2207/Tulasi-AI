"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { Send, Heart, MessageCircle, UserPlus, FileText, Search, CheckCircle } from "lucide-react";
// Removed unused api import

// For socket
// import { getSocket } from "@/lib/socket"; // Will check where socket is located

export default function FeedPage() {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [ideas, setIdeas] = useState<any[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/feed", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setIdeas(await res.json());
      }
    } catch (e) {
      console.error("Feed error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newIdea.trim()) return;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/feed/idea", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ content: newIdea })
      });
      if (res.ok) {
        const posted = await res.json();
        setIdeas([posted, ...ideas]);
        setNewIdea("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async (ideaId: number) => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/feed/${ideaId}/like`, {
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
    } catch (e) {
      console.error(e);
    }
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
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/social/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch (e) {}
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFollow = async (userId: number) => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/social/follow/${userId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, follow_status: data.status } : u));
      }
    } catch (e) {}
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto", display: "flex", gap: 32 }}>
      
      {/* ── Main Feed Column ── */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: "white" }}>Community Feed</h1>
        
        {/* Post Box */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16, padding: 20, marginBottom: 32
        }}>
          <textarea
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Share a startup idea, question, or thought..."
            rows={3}
            style={{
              width: "100%", background: "none", border: "none", outline: "none",
              color: "white", fontSize: 15, fontFamily: "var(--font-inter)",
              resize: "none"
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={handlePost}
              disabled={!newIdea.trim()}
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", color: "white",
                border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600,
                cursor: newIdea.trim() ? "pointer" : "not-allowed", opacity: newIdea.trim() ? 1 : 0.5
              }}
            >
              Post
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Loading feed...</div>
          ) : ideas.map(idea => (
            <motion.div key={idea.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: 20
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: idea.user_avatar ? `url(${idea.user_avatar}) center/cover` : "#333",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
                }}>
                  {!idea.user_avatar && idea.user_name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "white" }}>{idea.user_name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {new Date(idea.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 16 }}>
                {idea.content}
              </p>
              <div style={{ display: "flex", gap: 20, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                <button 
                  onClick={() => handleLike(idea.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: idea.is_liked_by_me ? "#F43F5E" : "rgba(255,255,255,0.5)" }}
                >
                  <Heart size={18} fill={idea.is_liked_by_me ? "#F43F5E" : "none"} />
                  <span>{idea.likes_count}</span>
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
                  <MessageCircle size={18} />
                  <span>{idea.comments_count}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Network Sidebar (User Search) ── */}
      <div style={{ width: 320, flexShrink: 0 }}>
        <div style={{ position: "sticky", top: 100 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>Discover</h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
            <Search size={18} color="rgba(255,255,255,0.4)" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: "none", border: "none", outline: "none", color: "white", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {searchLoading ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Searching...</div>
            ) : searchResults.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: 12, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: u.avatar ? `url(${u.avatar}) center/cover` : "#444",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold"
                  }}>
                    {!u.avatar && u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{u.role}</div>
                  </div>
                </div>

                {u.follow_status === "none" && (
                  <button
                    onClick={() => handleFollow(u.id)}
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Follow
                  </button>
                )}
                {u.follow_status === "pending" && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Requested</span>
                )}
                {u.follow_status === "accepted" && (
                  <span style={{ fontSize: 11, color: "#10B981" }}>Following</span>
                )}
              </div>
            ))}
            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                Keep typing...
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
