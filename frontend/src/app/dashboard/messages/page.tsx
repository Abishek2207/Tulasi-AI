"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

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

export default function MessagesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputObj, setInputObj] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (session) {
      fetchDirectory();
    }
  }, [session]);

  const connectWebSocket = () => {
    const token = (session?.user as any)?.accessToken;
    if (!token || socketRef.current?.readyState === WebSocket.OPEN) return;

    // Use absolute WSS URL for Render backend
    const wsUrl = `wss://tulasi-api.onrender.com/api/messages/ws/${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("✅ WebSocket Connected");
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          const newMsg = data.message;
          // Add to messages if it's from current active user or to current active user
          if (activeUser && (newMsg.sender_id === activeUser.id || newMsg.receiver_id === activeUser.id)) {
            setMessages(prev => {
              // Avoid duplicates (if we sent it and already added optimistically)
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket Disconnected. Retrying in 3s...");
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (err) => console.error("WebSocket Error:", err);
    socketRef.current = ws;
  };

  useEffect(() => {
    if (session) {
      connectWebSocket();
    }
    return () => {
      socketRef.current?.close();
    };
  }, [session, activeUser]);

  useEffect(() => {
    if (activeUser) {
      fetchMessages(activeUser.id);
    }
  }, [activeUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDirectory = async () => {
    const token = (session?.user as any)?.accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api-ldcw.onrender.com"}/api/messages/users/directory`, {
        headers: { Authorization: `Bearer ${token}` }
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
    const token = (session?.user as any)?.accessToken;
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api-ldcw.onrender.com"}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Message fetch failed:", err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputObj.trim() || !activeUser) return;

    const currentInput = inputObj;
    setInputObj("");

    const token = (session?.user as any)?.accessToken;
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://tulasi-api-ldcw.onrender.com"}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: activeUser.id, content: currentInput })
      });
      
      if (res.ok) {
        const data = await res.json();
        // The REST call will also trigger the receiver's WS, but we add it locally too
        setMessages(prev => [...prev, data.message]);
      }
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
      
      {/* Sidebar - User List */}
      <div className="dash-card" style={{ width: 320, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
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
                <div style={{ width: 40, height: 40, borderRadius: 20, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, border: "1px solid var(--border)" }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", position: "relative" }}>
        {activeUser ? (
          <>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, border: "1px solid var(--border)" }}>
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{activeUser.name}</h3>
                <span style={{ fontSize: 12, color: "var(--success)" }}>● Online</span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <button className="btn btn-secondary" style={{ padding: "8px 12px", borderRadius: 8 }}>📞</button>
                <button className="btn btn-secondary" style={{ padding: "8px 12px", borderRadius: 8 }}>📹</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <AnimatePresence>
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
                    <p>Say hello to {activeUser.name}!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === ((session?.user as any)?.id || 0);
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

    </div>
  );
}
