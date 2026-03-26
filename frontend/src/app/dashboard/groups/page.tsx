"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { groupApi, Group, GroupMessage } from "@/lib/api";

interface DisplayGroup extends Group {
  join_code: string;
  member_count: number;
  created_at: string;
}

interface DisplayMessage extends GroupMessage {
  user_id: number;
}

export default function GroupsPage() {
  const { data: session } = useSession();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const currentUserId = (session?.user as { id?: number, email?: string, name?: string, accessToken?: string })?.id;

  const [groups, setGroups] = useState<DisplayGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<DisplayGroup | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState<"create" | "join" | null>(null);
  const [modalInput, setModalInput] = useState({ name: "", description: "", code: "" });
  const [modalError, setModalError] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (token) fetchGroups();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeGroup && token) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 3000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeGroup]);

  const fetchGroups = async () => {
    try {
      const data = await groupApi.list(token);
      const fetchedGroups = data.groups as unknown as DisplayGroup[];
      setGroups(fetchedGroups || []);
      if (fetchedGroups?.length && !activeGroup) setActiveGroup(fetchedGroups[0]);
    } catch (e) {}
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!activeGroup ) return;
    try {
      const data = await groupApi.getMessages(activeGroup.id, token);
      setMessages((data.messages as unknown as DisplayMessage[]) || []);
    } catch (e) {}
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeGroup  || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await groupApi.sendMessage(activeGroup.id, content, token);
      setMessages(prev => [...prev, msg as unknown as DisplayMessage]);
    } catch (e) {}
    setSending(false);
  };

  const handleCreate = async () => {
    if (!modalInput.name.trim() ) return;
    setModalError("");
    try {
      const newGroup = await groupApi.create(modalInput.name, modalInput.description, token) as unknown as DisplayGroup;
      setGroups(prev => [...prev, { ...newGroup, member_count: 1 }]);
      setActiveGroup({ ...newGroup, member_count: 1 });
      setShowModal(null);
      setModalInput({ name: "", description: "", code: "" });
    } catch (e: unknown) {
      const error = e as Error;
      setModalError(error.message || "Failed to create group");
    }
  };

  const handleJoin = async () => {
    if (!modalInput.code.trim() ) return;
    setModalError("");
    try {
      const res = await groupApi.join(modalInput.code.trim().toUpperCase(), token);
      await fetchGroups();
      setShowModal(null);
      setModalInput({ name: "", description: "", code: "" });
    } catch (e: unknown) {
      const error = e as Error;
      setModalError(error.message || "Invalid join code");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", gap: 24 }}>

      {/* Left: Group List */}
      <div className="dash-card" style={{ width: 300, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>💬 Groups</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setShowModal("create"); setModalError(""); }}
              className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12, borderRadius: 8 }}>
              + Create
            </button>
            <button onClick={() => { setShowModal("join"); setModalError(""); }}
              className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12, borderRadius: 8 }}>
              Join
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : groups.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No groups yet</div>
              <div style={{ fontSize: 12 }}>Create one or join with a code</div>
            </div>
          ) : groups.map(g => (
            <div key={g.id} onClick={() => setActiveGroup(g)}
              style={{
                padding: "14px 18px", cursor: "pointer", transition: "all 0.15s",
                background: activeGroup?.id === g.id ? "rgba(108,99,255,0.12)" : "transparent",
                borderLeft: activeGroup?.id === g.id ? "3px solid var(--brand-primary)" : "3px solid transparent",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{g.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{g.member_count} members</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 6 }}>
                  {g.join_code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Chat */}
      <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        {activeGroup ? (
          <>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{activeGroup.name}</h3>
                {activeGroup.description && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{String(activeGroup.description)}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Join Code:
                </div>
                <button onClick={() => copyCode(activeGroup.join_code)}
                  style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", color: "#a78bfa", fontFamily: "monospace", fontWeight: 800, fontSize: 14, padding: "4px 12px", borderRadius: 8, cursor: "pointer", letterSpacing: 2 }}>
                  {activeGroup.join_code}
                </button>
                {copied && <span style={{ fontSize: 12, color: "var(--success)" }}>✓ Copied!</span>}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                    <div style={{ fontWeight: 600 }}>No messages yet</div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>Be the first to say something!</div>
                  </div>
                ) : messages.map(msg => {
                  const isMe = msg.user_id === currentUserId;
                  return (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      {!isMe && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, paddingLeft: 4 }}>{msg.user_name}</div>
                      )}
                      <div style={{
                        padding: "10px 16px", borderRadius: 16,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderTopLeftRadius: isMe ? 16 : 4,
                        background: isMe ? "linear-gradient(135deg, var(--brand-primary), #a78bfa)" : "var(--surface)",
                        color: "white", fontSize: 14, lineHeight: 1.5,
                        border: isMe ? "none" : "1px solid var(--border)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: isMe ? "right" : "left", padding: "0 4px" }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
              <input
                type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder={`Message #${activeGroup.name}...`}
                className="input-field"
                style={{ flex: 1, borderRadius: 24, padding: "12px 20px" }}
              />
              <button disabled={!input.trim() || sending} type="submit"
                className="btn btn-primary"
                style={{ width: 48, height: 48, borderRadius: 24, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>👥</div>
            <h3 style={{ marginBottom: 8 }}>Select a Group</h3>
            <p style={{ fontSize: 14, maxWidth: 300, textAlign: "center" }}>
              Create a group or join one with a 6-character code to start chatting.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="dash-card"
              style={{ width: 400, padding: 32, border: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
                {showModal === "create" ? "Create Group" : "Join Group"}
              </h2>

              {showModal === "create" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Group Name *</label>
                    <input value={modalInput.name} onChange={e => setModalInput(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. MERN Stack Builders"
                      className="input-field" style={{ width: "100%", padding: "10px 14px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Description (optional)</label>
                    <input value={modalInput.description} onChange={e => setModalInput(p => ({ ...p, description: e.target.value }))}
                      placeholder="What's this group about?"
                      className="input-field" style={{ width: "100%", padding: "10px 14px" }} />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Enter 6-Character Join Code</label>
                  <input value={modalInput.code} onChange={e => setModalInput(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="A7X92K"
                    maxLength={6}
                    className="input-field"
                    style={{ width: "100%", padding: "10px 14px", fontFamily: "monospace", fontSize: 20, letterSpacing: 4, textAlign: "center" }} />
                </div>
              )}

              {modalError && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
                  {modalError}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowModal(null)} className="btn btn-secondary" style={{ flex: 1, padding: "11px 0", borderRadius: 10 }}>Cancel</button>
                <button onClick={showModal === "create" ? handleCreate : handleJoin}
                  className="btn btn-primary" style={{ flex: 1, padding: "11px 0", borderRadius: 10 }}>
                  {showModal === "create" ? "Create Group" : "Join Group"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
