"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, setLoading, setSessionId, clearChat } from "@/store/slices/chatSlice";
import { chatApi } from "@/lib/api";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";

const SUGGESTIONS = ["Explain Big O notation", "How to prepare for system design interviews?", "Python tips for beginners", "Best roadmap for AI engineering", "Debug this code for me"];

export default function ChatPage() {
  const dispatch = useDispatch();
  const { messages, isLoading, sessionId } = useSelector((s: RootState) => s.chat);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;
    const msg = { 
      id: Date.now().toString(), 
      role: "user" as const, 
      content: input, 
      image: selectedImage, 
      timestamp: Date.now() 
    };
    dispatch(addMessage(msg));
    const text = input;
    const imgData = selectedImage;
    setInput("");
    setSelectedImage(null);
    dispatch(setLoading(true));
    setIsWakingUp(false);
    const wakeTimer = setTimeout(() => setIsWakingUp(true), 4000); // Show wake up message if request takes over 4s
    try {
      const data = await chatApi.send(
        text || (imgData ? "Analyze this image" : ""),
        sessionId || undefined,
        token
      );
      if (data.session_id) dispatch(setSessionId(data.session_id));
      dispatch(addMessage({ id: (Date.now()+1).toString(), role: "assistant", content: data.response || "Error.", timestamp: Date.now() }));
    } catch {
      dispatch(addMessage({ id: (Date.now()+1).toString(), role: "assistant", content: "Failed to connect after Retries. Is the backend running?", timestamp: Date.now() }));
    } finally { 
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      dispatch(setLoading(false)); 
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 950, margin: "0 auto", position: "relative" }}>
      <div className="orb orb-purple" style={{ width: 350, height: 350, top: "10%", right: "-5%", opacity: 0.12 }} />

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.5px" }}>
            🤖 AI <span className="gradient-text">Chat Assistant</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 5, fontWeight: 500 }}>Context-aware RAG tutor with high-performance memory</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge badge-green" style={{ padding: "6px 16px", boxShadow: "0 0 15px rgba(16,185,129,0.2)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", boxShadow: "0 0 5px #10B981" }} /> Online
          </motion.div>
          {messages.length > 0 && (
            <motion.button whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.95 }} onClick={() => dispatch(clearChat())}
              className="btn-ghost" style={{ padding: "8px 16px", fontSize: 12, borderRadius: 12, borderWidth: 1 }}>
              Clear History
            </motion.button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="glass-card" style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: 24, marginBottom: 20, position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}
            >
              <motion.div animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 90, height: 90, borderRadius: 28, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: "0 25px 50px rgba(124,58,237,0.3)" }}>
                🤖
              </motion.div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, textAlign: "center" }}>
                Welcome to <span className="gradient-text">Tulasi AI</span>
              </div>
              <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: 450, lineHeight: 1.7, fontSize: 15, fontWeight: 400 }}>
                Your highly advanced research companion. Upload images, ask for roadmaps, or debug your most complex projects.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
                {SUGGESTIONS.map((s, idx) => (
                  <motion.button key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                    whileHover={{ scale: 1.05, y: -2, background: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.3)" }} whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(s)}
                    style={{ padding: "10px 18px", borderRadius: 14, border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "var(--font-sans)", transition: "all 0.25s" }}
                  >{s}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div key={msg.id} layout initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}>
              {msg.role === "user" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, paddingLeft: "15%" }}>
                  {msg.image && (
                    <motion.img layoutId={`img-${msg.id}`} src={msg.image} alt="Selected" style={{ maxWidth: 320, borderRadius: 16, border: "2px solid rgba(255,255,255,0.1)", marginBottom: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }} />
                  )}
                  {msg.content && <div className="chat-bubble-user" style={{ background: "var(--gradient-primary)", boxShadow: "0 10px 25px rgba(124,58,237,0.25)" }}>{msg.content}</div>}
                </div>
              ) : (
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingRight: "10%" }}>
                  <motion.div whileHover={{ rotate: 15 }} style={{ width: 38, height: 38, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: "0 6px 15px rgba(124,58,237,0.3)" }}>🤖</motion.div>
                  <div className="chat-bubble-ai" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>{msg.content}</div>
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "4px 20px 20px 20px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, color: "var(--text-secondary)", fontSize: "14px", alignItems: "center" }}>
                {isWakingUp ? (
                  <span>⚡ Waking up AI server...</span>
                ) : (
                  <><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div style={{ position: "relative", zIndex: 10 }}>
        {selectedImage && (
          <motion.div initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 16, padding: "10px", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(20px)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <img src={selectedImage} alt="Preview" style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} />
            <motion.button whileHover={{ scale: 1.1, background: "rgba(244,63,94,0.3)" }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedImage(null)} style={{ background: "rgba(244,63,94,0.15)", color: "#F43F5E", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</motion.button>
          </motion.div>
        )}
        <div className="glass-card" style={{ padding: "10px", borderRadius: 24, display: "flex", gap: 12, alignItems: "flex-end", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageSelect} />
          <motion.button whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.08)" }} whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()}
            style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, margin: "4px 0 4px 4px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </motion.button>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything or upload images..." rows={1}
            style={{ flex: 1, background: "transparent", border: "none", borderRadius: 16, padding: "16px 20px", color: "white", fontSize: 16, resize: "none", outline: "none", fontFamily: "var(--font-sans)", maxHeight: 200 }}
          />
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            style={{ background: (input.trim() || selectedImage) ? "var(--gradient-primary)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 16, width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", cursor: (input.trim() || selectedImage) ? "pointer" : "not-allowed", flexShrink: 0, margin: "4px 4px 4px 0", transition: "all 0.3s", boxShadow: (input.trim() || selectedImage) ? "0 8px 20px rgba(124,58,237,0.3)" : "none" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        </div>
      </div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1 } }} style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 11, marginTop: 12, letterSpacing: "0.05em", fontWeight: 600, textTransform: "uppercase" }}>
        Engineered with Gemini 1.5 · Llama 3.3 · DeepSeek v3
      </motion.p>
    </div>
  );
}
