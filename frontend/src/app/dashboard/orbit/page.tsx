"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { activityApi } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { Wifi, Globe, Users, Zap, Sparkles, Send } from "lucide-react";

interface GlobalMessage {
  id: string;
  user_name: string;
  user_id: number;
  content: string;
  created_at: string;
  role?: string;
}

// ─── Orbit HUB: The Global Community Command Center ─────────────────────────
export default function OrbitHubPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const WELCOME_MSG: GlobalMessage = {
    id: "welcome",
    user_name: "Tulasi Orbit",
    user_id: 0,
    content: "🌌 Welcome to Orbit HUB — The global Tulasi AI community. Connect with thousands of students and professionals in real-time. All messages are visible to everyone online.",
    created_at: new Date().toISOString(),
    role: "system",
  };

  useEffect(() => {
    setMessages([WELCOME_MSG]);

    // Connect to socket and join the community room
    if (token) {
      socketService.connect(token);

      // Fetch live user count
      activityApi.getLeaderboard(token).then((data) => {
        setOnlineCount(data.leaderboard?.length || 0);
      }).catch(() => {});

      // Listen for community room messages
      const handler = (data: any) => {
        if (data.type === "community_message" || data.user_name) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      };
      socketService.on("community_message", handler);
      socketService.on("new_community_message", handler);

      return () => {
        socketService.off("community_message", handler);
        socketService.off("new_community_message", handler);
      };
    }
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic local update  
    const localMsg: GlobalMessage = {
      id: `local_${Date.now()}`,
      user_name: (session?.user as any)?.name || "You",
      user_id: currentUserId || 0,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);

    try {
      // Emit to community room via socket
      socketService.emit("community_message", {
        content: text,
        user_name: (session?.user as any)?.name || "User",
        user_id: currentUserId,
      });
    } catch (e) {}
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", gap: 20 }}>
      
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 24,
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          style={{
            position: "absolute", top: -40, right: -40,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(139,92,246,0.4)",
          }}>
            <Globe size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
              🌌 Orbit <span style={{ color: "#8B5CF6" }}>HUB</span>
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Global real-time community for Tulasi AI users
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            padding: "8px 16px", borderRadius: 30,
          }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }}
            />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#10B981" }}>LIVE</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(139,92,246,0.08)", padding: "8px 16px", borderRadius: 30,
            border: "1px solid rgba(139,92,246,0.2)",
          }}>
            <Users size={14} color="#8B5CF6" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#8B5CF6" }}>{onlineCount}+ Online</span>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, overflow: "hidden" }}>
        
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.user_id === currentUserId;
              const isSystem = msg.role === "system";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ alignSelf: isSystem ? "center" : isMe ? "flex-end" : "flex-start", maxWidth: isSystem ? "90%" : "75%" }}
                >
                  {isSystem ? (
                    <div style={{
                      padding: "12px 20px", borderRadius: 16,
                      background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                      fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 1.6,
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      {!isMe && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#8B5CF6", marginBottom: 4, paddingLeft: 4 }}>
                          {msg.user_name}
                        </div>
                      )}
                      <div style={{
                        padding: "12px 18px", borderRadius: 18,
                        borderBottomRightRadius: isMe ? 4 : 18,
                        borderTopLeftRadius: isMe ? 18 : 4,
                        background: isMe
                          ? "linear-gradient(135deg, #8B5CF6, #06B6D4)"
                          : "rgba(255,255,255,0.04)",
                        border: isMe ? "none" : "1px solid rgba(255,255,255,0.07)",
                        color: "white", fontSize: 14, lineHeight: 1.55,
                        boxShadow: isMe ? "0 4px 16px rgba(139,92,246,0.3)" : "none",
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: isMe ? "right" : "left", paddingLeft: 4 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} style={{
          padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: 12, background: "rgba(255,255,255,0.01)",
          backdropFilter: "blur(10px)",
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Broadcast a message to all Orbit users..."
            style={{
              flex: 1, padding: "13px 20px", borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white", outline: "none", fontSize: 14,
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || sending}
            style={{
              width: 50, height: 50, borderRadius: 14, border: "none",
              background: input.trim() ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "rgba(255,255,255,0.05)",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: input.trim() ? "0 4px 16px rgba(139,92,246,0.4)" : "none",
              transition: "all 0.2s",
            }}
          >
            <Send size={20} color="white" />
          </motion.button>
        </form>
      </div>

      {/* Info Bar */}
      <div style={{
        display: "flex", gap: 16, flexWrap: "wrap",
        padding: "12px 20px", borderRadius: 16,
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <Zap size={14} color="#8B5CF6" />
          Powered by <strong style={{ color: "white" }}>Tulasi AI Neural Network</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <Sparkles size={14} color="#10B981" />
          <span>Messages broadcast globally to the Orbit community room</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <Wifi size={14} color="#06B6D4" />
          <span>Real-time via Socket.io WebSocket</span>
        </div>
      </div>
    </div>
  );
}
