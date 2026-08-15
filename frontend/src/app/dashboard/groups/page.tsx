"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Globe2, Hash, Loader2, MessageSquare, Lock } from "lucide-react";
import { groupsApi, messagesApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import io, { Socket } from "socket.io-client";

export default function OrbitHubPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<any[]>([]);
  const [dmUsers, setDmUsers] = useState<any[]>([]);
  const [activeChatType, setActiveChatType] = useState<"group" | "dm">("group");
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeDmUserId, setActiveDmUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await groupsApi.list();
        if (res.groups && res.groups.length > 0) {
          setGroups(res.groups);
          setActiveGroupId(res.groups[0].id);
        }
        const dmRes = await messagesApi.getDirectory();
        if (dmRes.users) {
          setDmUsers(dmRes.users);
        }
      } catch (err) {
        console.error("Failed to load hub data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Socket.io Connection & Event Listeners
  useEffect(() => {
    if (!session?.user?.accessToken) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const socket = io(apiUrl, {
      query: { token: session.user.accessToken },
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("Connected to Orbit HUB WebSocket");
      if (activeChatType === "group" && activeGroupId) {
        socket.emit("join_group", { group_id: activeGroupId });
      }
    });

    socket.on("new_group_message", (data: any) => {
      if (activeChatType === "group" && activeGroupId) {
        // Assume data contains { group_id, message } based on backend
        setMessages((prev) => [...prev, data.message || data]);
      }
    });

    socket.on("new_direct_message", (data: any) => {
      if (activeChatType === "dm" && activeDmUserId) {
        const msg = data.message || data;
        if (msg.sender_id === activeDmUserId || msg.receiver_id === activeDmUserId || msg.sender_id === session.user?.id) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.accessToken, activeChatType, activeGroupId, activeDmUserId, session?.user?.id]);

  // Handle joining/leaving groups on active group change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    
    if (activeChatType === "group" && activeGroupId) {
      socket.emit("join_group", { group_id: activeGroupId });
    }
  }, [activeChatType, activeGroupId]);

  // Fetch initial messages for active chat
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (activeChatType === "group" && activeGroupId) {
          const res = await groupsApi.messages(activeGroupId);
          setMessages(res.messages || []);
        } else if (activeChatType === "dm" && activeDmUserId) {
          const res = await messagesApi.getMessages(activeDmUserId);
          setMessages(res.messages || []);
        }
      } catch (err) {
        console.error("Failed to fetch initial messages:", err);
      }
    };

    fetchMessages();
  }, [activeChatType, activeGroupId, activeDmUserId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    if (activeChatType === "group" && !activeGroupId) return;
    if (activeChatType === "dm" && !activeDmUserId) return;
    
    const textToSend = input.trim();
    setInput("");
    setSending(true);

    try {
      if (activeChatType === "group" && activeGroupId) {
        await groupsApi.sendMessage(activeGroupId, textToSend, "");
        // Message will be added to UI via socket broadcast
      } else if (activeChatType === "dm" && activeDmUserId) {
        const res = await messagesApi.sendMessage(activeDmUserId, textToSend);
        // Direct messages aren't broadcast via socket in this simple implementation yet, so manually append back to the sender
        if (res.message) {
          setMessages(prev => {
            if (!prev.find(m => m.id === res.message.id)) {
              return [...prev, res.message];
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error("Failed to send:", err);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeDmUser = dmUsers.find(u => u.id === activeDmUserId);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
      
      {/* Sidebar: Groups List */}
      <div style={{ width: 280, background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
          <Globe2 size={20} color="#8B5CF6" />
          Orbit HUB
        </h2>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, padding: "0 8px", marginTop: 8 }}>
            Groups
          </div>
          {groups.map(group => {
            const isActive = activeChatType === "group" && group.id === activeGroupId;
            return (
              <button
                key={group.id}
                onClick={() => { setActiveChatType("group"); setActiveGroupId(group.id); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: isActive ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.1))" : "transparent",
                  border: isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                  borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isActive ? "#6366F1" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white"
                }}>
                  <Hash size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "white" : "rgba(255,255,255,0.7)" }}>
                    {group.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={10} /> {group.member_count} members
                  </div>
                </div>
              </button>
            );
          })}

          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, padding: "0 8px", marginTop: 16 }}>
            Direct Messages
          </div>
          {dmUsers.map(user => {
            const isActive = activeChatType === "dm" && user.id === activeDmUserId;
            return (
              <button
                key={user.id}
                onClick={() => { setActiveChatType("dm"); setActiveDmUserId(user.id); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: isActive ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))" : "transparent",
                  border: isActive ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                  borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: isActive ? "#10B981" : "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white"
                }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
                  ) : (
                    <MessageSquare size={18} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isActive ? "white" : "rgba(255,255,255,0.7)" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Lock size={10} /> E2E Encrypted
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {activeChatType === "group" ? (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                <Hash size={18} color="#8B5CF6" />
                {activeGroup?.name || "Select a group"}
              </h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                {activeGroup?.description || "Connect with the community in real-time."}
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                {activeDmUser?.avatar ? (
                  <img src={activeDmUser.avatar} alt={activeDmUser.name} style={{ width: 24, height: 24, borderRadius: "50%" }} />
                ) : (
                  <MessageSquare size={18} color="#10B981" />
                )}
                {activeDmUser?.name || "Select a user"}
              </h3>
              <p style={{ fontSize: 12, color: "rgba(16,185,129,0.8)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <Lock size={12} /> Secure E2E Encrypted Connection
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 ? (
            <div style={{ margin: "auto", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
              No messages yet. Say hello! 👋
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.user_id === session?.user?.id || msg.user_name === session?.user?.name;
              return (
                <div key={idx} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start"
                }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, padding: "0 4px" }}>
                    {isMe ? "You" : (msg.user_name || activeDmUser?.name)} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{
                    background: isMe 
                      ? (activeChatType === "dm" ? "linear-gradient(135deg, #059669, #10B981)" : "linear-gradient(135deg, #4F46E5, #6366F1)") 
                      : "rgba(255,255,255,0.05)",
                    border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
                    color: "white", padding: "12px 18px",
                    borderRadius: 20,
                    borderBottomRightRadius: isMe ? 4 : 20,
                    borderBottomLeftRadius: isMe ? 20 : 4,
                    maxWidth: "75%", fontSize: 14, lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
          <div style={{
            display: "flex", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 24, padding: "8px 8px 8px 24px", transition: "all 0.2s"
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={activeChatType === "group" ? `Message #${activeGroup?.name || "general"}...` : `Private message to ${activeDmUser?.name || "user"}...`}
              disabled={(activeChatType === "group" && !activeGroupId) || (activeChatType === "dm" && !activeDmUserId)}
              style={{
                flex: 1, background: "transparent", border: "none", color: "white", outline: "none",
                fontSize: 15, fontFamily: "var(--font-inter)"
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending || (activeChatType === "group" && !activeGroupId) || (activeChatType === "dm" && !activeDmUserId)}
              style={{
                width: 44, height: 44, borderRadius: 22, 
                background: activeChatType === "dm" ? "linear-gradient(135deg, #059669, #10B981)" : "linear-gradient(135deg, #4F46E5, #EC4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", border: "none", cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                opacity: input.trim() && !sending ? 1 : 0.5,
                transition: "all 0.2s"
              }}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
