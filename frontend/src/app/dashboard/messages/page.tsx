"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { socketService } from "@/lib/socket";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { 
  Search, Send, Phone, Video, Info, MoreVertical, 
  Hash, User as UserIcon, ShieldCheck, Zap, Sparkles,
  ArrowLeft, Plus, Image as ImageIcon, Smile, Mic
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

interface Message {
  id: number;
  sender_id?: number;
  receiver_id?: number;
  user_id?: number;
  user_name?: string;
  content: string;
  created_at: string;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"dm" | "community">("dm");
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [activeGroup, setActiveGroup] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getSharedCode = (id1: number, id2: number) => {
    const ids = [id1, id2].sort((a, b) => a - b);
    return `DM_${ids[0]}_${ids[1]}`;
  };

  useEffect(() => {
    if (session) {
      fetchDirectory();
      fetchGroups();
    }
  }, [session]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    if (session && token) {
      socketService.connect(token);
      
      const handleNewDM = async (data: any) => {
        if (data.type === "new_message") {
          const newMsg = data.message;
          const currentUserId = (session?.user as any)?.id;
          if (activeUser && (newMsg.sender_id === activeUser.id || newMsg.receiver_id === activeUser.id)) {
            let content = newMsg.content;
            if (content.includes(":")) {
               const sharedCode = getSharedCode(currentUserId, activeUser.id);
               content = await decryptMessage(content, sharedCode);
            }
            const decryptedMsg = { ...newMsg, content };
            setMessages(prev => (prev.some(m => m.id === decryptedMsg.id) ? prev : [...prev, decryptedMsg]));
          }
        }
      };

      const handleNewGroupMsg = (data: any) => {
        if (data.type === "new_group_message" && activeGroup && data.message.group_id === activeGroup.id) {
          setMessages(prev => (prev.some(m => m.id === data.message.id) ? prev : [...prev, data.message]));
        }
      };

      socketService.on("new_direct_message", handleNewDM);
      socketService.on("new_group_message", handleNewGroupMsg);
      return () => {
        socketService.off("new_direct_message", handleNewDM);
        socketService.off("new_group_message", handleNewGroupMsg);
      };
    }
  }, [session, activeUser, activeGroup]);

  useEffect(() => {
    if (activeUser && activeTab === "dm") fetchMessages(activeUser.id);
  }, [activeUser, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDirectory = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/users/directory`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        if (data.users.length > 0 && !activeUser && activeTab === "dm") setActiveUser(data.users[0]);
      }
    } catch (err) { console.error("Directory fetch failed:", err); }
    setLoading(false);
  };

  const fetchGroups = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups);
        const global = data.groups.find((g: any) => g.name === "Global Community");
        if (global && activeTab === "community" && !activeGroup) {
            setActiveGroup(global);
            fetchGroupMessages(global.id);
        }
      }
    } catch (err) { console.error("Groups fetch failed:", err); }
  };

  const fetchMessages = async (userId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${userId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const currentUserId = (session?.user as any)?.id;
        const sharedCode = getSharedCode(currentUserId, userId);
        const decrypted = await Promise.all(data.messages.map(async (m: any) => {
          if (m.content.includes(":")) {
            const text = await decryptMessage(m.content, sharedCode);
            return { ...m, content: text };
          }
          return m;
        }));
        setMessages(decrypted);
      }
    } catch (err) { console.error("Message fetch failed:", err); }
  };

  const fetchGroupMessages = async (groupId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}/messages`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) { console.error("Group messages fetch failed:", err); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !(session?.user as any)?.id) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const plaintext = input.trim(); setInput("");

    if (activeTab === "dm" && activeUser) {
      const currentUserId = (session?.user as any)?.id;
      const sharedCode = getSharedCode(currentUserId, activeUser.id);
      try {
        const { ciphertext, iv } = await encryptMessage(plaintext, sharedCode);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ receiver_id: activeUser.id, content: `${iv}:${ciphertext}` })
        });
        if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, { ...data.message, content: plaintext }]); }
      } catch (err) { console.error("DM failed:", err); }
    } else if (activeTab === "community" && activeGroup) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${activeGroup.id}/messages`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content: plaintext })
        });
        if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data]); }
      } catch (err) { console.error("Group Message failed:", err); }
    }
  };

  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", gap: 0, background: "rgba(0,0,0,0.2)", borderRadius: 32, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
      
      {/* Sidebar */}
      <div style={{ width: 360, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.01)" }}>
        {/* Sidebar Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px" }}>Messages</h2>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Plus size={18} />
            </div>
          </div>
          
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input-field"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "12px 14px 12px 40px", borderRadius: 14, background: "rgba(255,255,255,0.04)", fontSize: 13, border: "1px solid rgba(255,255,255,0.05)" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setActiveTab("dm"); if (users.length) setActiveUser(users[0]); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", border: "none",
                background: activeTab === "dm" ? "white" : "rgba(255,255,255,0.03)",
                color: activeTab === "dm" ? "black" : "var(--text-secondary)", transition: "all 0.2s"
              }}>Direct</button>
            <button onClick={() => { setActiveTab("community"); fetchGroups(); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", border: "none",
                background: activeTab === "community" ? "white" : "rgba(255,255,255,0.03)",
                color: activeTab === "community" ? "black" : "var(--text-secondary)", transition: "all 0.2s"
              }}>Community</button>
          </div>
        </div>

        {/* User/Group List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }} className="custom-scrollbar">
          {activeTab === "dm" ? (
             users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
               <motion.div key={u.id} onClick={() => setActiveUser(u)} 
                 whileHover={{ background: "rgba(255,255,255,0.04)" }}
                 style={{ 
                   padding: "16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 4, transition: "0.2s",
                   background: activeUser?.id === u.id ? "rgba(255,255,255,0.06)" : "transparent",
                   border: activeUser?.id === u.id ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent"
                 }}>
                 <div style={{ position: "relative" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 24, background: "linear-gradient(45deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: 18 }}>{u.name.charAt(0).toUpperCase()}</div>
                    {u.is_online && <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, background: "#10B981", border: "2px solid #08080A" }} />}
                 </div>
                 <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "white" }}>{u.name}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>12m</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: 180 }}>Initializing career optimization sequence...</div>
                 </div>
               </motion.div>
             ))
          ) : (
            groups.map(g => (
              <motion.div key={g.id} onClick={() => { setActiveGroup(g); fetchGroupMessages(g.id); }}
                whileHover={{ background: "rgba(255,255,255,0.04)" }}
                style={{ 
                  padding: "16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 4, transition: "0.2s",
                  background: activeGroup?.id === g.id ? "rgba(255,255,255,0.06)" : "transparent",
                  border: activeGroup?.id === g.id ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent"
                }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                  <Hash size={24} />
                </div>
                <div>
                   <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>{g.name}</div>
                   <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{g.member_count || 0} members</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {(activeUser || activeGroup) ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.01)" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: activeUser ? 22 : 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "white", fontSize: 18, border: "1px solid rgba(255,255,255,0.1)" }}>
                    {activeUser ? activeUser.name.charAt(0).toUpperCase() : "#"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 900 }}>{activeUser?.name || activeGroup?.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: "#10B981" }} />
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>{activeUser ? "Private Encryption" : "Global Channel"}</span>
                    </div>
                  </div>
               </div>
               <div style={{ display: "flex", gap: 12 }}>
                  <div className="icon-btn" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Phone size={18} /></div>
                  <div className="icon-btn" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Video size={18} /></div>
                  <div className="icon-btn" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Info size={18} /></div>
               </div>
            </div>

            {/* Messages List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px" }} className="custom-scrollbar">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.length === 0 ? (
                  <div style={{ margin: "100px auto", textAlign: "center", maxWidth: 300 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#8B5CF6" }}><ShieldCheck size={32} /></div>
                    <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Encrypted Transmission</h4>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>Your messages are end-to-end encrypted. Not even Tulasi AI can read them.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = (msg.sender_id === (session?.user as any)?.id) || (msg.user_id === (session?.user as any)?.id);
                    const showName = !activeUser && !isMe;
                    return (
                      <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                        {showName && <div style={{ fontSize: 10, fontWeight: 900, color: "var(--brand-primary)", marginBottom: 4, marginLeft: 12, textTransform: "uppercase" }}>{msg.user_name}</div>}
                        <div style={{
                          padding: "12px 18px", borderRadius: isMe ? "22px 22px 4px 22px" : "22px 22px 22px 4px",
                          background: isMe ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "rgba(255,255,255,0.06)",
                          color: "white", fontSize: 14, fontWeight: 500, lineHeight: 1.5,
                          boxShadow: isMe ? "0 10px 20px rgba(139,92,246,0.2)" : "none",
                          border: isMe ? "none" : "1px solid rgba(255,255,255,0.05)"
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 6, fontWeight: 600 }}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div style={{ padding: "24px 32px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.01)" }}>
              <form onSubmit={sendMessage} style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.04)", padding: "8px 12px 8px 20px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", gap: 14, color: "var(--text-muted)" }}>
                   <Plus size={20} style={{ cursor: "pointer" }} />
                   <ImageIcon size={20} style={{ cursor: "pointer" }} />
                </div>
                <input
                  type="text"
                  placeholder="Ask for mentorship or message colleagues..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: 14, padding: "8px 0" }}
                />
                <div style={{ display: "flex", gap: 14, color: "var(--text-muted)", marginRight: 4 }}>
                   <Smile size={20} style={{ cursor: "pointer" }} />
                   <Mic size={20} style={{ cursor: "pointer" }} />
                </div>
                <button type="submit" disabled={!input.trim()}
                  style={{ width: 44, height: 44, borderRadius: 22, background: input.trim() ? "white" : "rgba(255,255,255,0.05)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s", cursor: input.trim() ? "pointer" : "default" }}>
                  <Send size={18} color={input.trim() ? "black" : "rgba(255,255,255,0.3)"} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
             <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
               style={{ width: 120, height: 120, borderRadius: 60, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, border: "1px solid rgba(255,255,255,0.05)" }}>
               <Sparkles size={48} color="rgba(139,92,246,0.3)" />
             </motion.div>
             <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Neural Messaging Hub</h2>
             <p style={{ color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.6, fontSize: 15 }}>Select a colleague or enter Orbit Hub to initialize career-critical transmissions.</p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .icon-btn:hover { background: rgba(255,255,255,0.1) !important; color: white; }
      `}</style>
    </div>
  );
}
