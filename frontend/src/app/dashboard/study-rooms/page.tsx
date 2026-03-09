"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROOMS = [
  { id: "dsa", name: "DSA & LeetCode Prep", active: 142, tag: "Interview", color: "#FF6B6B" },
  { id: "web3", name: "Web3 Builders", active: 56, tag: "Blockchain", color: "#4ECDC4" },
  { id: "ai", name: "AI/ML Researchers", active: 204, tag: "Machine Learning", color: "#6C63FF" },
  { id: "startup", name: "Indie Hackers", active: 89, tag: "Startups", color: "#FFD93D" },
];

export default function StudyRoomsPage() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{user: string, text: string, time: string}[]>([
    { user: "AlexP", text: "Anyone struggling with DP today?", time: "10:42 AM" },
    { user: "CodeNinja", text: "Yeah, the knapsack problem is brutal.", time: "10:44 AM" }
  ]);
  
  const [timer, setTimer] = useState(25 * 60); // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    setMessages([...messages, { 
      user: "You", 
      text: chatInput, 
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setChatInput("");
    
    // Simulate others typing
    setTimeout(() => {
      setMessages(prev => [...prev, {
        user: "System",
        text: "User joined the room.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 5000 + Math.random() * 10000);
  };

  if (activeRoom) {
    const room = ROOMS.find(r => r.id === activeRoom)!;
    return (
      <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)" }}>
        
        {/* Left: Chat & Activity */}
        <div className="dash-card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", border: `1px solid ${room.color}40` }}>
          <div style={{ padding: 20, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(90deg, ${room.color}15, transparent)` }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: room.color }}>#</span> {room.name}
              </h2>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                🟢 {room.active} online right now
              </div>
            </div>
            <button onClick={() => setActiveRoom(null)} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13, borderRadius: 8 }}>Leave Room</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.user === "You" ? "flex-end" : "flex-start" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.user === "You" ? room.color : "white" }}>{m.user}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.time}</span>
                </div>
                <div style={{ background: m.user === "You" ? `${room.color}20` : "rgba(255,255,255,0.05)", padding: "10px 16px", borderRadius: 16, borderBottomRightRadius: m.user === "You" ? 4 : 16, borderTopLeftRadius: m.user !== "You" ? 4 : 16, border: `1px solid ${m.user === "You" ? room.color : "var(--border)"}40`, fontSize: 14 }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} style={{ padding: 16, background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", gap: 12 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={`Message #${room.name}...`} className="input-field" style={{ flex: 1, padding: "12px 16px", borderRadius: 12 }} />
            <button type="submit" disabled={!chatInput.trim()} className="btn btn-primary" style={{ background: room.color, padding: "0 24px", borderRadius: 12, opacity: !chatInput.trim() ? 0.5 : 1 }}>Send</button>
          </form>
        </div>

        {/* Right: Productivity Gadgets */}
        <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="dash-card" style={{ padding: 32, textAlign: "center", border: `1px solid ${room.color}40`, boxShadow: `0 10px 30px ${room.color}15` }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)", fontWeight: 700, marginBottom: 16 }}>Pomodoro Timer</h3>
            <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "var(--font-outfit)", color: room.color, marginBottom: 24 }}>
              {formatTime(timer)}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="btn btn-primary" style={{ flex: 1, background: isTimerRunning ? "rgba(255,255,255,0.1)" : room.color, color: "white", padding: 12, borderRadius: 12 }}>
                {isTimerRunning ? "Pause" : "Start"}
              </button>
              <button onClick={() => { setIsTimerRunning(false); setTimer(25 * 60); }} className="btn btn-secondary" style={{ padding: "12px 20px", borderRadius: 12 }}>Reset</button>
            </div>
          </div>

          <div className="dash-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Online Members</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👤</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Student {Math.floor(Math.random() * 1000)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Studying React.js</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>+ {room.active - 5} more</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
        {ROOMS.map((room) => (
          <motion.div 
            key={room.id}
            whileHover={{ y: -5, scale: 1.02 }}
            className="dash-card"
            style={{ padding: 24, cursor: "pointer", border: `1px solid ${room.color}40`, transition: "all 0.2s" }}
            onClick={() => setActiveRoom(room.id)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ background: `${room.color}20`, color: room.color, padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                {room.tag}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: "#43E97B", boxShadow: "0 0 10px #43E97B" }} />
                {room.active}
              </div>
            </div>
            
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "white", marginBottom: 8 }}>{room.name}</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Join the active session and start focusing with peers.</p>
            
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: -8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 16, background: "var(--background-alt)", border: "2px solid var(--surface)", zIndex: 4-i, marginLeft: i>1 ? -12 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  👾
                </div>
              ))}
              <span style={{ fontSize: 12, color: "var(--text-secondary)", marginLeft: 16, fontWeight: 600 }}>Click to enter →</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
