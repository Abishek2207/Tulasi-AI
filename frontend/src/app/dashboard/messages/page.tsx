"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { socketService } from "@/lib/socket";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import VoiceRoom from "@/components/voice/VoiceRoom";

interface User {
  id: number;
  name: string;
  email: string;
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
  const [inputObj, setInputObj] = useState("");
  const [loading, setLoading] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors"
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (err) { console.error("Group messages fetch failed:", err); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputObj.trim() || !(session?.user as any)?.id) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const plaintext = inputObj.trim(); setInputObj("");

    if (activeTab === "dm" && activeUser) {
      const currentUserId = (session?.user as any)?.id;
      const sharedCode = getSharedCode(currentUserId, activeUser.id);
      try {
        const { ciphertext, iv } = await encryptMessage(plaintext, sharedCode);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors",
          body: JSON.stringify({ receiver_id: activeUser.id, content: `${iv}:${ciphertext}` })
        });
        if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, { ...data.message, content: plaintext }]); }
      } catch (err) { console.error("DM failed:", err); }
    } else if (activeTab === "community" && activeGroup) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${activeGroup.id}/messages`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, credentials: "include", mode: "cors",
          body: JSON.stringify({ content: plaintext })
        });
        if (res.ok) { const data = await res.json(); setMessages(prev => [...prev, data]); }
      } catch (err) { console.error("Group Message failed:", err); }
    }
  };

  return (
    <div className="messages-container" style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>
      
      {/* Sidebar - User/Group List */}
      <div className="dash-card messages-sidebar" style={{ width: 320, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRight: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
          <button onClick={() => { setActiveTab("dm"); setMessages([]); setActiveGroup(null); if (users.length) setActiveUser(users[0]); }} 
            style={{ flex: 1, padding: "18px 16px", fontSize: 12, fontWeight: 900, transition: "0.3s", background: activeTab === "dm" ? "rgba(108,99,255,0.05)" : "transparent", borderBottom: activeTab === "dm" ? "3px solid var(--brand-primary)" : "3px solid transparent", color: activeTab === "dm" ? "white" : "var(--text-muted)", cursor: "pointer", border: "none", textTransform: "uppercase", letterSpacing: 1.5 }}>
            Direct ID
          </button>
          <button onClick={() => { setActiveTab("community"); setMessages([]); setActiveUser(null); fetchGroups(); }} 
            style={{ flex: 1, padding: "18px 16px", fontSize: 12, fontWeight: 900, transition: "0.3s", background: activeTab === "community" ? "rgba(16,185,129,0.05)" : "transparent", borderBottom: activeTab === "community" ? "3px solid #10B981" : "3px solid transparent", color: activeTab === "community" ? "white" : "var(--text-muted)", cursor: "pointer", border: "none", textTransform: "uppercase", letterSpacing: 1.5 }}>
            Orbit HUB
          </button>
        </div>
        
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
          <input
            type="text"
            placeholder={`Search ${activeTab === "dm" ? "users" : "groups"}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "white", fontSize: 13, outline: "none" }}
          />
        </div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div> :
           activeTab === "dm" ? (
             users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>No users found.</div> :
             users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
              <div key={u.id} onClick={() => setActiveUser(u)}
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: activeUser?.id === u.id ? "rgba(108,99,255,0.1)" : "transparent", borderLeft: activeUser?.id === u.id ? "3px solid var(--brand-primary)" : "3px solid transparent" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 20, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, border: "1px solid var(--border)" }}>{u.name.charAt(0).toUpperCase()}</div>
                <div>
                   <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                   <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.is_online ? "Online" : "Away"}</div>
                </div>
              </div>
            ))
           ) : (
             groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => (
              <div key={g.id} onClick={() => { setActiveGroup(g); fetchGroupMessages(g.id); }}
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: activeGroup?.id === g.id ? "rgba(108,99,255,0.1)" : "transparent", borderLeft: activeGroup?.id === g.id ? "3px solid var(--brand-primary)" : "3px solid transparent" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>#</div>
                <div>
                   <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                   <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{g.member_count} members</div>
                </div>
              </div>
            ))
           )
          }
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="dash-card messages-chat" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", background: "rgba(255,255,255,0.005)" }}>
        {activeUser || activeGroup ? (
          <>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.02)", backdropFilter: "blur(12px)" }}>
               <div style={{ width: 48, height: 48, borderRadius: activeUser ? 24 : 14, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, border: "1px solid rgba(255,255,255,0.1)", color: activeUser ? "var(--brand-primary)" : "#10B981", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                 {activeUser ? activeUser.name.charAt(0).toUpperCase() : "#"}
               </div>
               <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.01em" }}>{activeUser?.name || activeGroup?.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {activeUser ? "Private Encryption Active" : "Public Global Channel"}
                    </span>
                  </div>
               </div>
               {activeUser && (
                 <div style={{ display: "flex", gap: 12 }}>
                   <button onClick={() => setShowVoice(true)} className="btn btn-secondary" style={{ width: 40, height: 40, padding: 0, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)" }}>📞</button>
                 </div>
               )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {showVoice && activeUser && (
                 <VoiceRoom 
                   roomId={getSharedCode((session?.user as any)?.id, activeUser.id)}
                   userId={(session?.user as any)?.id}
                   userName={session?.user?.name || "User"}
                   onLeave={() => setShowVoice(false)}
                 />
              )}
              {messages.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                  <p>Start the conversation...</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = (msg.sender_id === (session?.user as any)?.id) || (msg.user_id === (session?.user as any)?.id);
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}
                    >
                      {!isMe && !activeUser && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 4 }}>{msg.user_name}</div>}
                      <div style={{ padding: "12px 16px", borderRadius: 16, background: isMe ? "var(--brand-primary)" : "var(--surface)", color: "white", fontSize: 14 }}>
                        {msg.content}
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: 20, borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
              <input type="text" value={inputObj} onChange={e => setInputObj(e.target.value)} placeholder="Type a message..." className="input-field" style={{ flex: 1, borderRadius: 24 }} />
              <button disabled={!inputObj.trim()} type="submit" className="btn btn-primary">➤</button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <h3>Select a conversation</h3>
          </div>
        )}
      </div>
    </div>
  );
}
