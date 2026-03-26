"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { studyApi, StudyRoom, StudyMessage } from "@/lib/api";
import { TiltCard } from "@/components/ui/TiltCard";
import { Users, Timer, MessageSquare, Plus, ArrowRight, DoorOpen } from "lucide-react";

interface DisplayRoom extends StudyRoom {
  description: string;
  tag: string;
  color: string;
  active?: number;
}

interface DisplayRoomMessage extends StudyMessage {}

export default function StudyRoomsPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<DisplayRoom | null>(null);
  const [messages, setMessages] = useState<DisplayRoomMessage[]>([]);
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const fetchRooms = async () => {
    try {
      const data = await studyApi.rooms();
      setRooms((data.rooms as unknown as DisplayRoom[]) || []);
    } catch (e) {
      console.error("Rooms fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: number) => {
    try {
      const data = await studyApi.messages(roomId.toString(), token);
      setMessages((data.messages as unknown as DisplayRoomMessage[]) || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {}
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id);
      pollRef.current = setInterval(() => fetchMessages(activeRoom.id), 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeRoom]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning && timer > 0) interval = setInterval(() => setTimer((t) => t - 1), 1000);
    else if (timer === 0) setIsTimerRunning(false);
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const joinRoom = async (room: DisplayRoom) => {
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
    if (!chatInput.trim() || !activeRoom) return;
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
    if (!newRoomName.trim()) return;
    try {
      const res = await studyApi.create({ name: newRoomName, description: newRoomDesc, tag: newRoomTag }, token);
      if (res) {
        setShowCreate(false);
        setNewRoomName("");
        setNewRoomDesc("");
        setNewRoomTag("General");
        fetchRooms();
      }
    } catch (e) {}
  };

  if (activeRoom) {
    return (
      <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>
        <div
          className="glass-card"
          style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: `linear-gradient(90deg, ${activeRoom.color}15, transparent)`,
            }}
          >
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: activeRoom.color }}>#</span> {activeRoom.name}
              </h2>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                {activeRoom.description}
              </div>
            </div>
            <button
              onClick={() => {
                setActiveRoom(null);
                if (pollRef.current) clearInterval(pollRef.current);
              }}
              className="btn-ghost"
              style={{ padding: "8px 16px", fontSize: 13, borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}
            >
              <DoorOpen size={16} /> Leave Room
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
            <AnimatePresence mode="popLayout">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 60 }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Zero distractions here.</div>
                  <div style={{ fontSize: 13 }}>Share your goals or ask a question.</div>
                </motion.div>
              )}
              {messages.map((m, idx) => {
                const isMe = m.user_name === (session?.user?.name || (session?.user as any)?.email?.split("@")[0]);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: isMe ? activeRoom.color : "white" }}>
                        {m.user_name}
                      </span>
                      <span>·</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div
                      style={{
                        background: isMe ? `${activeRoom.color}20` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isMe ? activeRoom.color + "40" : "rgba(255,255,255,0.08)"}`,
                        padding: "12px 20px",
                        borderRadius: 20,
                        borderBottomRightRadius: isMe ? 4 : 20,
                        borderTopLeftRadius: isMe ? 20 : 4,
                        fontSize: 14,
                        maxWidth: "75%",
                        lineHeight: 1.5,
                        boxShadow: isMe ? `0 4px 15px ${activeRoom.color}15` : "none",
                      }}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            style={{ padding: 24, paddingTop: 0, background: "transparent", display: "flex", gap: 12 }}
          >
            {!token && (
              <div style={{ flex: 1, textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "12px" }}>
                Identity required to participate in discussions.
              </div>
            )}
            {token && (
              <>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Collaborate in #${activeRoom.name}...`}
                  className="input-field"
                  style={{ flex: 1, padding: "14px 20px", borderRadius: 16, background: "rgba(0,0,0,0.2)" }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!chatInput.trim() || sending}
                  style={{
                    background: activeRoom.color,
                    color: "white",
                    padding: "0 28px",
                    borderRadius: 16,
                    border: "none",
                    fontWeight: 800,
                    cursor: "pointer",
                    opacity: !chatInput.trim() ? 0.5 : 1,
                    boxShadow: `0 4px 15px ${activeRoom.color}40`,
                  }}
                >
                  {sending ? "..." : "Send"}
                </motion.button>
              </>
            )}
          </form>
        </div>

        {/* Right sidebar */}
        <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Pomodoro */}
          <TiltCard
            intensity={5}
            style={{ padding: 32, textAlign: "center", background: "rgba(124, 58, 237, 0.03)" }}
          >
            <h3
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                color: "var(--text-secondary)",
                fontWeight: 800,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Timer size={14} /> Focus Session
            </h3>
            <motion.div
              animate={isTimerRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                fontSize: 56,
                fontWeight: 900,
                fontFamily: "var(--font-mono)",
                color: activeRoom.color,
                marginBottom: 24,
                textShadow: `0 0 20px ${activeRoom.color}40`,
              }}
            >
              {formatTime(timer)}
            </motion.div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{
                  flex: 2,
                  padding: "14px",
                  background: isTimerRunning ? "rgba(255,255,255,0.1)" : activeRoom.color,
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimer(25 * 60);
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                ↺
              </button>
            </div>
          </TiltCard>

          {/* Members / Activity */}
          <div className="glass-card" style={{ padding: 24, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--text-secondary)",
                marginBottom: 20,
              }}
            >
              Active Now
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: activeRoom.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {session?.user?.name?.[0] || "?"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{session?.user?.name || "You (joined)"}</div>
                <div
                  style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#43E97B" }}
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, fontStyle: "italic" }}>
                Waiting for more community members to join...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header Section */}
      <div style={{ textAlign: "center", marginBottom: 64, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: -50,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: 200,
            background: "radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
        <h1 style={{ fontSize: 44, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16, letterSpacing: "-1.5px" }}>
          Community <span className="gradient-text">Study Rooms</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 18, maxWidth: 650, margin: "0 auto", lineHeight: 1.6 }}>
          Immerse yourself in live, synchronous focus sessions. Build streaks, 
          share knowledge, and hold each other accountable.
        </p>
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreate(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card"
              style={{ padding: 40, width: 480, maxWidth: "100%", border: "1px solid var(--border-hover)" }}
            >
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Launch a Room</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 14 }}>
                Setup a new focus environment for the community.
              </p>
              <form onSubmit={createRoom} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontWeight: 800,
                      display: "block",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Room Identity *
                  </label>
                  <input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. Next.js Deep Dive"
                    className="input-field"
                    style={{ width: "100%", padding: "14px 20px", borderRadius: 12 }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontWeight: 800,
                      display: "block",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Context / Goals
                  </label>
                  <input
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    placeholder="Focusing on component optimization..."
                    className="input-field"
                    style={{ width: "100%", padding: "14px 20px", borderRadius: 12 }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      fontWeight: 800,
                      display: "block",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Primary Focus
                  </label>
                  <select
                    value={newRoomTag}
                    onChange={(e) => setNewRoomTag(e.target.value)}
                    className="input-field"
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {[
                      "General",
                      "Interview",
                      "Machine Learning",
                      "Blockchain",
                      "Startups",
                      "Frontend",
                      "Backend",
                      "Data Science",
                    ].map((t) => (
                      <option key={t} value={t} style={{ background: "#05070D" }}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    style={{
                      flex: 1,
                      padding: 14,
                      borderRadius: 14,
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "white",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 2, padding: 14, borderRadius: 14, fontWeight: 900 }}
                  >
                    Initialize Room
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 32,
        }}
      >
        {loading &&
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card" style={{ height: 240, opacity: 0.2 }} />
          ))}

        {!loading && rooms.map((room, i) => (
          <TiltCard
            key={room.id}
            intensity={8}
            style={{ padding: 32, cursor: "pointer", border: `1px solid ${String(room.color)}30` }}
            onClick={() => joinRoom(room)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: `${room.color}15`,
                  color: room.color,
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {room.tag}
              </div>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: "#43E97B",
                  boxShadow: "0 0 12px #43E97B",
                }}
              />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10, letterSpacing: "-0.5px" }}>
              {room.name}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                marginBottom: 32,
                lineHeight: 1.5,
                minHeight: 42,
              }}
            >
              {room.description || "Active community study group."}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 20,
                borderTop: "1px solid rgba(255,255,255,0.05)",
                marginTop: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: String(room.color), fontWeight: 700 }}>
                Join Focus <ArrowRight size={14} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={12} /> Live Now
              </div>
            </div>
          </TiltCard>
        ))}

        {/* Create Room Trigger Card */}
        {!loading && (
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card"
            style={{
              padding: 32,
              cursor: "pointer",
              border: "2px dashed rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: "rgba(255,255,255,0.01)",
              minHeight: 240,
            }}
            onClick={() => setShowCreate(true)}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                marginBottom: 20,
                color: "white",
              }}
            >
              <Plus size={32} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Establish Presence</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 200 }}>
              Start a new focus channel for the community.
            </p>
          </motion.div>
        )}
      </div>

      <style>{`
        .spinner { border-top-color: var(--brand-primary); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
