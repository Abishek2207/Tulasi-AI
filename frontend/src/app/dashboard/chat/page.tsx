"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, ChatMsg } from "@/lib/api";
import { Bot, Send, Trash2, RotateCcw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const GREETING = "Hello! I'm Tulasi AI, your personal learning companion. Ask me anything — coding concepts, career advice, interview prep, or system design.";

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "16px 20px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text-muted)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, index }: { msg: ChatMsg; index: number }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        gap: 12,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: isUser ? "rgba(255,255,255,0.08)" : "var(--gradient-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: "white",
        boxShadow: isUser ? "none" : "0 0 16px rgba(124,58,237,0.3)",
      }}>
        {isUser ? "U" : <Bot size={18} />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "75%",
        padding: "14px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #007AFF, #0056D6)"
          : "rgba(255,255,255,0.05)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.07)",
        color: "var(--text-primary)",
        fontSize: 14.5,
        lineHeight: 1.7,
        boxShadow: isUser
          ? "0 4px 18px rgba(0,122,255,0.25)"
          : "0 2px 8px rgba(0,0,0,0.15)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const getToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const hasToken = mounted && !!getToken();

  const handleSend = async () => {
    const token = getToken();
    const text = input.trim();

    if (!text || loading) return;
    if (!token) {
      toast.error("Please log in to use the AI chat.");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatApi.send(text, sessionId || undefined, token);
      if (res.session_id && !sessionId) setSessionId(res.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response || "No response received." },
      ]);
    } catch (err: any) {
      const errMsg = err?.message || "Failed to connect to backend.";
      toast.error(errMsg.length > 80 ? "Connection failed. Please try again." : errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: GREETING }]);
    setSessionId("");
  };

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 900, margin: "0 auto", width: "100%" }}>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(124,58,237,0.35)",
          }}>
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
              Tulasi AI Chat
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
              Powered by Gemini — always learning with you
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={clearChat}
            title="Clear chat"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}
          >
            <Trash2 size={14} /> Clear
          </motion.button>
        </div>
      </motion.div>

      {/* Chat window */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
        gap: 20, padding: "24px",
        background: "rgba(255,255,255,0.015)",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        marginBottom: 16,
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.08) transparent",
      }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} />
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex", gap: 12, alignItems: "flex-end",
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "var(--gradient-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(124,58,237,0.3)",
            }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "18px 18px 18px 4px",
            }}>
              <TypingDots />
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "rgba(255,255,255,0.035)",
          border: `1px solid ${!hasToken ? "rgba(255,100,100,0.2)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 18, padding: "12px 16px",
          display: "flex", gap: 12, alignItems: "flex-end",
          backdropFilter: "blur(12px)",
        }}
      >
        {!hasToken && (
          <div style={{
            position: "absolute", bottom: "100%", left: 0, right: 0,
            textAlign: "center", color: "#F43F5E", fontSize: 12,
            padding: "6px", marginBottom: 4,
          }}>
            Please sign in to start chatting
          </div>
        )}

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasToken ? "Ask me anything... (Enter to send, Shift+Enter for new line)" : "Please log in to chat..."}
          disabled={!hasToken || loading}
          rows={1}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: 14.5,
            fontFamily: "var(--font-inter)",
            resize: "none",
            lineHeight: 1.6,
            padding: "4px 0",
            opacity: !hasToken ? 0.5 : 1,
            minHeight: 28,
            maxHeight: 160,
          }}
        />

        <motion.button
          whileHover={{ scale: 1.08, boxShadow: "0 0 24px rgba(124,58,237,0.45)" }}
          whileTap={{ scale: 0.94 }}
          onClick={handleSend}
          disabled={!hasToken || loading || !input.trim()}
          style={{
            width: 42, height: 42, borderRadius: 13, flexShrink: 0,
            background: input.trim() && hasToken && !loading
              ? "var(--gradient-primary)"
              : "rgba(255,255,255,0.06)",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() && hasToken && !loading ? "pointer" : "not-allowed",
            transition: "all 0.2s var(--ease-premium)",
            boxShadow: input.trim() && hasToken && !loading
              ? "0 4px 14px rgba(124,58,237,0.3)" : "none",
          }}
        >
          <Send size={17} color={input.trim() && hasToken && !loading ? "white" : "rgba(255,255,255,0.25)"} />
        </motion.button>
      </motion.div>

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
        Tulasi AI can make mistakes. Verify important information independently.
      </p>
    </div>
  );
}
