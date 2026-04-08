"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { messagesApi, API_URL } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { Search, Send, ArrowLeft, Circle, Check, CheckCheck, Trash2, X, UserPlus } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface DmUser {
  id: number;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  role?: string;
  is_online: boolean;
  last_seen?: string;
  request_status: string;
  is_initiator: boolean;
  last_message?: { content: string | null; media_type: string | null; created_at: string | null; sender_id: number | null } | null;
}

interface DmMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  media_type?: string;
  media_url?: string;
  reply_to_id?: number;
  reactions?: { user_id: number; emoji: string; user_name: string }[];
  is_seen: boolean;
  seen_at?: string;
  created_at: string;
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
}

function timeAgo(dateStr: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ user, size = 44 }: { user: { name: string; avatar?: string; id: number; is_online?: boolean }; size?: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} style={{ width: size, height: size, borderRadius: size * 0.35, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: size * 0.35, background: `linear-gradient(135deg, hsl(${(user.id * 67) % 360}, 65%, 50%), hsl(${(user.id * 67 + 40) % 360}, 75%, 60%))`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: size * 0.38, color: "white" }}>
          {user.name[0].toUpperCase()}
        </div>
      )}
      {user.is_online !== undefined && (
        <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: user.is_online ? "#22C55E" : "rgba(255,255,255,0.2)", border: "2px solid #0D0D15" }} />
      )}
    </div>
  );
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id as number | undefined;

  const [users, setUsers] = useState<DmUser[]>([]);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState<DmUser | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<number, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketReady = useRef(false);

  // Load user directory
  useEffect(() => {
    loadDirectory();
  }, []);

  // Join socket + listen for realtime DMs
  useEffect(() => {
    const token = getToken();
    if (!token || socketReady.current) return;
    socketReady.current = true;

    socketService.connect(token);

    const handleNewDm = (data: any) => {
      if (data.type === "new_message") {
        const msg: DmMessage = data.message;
        // If we're looking at this conversation, append
        setActiveUser(prev => {
          if (prev && (msg.sender_id === prev.id || msg.receiver_id === prev.id)) {
            setMessages(m => {
              if (m.find(x => x.id === msg.id)) return m;
              return [...m, msg];
            });
            // Mark seen
            messagesApi.markAsSeen(msg.sender_id).catch(() => {});
          } else {
            // Increment unread badge
            setUnreadMap(u => ({ ...u, [msg.sender_id]: (u[msg.sender_id] || 0) + 1 }));
            // Update last message preview in directory
            setUsers(u => u.map(usr => usr.id === msg.sender_id
              ? { ...usr, last_message: { content: msg.content, media_type: msg.media_type || null, created_at: msg.created_at, sender_id: msg.sender_id } }
              : usr
            ));
          }
          return prev;
        });
      }
    };

    const handleSeen = (data: { receiver_id: number; seen_at: string }) => {
      setMessages(prev => prev.map(m =>
        m.receiver_id === data.receiver_id ? { ...m, is_seen: true, seen_at: data.seen_at } : m
      ));
    };

    const handleDeleted = (data: { message_id: number }) => {
      setMessages(prev => prev.filter(m => m.id !== data.message_id));
    };

    socketService.on("direct_message", handleNewDm);
    socketService.on("message_seen", handleSeen);
    socketService.on("message_deleted", handleDeleted);

    return () => {
      socketService.off("direct_message", handleNewDm);
      socketService.off("message_seen", handleSeen);
      socketService.off("message_deleted", handleDeleted);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const data = await messagesApi.getDirectory();
      setUsers(data.users as DmUser[]);
    } catch {}
    setLoadingDirectory(false);
  };

  const openConversation = async (user: DmUser) => {
    setActiveUser(user);
    setLoadingMessages(true);
    setMessages([]);
    // Clear unread badge
    setUnreadMap(u => ({ ...u, [user.id]: 0 }));
    try {
      const data = await messagesApi.getMessages(user.id);
      setMessages(data.messages as DmMessage[]);
      // Mark as seen
      await messagesApi.markAsSeen(user.id).catch(() => {});
    } catch {}
    setLoadingMessages(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeUser || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic UI
    const tempId = Date.now();
    const optimistic: DmMessage = {
      id: tempId, sender_id: currentUserId!, receiver_id: activeUser.id,
      content: text, is_seen: false, created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await messagesApi.sendMessage(activeUser.id, text);
      const realMsg = res.message as DmMessage;
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
      // Update last_message in sidebar
      setUsers(prev => prev.map(u => u.id === activeUser.id
        ? { ...u, last_message: { content: text, media_type: null, created_at: realMsg.created_at, sender_id: currentUserId! } }
        : u
      ));
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (msgId: number) => {
    try {
      await messagesApi.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch {}
  };

  const filteredUsers = search
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  // Sort: conversations with messages first, then by last message time
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.last_message?.created_at && b.last_message?.created_at) {
      return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime();
    }
    if (a.last_message && !b.last_message) return -1;
    if (!a.last_message && b.last_message) return 1;
    return 0;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
      {/* Sidebar */}
      <div className="dash-card" style={{ width: 320, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontSize: 17, fontWeight: 900, margin: 0, flex: 1 }}>💬 Messages</h2>
            <motion.button whileHover={{ scale: 1.1 }} onClick={loadDirectory}
              style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              ↻
            </motion.button>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..."
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "white", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* User List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingDirectory ? (
            <div style={{ padding: 20 }}>
              {[1, 2, 3, 4].map(i => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  style={{ height: 60, borderRadius: 14, background: "rgba(255,255,255,0.03)", marginBottom: 8 }} />
              ))}
            </div>
          ) : sortedUsers.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>No users found</div>
            </div>
          ) : sortedUsers.map(user => {
            const unread = unreadMap[user.id] || 0;
            const isActive = activeUser?.id === user.id;
            return (
              <motion.div key={user.id} whileHover={{ backgroundColor: isActive ? undefined : "rgba(255,255,255,0.03)" }}
                onClick={() => openConversation(user)}
                style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "all 0.15s", background: isActive ? "rgba(108,99,255,0.1)" : "transparent", borderLeft: isActive ? "3px solid var(--brand-primary)" : "3px solid transparent" }}>
                <Avatar user={{ ...user, is_online: user.is_online }} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0, marginLeft: 6 }}>
                      {user.last_message?.created_at ? timeAgo(user.last_message.created_at) : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                      {user.last_message?.content
                        ? (user.last_message.sender_id === currentUserId ? "You: " : "") + (user.last_message.media_type === "image" ? "📷 Photo" : user.last_message.content)
                        : user.is_online ? "🟢 Online" : "Send a message"}
                    </div>
                    {unread > 0 && (
                      <div style={{ background: "var(--brand-primary)", color: "white", fontSize: 11, fontWeight: 900, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                        {unread}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.02)" }}>
              <button onClick={() => setActiveUser(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
                <ArrowLeft size={18} />
              </button>
              <Avatar user={activeUser} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "white" }}>{activeUser.name}</div>
                <div style={{ fontSize: 12, color: activeUser.is_online ? "#22C55E" : "var(--text-muted)", fontWeight: 600 }}>
                  {activeUser.is_online ? "● Online" : activeUser.last_seen ? `Last seen ${timeAgo(activeUser.last_seen)} ago` : "Offline"}
                </div>
              </div>
              {activeUser.request_status === "pending" && !activeUser.is_initiator && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => messagesApi.handleRequest(activeUser.id, "accepted").then(loadDirectory)}
                    style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                    Accept
                  </button>
                  <button onClick={() => messagesApi.handleRequest(activeUser.id, "rejected").then(loadDirectory)}
                    style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#F43F5E", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                    Decline
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {loadingMessages ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 36, height: 36, border: "3px solid rgba(108,99,255,0.2)", borderTopColor: "var(--brand-primary)", borderRadius: "50%" }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Start the conversation</div>
                  <div style={{ fontSize: 13 }}>Say hi to {activeUser.name}!</div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id === currentUserId;
                    const showTime = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i - 1]?.created_at).getTime()) > 300000;
                    return (
                      <div key={msg.id}>
                        {showTime && (
                          <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", margin: "8px 0" }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        )}
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                          style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}
                          className="group">
                          {!isMe && <Avatar user={activeUser} size={28} />}
                          <div style={{ maxWidth: "68%", position: "relative" }}>
                            <div style={{ padding: "10px 16px", borderRadius: 18, borderBottomRightRadius: isMe ? 4 : 18, borderTopLeftRadius: isMe ? 18 : 4, background: isMe ? "linear-gradient(135deg, var(--brand-primary), #a78bfa)" : "rgba(255,255,255,0.06)", color: "white", fontSize: 14, lineHeight: 1.5, border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
                              {msg.content}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMe && (
                                msg.is_seen
                                  ? <CheckCheck size={12} color="#22C55E" />
                                  : <Check size={12} color="var(--text-muted)" />
                              )}
                            </div>
                          </div>
                          {isMe && (
                            <motion.button initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                              onClick={() => deleteMessage(msg.id)}
                              style={{ background: "rgba(244,63,94,0.15)", border: "none", borderRadius: 8, padding: "4px 6px", color: "#F43F5E", cursor: "pointer", display: "flex", alignItems: "center", opacity: 0, transition: "opacity 0.2s" }}
                              className="opacity-0 group-hover:opacity-100">
                              <Trash2 size={12} />
                            </motion.button>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder={`Message ${activeUser.name}...`}
                style={{ flex: 1, padding: "12px 18px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              <motion.button type="submit" disabled={!input.trim() || sending} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ width: 44, height: 44, borderRadius: 22, background: !input.trim() ? "rgba(108,99,255,0.3)" : "var(--brand-primary)", border: "none", color: "white", cursor: !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {sending ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                    style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%" }} />
                ) : <Send size={16} />}
              </motion.button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ fontSize: 64, marginBottom: 24 }}>💬</motion.div>
            <h3 style={{ fontWeight: 900, fontSize: 20, color: "white", marginBottom: 8 }}>Your Messages</h3>
            <p style={{ fontSize: 14, maxWidth: 280, textAlign: "center", lineHeight: 1.6 }}>
              Connect with the TulasiAI community. Pick a person from the left to start chatting.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .messages-container { flex-direction: column !important; }
        }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
