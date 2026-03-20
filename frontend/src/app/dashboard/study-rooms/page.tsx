"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { studyApi } from "@/lib/api";

interface Room {
  id: number;
  name: string;
  description: string;
  tag: string;
  color: string;
  active?: number;
}

interface Message {
  id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export default function StudyRoomsPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomTag, setNewRoomTag] = useState("General");
  const [timer, setTimer] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);

  const token = "";

  const fetchRooms = async () => {
    try {
      const data = await studyApi.rooms();
      setRooms(data.rooms || []);
    } catch (e) { console.error("Rooms fetch failed:", e); }
    finally { setLoading(false); }
  };

  const fetchMessages = async (roomId: number) => {
        try {
      const data = await studyApi.messages(roomId.toString(), token);
      setMessages(data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {}
  };

  useEffect(() => { fetchRooms(); }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      pollRef.current = setInterval(() => fetchMessages(activeRoom.id), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeRoom]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    else if (timer === 0) setIsTimerRunning(false);
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const joinRoom = async (room: Room) => {
    setActiveRoom(room);
    setMessages([]);
    if (token) {
       try {
         await studyApi.join(room.id.toString(), token);
       } catch (e) {}
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom ) return;
    setSending(true);
    try {
      await studyApi.sendMessage(activeRoom.id.toString(), chatInput.trim(), token);
      setChatInput("");
      fetchMessages(activeRoom.id);
    } catch (e) {}
    setSending(false);
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() ) return;
    try {
      const res = await studyApi.create({ name: newRoomName, description: newRoomDesc, tag: newRoomTag }, token);
      if (res) {
        setShowCreate(false);
        setNewRoomName(""); setNewRoomDesc(""); setNewRoomTag("General");
        fetchRooms();
      }
    } catch (e) {}
  };

  const COLORS = ["#FF6B6B", "#4ECDC4", "#6C63FF", "#FFD93D", "#43E97B", "#F7971E"];

  if (activeRoom) {
    return (
      <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>
        <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(90deg, ${activeRoom.color}15, transparent)` }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                <span style={{ color: activeRoom.color }}>#</span> {activeRoom.name}
              </h2>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{activeRoom.description}</div>
            </div>
            <button onClick={() => { setActiveRoom(null); clearInterval(pollRef.current); }} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8 }}>
              Leave Room
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                <div>No messages yet. Be the first to say hi!</div>
              </div>
            )}
            {messages.map((m) => {
              const isMe = m.user_name === (session?.user?.name || (session?.user as any)?.email?.split("@")[0]);
              return (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: isMe ? activeRoom.color : "white" }}>{m.user_name}</span>
                    {" · "}
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div style={{
                    background: isMe ? `${activeRoom.color}20` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isMe ? activeRoom.color + "40" : "rgba(255,255,255,0.08)"}`,
                    padding: "10px 16px", borderRadius: 16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderTopLeftRadius: isMe ? 16 : 4,
                    fontSize: 14, maxWidth: "80%",
                  }}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
            { <div style={{ flex: 1, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Sign in to send messages</div>}
            {token && <>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={`Message #${activeRoom.name}...`}
                className="input-field"
                style={{ flex: 1, padding: "12px 16px", borderRadius: 12 }}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!chatInput.trim() || sending}
                style={{ background: activeRoom.color, color: "white", padding: "0 24px", borderRadius: 12, border: "none", fontWeight: 700, cursor: "pointer", opacity: !chatInput.trim() ? 0.5 : 1 }}
              >
                {sending ? "..." : "Send"}
              </motion.button>
            </>}
          </form>
        </div>

        {/* Right sidebar */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Pomodoro */}
          <div className="dash-card" style={{ padding: 24, textAlign: "center" }}>
            <h3 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: 700, marginBottom: 12 }}>⏱ Pomodoro</h3>
            <div style={{ fontSize: 48, fontWeight: 900, color: activeRoom.color, marginBottom: 16 }}>{formatTime(timer)}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ flex: 1, padding: 10, background: isTimerRunning ? "rgba(255,255,255,0.1)" : activeRoom.color, color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button onClick={() => { setIsTimerRunning(false); setTimer(25 * 60); }} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 10, color: "white", cursor: "pointer" }}>↺</button>
            </div>
          </div>
          {/* Room info */}
          <div className="dash-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: 12 }}>Room</div>
            <div style={{ background: `${activeRoom.color}15`, border: `1px solid ${activeRoom.color}40`, borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontWeight: 700, color: activeRoom.color }}>{activeRoom.tag}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{activeRoom.description || "Public study room"}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Community <span className="gradient-text" style={{ background: "linear-gradient(135deg, #6C63FF, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Study Rooms</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Join live, synchronous study groups. Motivate each other, ask questions, and run shared focus timers.
        </p>
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: 36, width: 440, maxWidth: "90vw" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Create Study Room</h2>
              <form onSubmit={createRoom} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Room Name *</label>
                  <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="e.g. React Study Group" className="input-field" style={{ width: "100%", padding: "12px 16px", borderRadius: 10 }} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Description</label>
                  <input value={newRoomDesc} onChange={e => setNewRoomDesc(e.target.value)} placeholder="What will you be studying?" className="input-field" style={{ width: "100%", padding: "12px 16px", borderRadius: 10 }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 8 }}>Category</label>
                  <select value={newRoomTag} onChange={e => setNewRoomTag(e.target.value)} className="input-field" style={{ width: "100%", padding: "12px 16px", borderRadius: 10 }}>
                    {["General", "Interview", "Machine Learning", "Blockchain", "Startups", "Frontend", "Backend", "Data Science"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 12, borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "white", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2, padding: 12, borderRadius: 10, fontWeight: 700 }}>Create Room</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {loading && [1, 2, 3, 4].map(i => <div key={i} className="dash-card" style={{ height: 200, opacity: 0.3 }} />)}

        {rooms.map((room, i) => (
          <motion.div key={room.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="dash-card"
            style={{ padding: 24, cursor: "pointer", border: `1px solid ${room.color}30` }}
            onClick={() => joinRoom(room)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ background: `${room.color}20`, color: room.color, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{room.tag}</div>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: "#43E97B", boxShadow: "0 0 8px #43E97B" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{room.name}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>{room.description || "Join the active session."}</p>
            <button className="btn-primary" style={{ width: "100%", padding: "10px", borderRadius: 10, fontWeight: 700, background: room.color }}>
              Enter Room →
            </button>
          </motion.div>
        ))}

        {/* Create Room Card */}
        <motion.div whileHover={{ y: -5, scale: 1.02 }}
          className="dash-card"
          style={{ padding: 24, cursor: "pointer", border: "1px dashed rgba(255,255,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "transparent", minHeight: 200 }}
          onClick={() => setShowCreate(true)}
        >
          <div style={{ width: 56, height: 56, borderRadius: 28, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>➕</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Create Room</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Start a public study session.</p>
        </motion.div>
      </div>
    </div>
  );
}
