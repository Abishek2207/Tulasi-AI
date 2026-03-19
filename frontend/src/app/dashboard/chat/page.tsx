"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, setLoading, setSessionId, clearChat } from "@/store/slices/chatSlice";
import { chatApi } from "@/lib/api";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";

const SUGGESTIONS = [
  "Explain Big O notation",
  "How to prepare for system design interviews?",
  "Python tips for beginners",
  "Best roadmap for AI engineering",
  "Debug this code for me",
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function isErrorMsg(content: string) {
  return (
    content.startsWith("❌") ||
    content.startsWith("⏳") ||
    content.includes("temporarily busy") ||
    content.includes("Failed to connect") ||
    content.includes("AI processing error")
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title="Copy message"
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "3px 8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: copied ? "#43E97B" : "var(--text-muted)",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      {copied ? "✅" : "📋"}
    </motion.button>
  );
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const { messages, isLoading, sessionId } = useSelector((s: RootState) => s.chat);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = overrideText ?? input;
    if ((!text.trim() && !selectedImage) || isLoading) return;

    const msg = {
      id: Date.now().toString(),
      role: "user" as const,
      content: text,
      image: selectedImage,
      timestamp: Date.now(),
    };
    dispatch(addMessage(msg));
    setLastUserMsg(text);
    setInput("");
    setSelectedImage(null);
    dispatch(setLoading(true));
    setIsWakingUp(false);

    const wakeTimer = setTimeout(() => setIsWakingUp(true), 4500);

    try {
      const data = await chatApi.send(
        text || (selectedImage ? "Analyze this image" : ""),
        sessionId || undefined,
        token
      );
      if (data.session_id) dispatch(setSessionId(data.session_id));
      dispatch(addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "No response received.",
        timestamp: Date.now(),
      }));
    } catch {
      dispatch(addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Failed to connect after multiple retries. Please check your connection or wait a moment.",
        timestamp: Date.now(),
      }));
    } finally {
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      dispatch(setLoading(false));
    }
  }, [input, selectedImage, isLoading, sessionId, token, dispatch]);

  const handleRetry = () => {
    if (lastUserMsg) sendMessage(lastUserMsg);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 960, margin: "0 auto", position: "relative" }}>

      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            🤖 AI <span className="gradient-text">Chat</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Gemini-powered • context-aware • real-time</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge badge-green" style={{ padding: "5px 14px", fontSize: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", marginRight: 6, boxShadow: "0 0 6px #10B981" }} />
            Online
          </motion.div>
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(clearChat())}
              className="btn-ghost"
              style={{ padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
            >
              🗑 Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="popLayout">

          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 84, height: 84, borderRadius: 28, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, boxShadow: "0 25px 50px rgba(124,58,237,0.3)" }}
              >🤖</motion.div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Welcome to <span className="gradient-text">Tulasi AI</span>
                </div>
                <p style={{ color: "var(--text-secondary)", maxWidth: 420, lineHeight: 1.7, fontSize: 14 }}>
                  Your advanced AI companion. Ask anything, upload images, or get your code reviewed instantly.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", maxWidth: 580 }}>
                {SUGGESTIONS.map((s, idx) => (
                  <motion.button key={s}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.08 } }}
                    whileHover={{ scale: 1.04, y: -2, background: "rgba(124,58,237,0.14)", borderColor: "rgba(124,58,237,0.4)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setInput(s)}
                    style={{ padding: "9px 16px", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}
                  >{s}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <motion.div key={msg.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>

              {msg.role === "user" ? (
                // ── User bubble ─────────────────────────────────────
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingLeft: "18%" }}>
                  {msg.image && (
                    <img src={msg.image} alt="Attached" style={{ maxWidth: 280, borderRadius: 14, border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }} />
                  )}
                  {msg.content && (
                    <div className="chat-bubble-user" style={{ boxShadow: "0 8px 20px rgba(124,58,237,0.25)" }}>
                      {msg.content}
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>{formatTime(msg.timestamp)}</span>
                </div>
              ) : isErrorMsg(msg.content) ? (
                // ── Error card ──────────────────────────────────────
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingRight: "12%" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ padding: "12px 16px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: "4px 16px 16px 16px", color: "#FB7185", fontSize: 14, lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatTime(msg.timestamp)}</span>
                      {lastUserMsg && (
                        <motion.button
                          onClick={handleRetry}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ padding: "3px 12px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 8, color: "#FB7185", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                        >
                          🔄 Retry
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // ── AI bubble ───────────────────────────────────────
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingRight: "12%" }}>
                  <motion.div whileHover={{ rotate: 12 }} style={{ width: 38, height: 38, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: "0 6px 15px rgba(124,58,237,0.3)" }}>🤖</motion.div>
                  <div style={{ flex: 1 }}>
                    <div className="chat-bubble-ai">
                      {msg.content}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatTime(msg.timestamp)}</span>
                      <CopyButton text={msg.content} />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
              <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.03)", borderRadius: "4px 18px 18px 18px", border: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "center" }}>
                {isWakingUp ? (
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>⚡ Waking up AI server…</span>
                ) : (
                  <><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {selectedImage && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: 12, padding: 10, background: "var(--bg-glass)", backdropFilter: "blur(20px)", borderRadius: 18, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}
          >
            <img src={selectedImage} alt="Preview" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
              style={{ background: "rgba(244,63,94,0.15)", color: "#F43F5E", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}
            >✕</motion.button>
          </motion.div>
        )}

        <div className="glass-card" style={{ padding: "10px", borderRadius: 22, display: "flex", gap: 10, alignItems: "flex-end", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
          {/* Image upload */}
          <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageSelect} />
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", cursor: isLoading ? "not-allowed" : "pointer", flexShrink: 0, margin: "4px 0 4px 4px", border: "1px solid var(--border)", opacity: isLoading ? 0.4 : 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </motion.button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={isLoading ? "AI is thinking…" : "Ask anything… (Enter to send, Shift+Enter for newline)"}
            disabled={isLoading}
            rows={1}
            style={{ flex: 1, background: "transparent", border: "none", borderRadius: 14, padding: "14px 16px", color: "var(--text-primary)", fontSize: 15, resize: "none", outline: "none", fontFamily: "var(--font-sans)", maxHeight: 200, lineHeight: 1.5, opacity: isLoading ? 0.5 : 1 }}
          />

          {/* Send button */}
          <motion.button
            whileHover={!isLoading && (input.trim() || !!selectedImage) ? { scale: 1.06, y: -2 } : {}}
            whileTap={!isLoading && (input.trim() || !!selectedImage) ? { scale: 0.94 } : {}}
            onClick={() => sendMessage()}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            style={{
              background: (input.trim() || selectedImage) && !isLoading ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)",
              border: "none",
              borderRadius: 14,
              width: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: (input.trim() || selectedImage) && !isLoading ? "pointer" : "not-allowed",
              flexShrink: 0,
              margin: "4px 4px 4px 0",
              transition: "all 0.3s",
              boxShadow: (input.trim() || selectedImage) && !isLoading ? "0 8px 20px rgba(124,58,237,0.3)" : "none",
              opacity: isLoading ? 0.4 : 1,
            }}
          >
            {isLoading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white" }}
              />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </motion.button>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 11, marginTop: 10, letterSpacing: "0.05em", fontWeight: 600, textTransform: "uppercase" }}>
          Powered by Gemini 2.5 Flash · Auto-retry on 429 · Context-aware
        </p>
      </div>
    </div>
  );
}
