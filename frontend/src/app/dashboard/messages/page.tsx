"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { socketService } from "@/lib/socket";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
}

import { encryptMessage, decryptMessage } from "@/lib/crypto";
import VoiceRoom from "@/components/voice/VoiceRoom";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputObj, setInputObj] = useState("");
  const [loading, setLoading] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derived shared secret for 1:1 chat (min(id1,id2)-max(id1,id2))
  const getSharedCode = (id1: number, id2: number) => {
    const ids = [id1, id2].sort((a, b) => a - b);
    return `DM_${ids[0]}_${ids[1]}`;
  };

  useEffect(() => {
    if (session) {
      fetchDirectory();
    }
  }, [session]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    if (session && token) {
      socketService.connect(token);
      
      const handleNewMessage = async (data: any) => {
        if (data.type === "new_message") {
          const newMsg = data.message;
          const currentUserId = (session?.user as any)?.id;
          
          if (activeUser && (newMsg.sender_id === activeUser.id || newMsg.receiver_id === activeUser.id)) {
            // Decrypt on arrival
            let content = newMsg.content;
            if (content.includes(":")) {
               const sharedCode = getSharedCode(currentUserId, activeUser.id);
               content = await decryptMessage(content, sharedCode);
            }
            
            const decryptedMsg = { ...newMsg, content };
            setMessages(prev => {
              if (prev.some(m => m.id === decryptedMsg.id)) return prev;
              return [...prev, decryptedMsg];
            });
          }
        }
      };

      socketService.on("new_direct_message", handleNewMessage);
      return () => {
        socketService.off("new_direct_message", handleNewMessage);
      };
    }
  }, [session, activeUser]);

  useEffect(() => {
    if (activeUser && (session?.user as any)?.id) {
      fetchMessages(activeUser.id);
    }
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDirectory = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
        try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/users/directory`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        if (data.users.length > 0 && !activeUser) setActiveUser(data.users[0]);
      }
    } catch (err) {
      console.error("Directory fetch failed:", err);
    }
    setLoading(false);
  };

  const fetchMessages = async (userId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const currentUserId = (session?.user as any)?.id;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${userId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
      });
      if (res.ok) {
        const data = await res.json();
        const sharedCode = getSharedCode(currentUserId, userId);
        
        // Decrypt historical messages
        const decrypted = await Promise.all(
          data.messages.map(async (m: any) => {
            if (m.content.includes(":")) {
              const text = await decryptMessage(m.content, sharedCode);
              return { ...m, content: text };
            }
            return m;
          })
        );
        setMessages(decrypted);
      }
    } catch (err) {
      console.error("Message fetch failed:", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputObj.trim() || !activeUser || !(session?.user as any)?.id) return;

    const plaintext = inputObj.trim();
    setInputObj("");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const currentUserId = (session?.user as any)?.id;
    const sharedCode = getSharedCode(currentUserId, activeUser.id);
    
    try {
      // 🔐 Encrypt before sending
      const { ciphertext, iv } = await encryptMessage(plaintext, sharedCode);
      const encryptedPayload = `${iv}:${ciphertext}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }, credentials: "include", mode: "cors",
        body: JSON.stringify({ receiver_id: activeUser.id, content: encryptedPayload })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Add locally with plaintext for immediate UI feedback
        setMessages(prev => [...prev, { ...data.message, content: plaintext }]);
      }
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div className="messages-container" style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
      
      {/* Sidebar - User List */}
      <div className="dash-card messages-sidebar" style={{ width: 320, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Chats</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No other users found.</div>
          ) : (
            users.map(u => (
              <div 
                key={u.id} 
                onClick={() => setActiveUser(u)}
                style={{ 
                  padding: "16px 20px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  cursor: "pointer",
                  background: activeUser?.id === u.id ? "rgba(108,99,255,0.1)" : "transparent",
                  borderLeft: activeUser?.id === u.id ? "3px solid var(--brand-primary)" : "3px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, border: "1px solid var(--border)" }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  {(u as any).is_online && (
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "60%", background: "#10B981", border: "2px solid var(--bg-primary)" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {(u as any).is_online ? "Active Now" : (u as any).last_seen ? `Seen ${new Date((u as any).last_seen).toLocaleDateString()}` : "Offline"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="dash-card messages-chat" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", position: "relative" }}>
        {activeUser ? (
          <>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, border: "1px solid var(--border)" }}>
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{activeUser.name}</h3>
                  <span style={{ fontSize: 10, background: "rgba(16,185,129,0.1)", color: "#10B981", padding: "2px 8px", borderRadius: 12, fontWeight: 700, border: "1px solid rgba(16,185,129,0.2)" }}>🔐 E2E Encrypted</span>
                </div>
                {(activeUser as any).is_online ? (
                  <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700 }}>● Online</span>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Away</span>
                )}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <button onClick={() => setShowVoice(true)} className="btn btn-secondary" style={{ padding: "8px 12px", borderRadius: 8 }}>📞</button>
                <button onClick={() => setShowVoice(true)} className="btn btn-secondary" style={{ padding: "8px 12px", borderRadius: 8 }}>📹</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimatePresence>
                {showVoice && activeUser && (
                  <VoiceRoom 
                    roomId={getSharedCode((session?.user as any)?.id, activeUser.id)}
                    userId={(session?.user as any)?.id}
                    userName={session?.user?.name || "User"}
                    onLeave={() => setShowVoice(false)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
                    <p>Say hello to {activeUser.name}!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === ((session?.user as { id?: number, email?: string, name?: string, accessToken?: string })?.id || 0);
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}
                      >
                        <div style={{
                          padding: "12px 16px",
                          borderRadius: 16,
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderTopLeftRadius: isMe ? 16 : 4,
                          background: isMe ? "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))" : "var(--surface)",
                          color: "white",
                          fontSize: 14,
                          lineHeight: 1.5,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          border: isMe ? "none" : "1px solid var(--border)"
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textAlign: isMe ? "right" : "left", padding: "0 4px" }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 12, background: "rgba(255,255,255,0.02)" }}>
              <input
                type="text"
                value={inputObj}
                onChange={e => setInputObj(e.target.value)}
                placeholder="Type a message..."
                className="input-field"
                style={{ flex: 1, borderRadius: 24, padding: "12px 20px" }}
              />
              <button disabled={!inputObj.trim()} type="submit" className="btn btn-primary" style={{ width: 48, height: 48, borderRadius: 24, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>💬</div>
            <h3>Select a conversation</h3>
            <p>Choose an active chat or start a new one.</p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .messages-container {
            flex-direction: column !important;
            height: auto !important;
          }
          .messages-sidebar {
            width: 100% !important;
            height: 300px !important;
          }
          .messages-chat {
            height: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}
