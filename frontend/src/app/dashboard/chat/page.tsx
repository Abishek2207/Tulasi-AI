"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, ChatMsg } from "@/lib/api";
import { Bot, Send, Trash2, RotateCcw, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";


const GREETING = "Hello! I'm Tulasi AI, your personal learning companion. Ask me anything — coding concepts, career advice, interview prep, or system design.";

const QUICK_PROMPTS = [
  { label: "🎯 Simulate Google Interview", value: "Simulate a Google Software Engineer technical interview. Ask me a LeetCode-style question and evaluate my answers." },
  { label: "🗺️ Create Learning Roadmap", value: "Create a detailed 12-week learning roadmap for a Full Stack Engineer role with daily tasks and resources." },
  { label: "🔧 Fix My Code", value: "I have a bug in my code. Help me debug it step by step. I'll paste my code below." },
  { label: "🏗️ System Design", value: "Walk me through how to design a scalable URL shortener like Bitly — cover architecture, databases, and scaling strategy." },
];

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand-primary)", boxShadow: "0 0 10px var(--brand-primary)" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
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
        maxWidth: isUser ? "75%" : "85%",
        padding: "14px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #007AFF, #0056D6)"
          : "transparent",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.07)",
        color: "var(--text-primary)",
        fontSize: 14.5,
        lineHeight: 1.7,
        boxShadow: isUser
          ? "0 4px 18px rgba(0,122,255,0.25)"
          : "none",
        wordBreak: "break-word",
      }}>
        {isUser ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <div style={{ borderRadius: 12, overflow: "hidden", margin: "12px 0", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: "16px", background: "#0D1117", fontSize: "13.5px" }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code {...props} className={className} style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 6, fontSize: "0.9em", color: "#A78BFA" }}>
                    {children}
                  </code>
                );
              },
              p({ children }) { return <p style={{ margin: "0 0 12px 0" }}>{children}</p>; },
              ul({ children }) { return <ul style={{ margin: "0 0 12px 20px", listStyleType: "disc" }}>{children}</ul>; },
              ol({ children }) { return <ol style={{ margin: "0 0 12px 20px", listStyleType: "decimal" }}>{children}</ol>; },
              li({ children }) { return <li style={{ marginBottom: 6 }}>{children}</li>; },
              h1({ children }) { return <h1 style={{ fontSize: 20, fontWeight: 700, margin: "16px 0 8px", color: "white" }}>{children}</h1>; },
              h2({ children }) { return <h2 style={{ fontSize: 18, fontWeight: 600, margin: "16px 0 8px", color: "white" }}>{children}</h2>; },
              h3({ children }) { return <h3 style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 8px", color: "white" }}>{children}</h3>; },
              a({ href, children }) { return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#22D3EE", textDecoration: "underline" }}>{children}</a>; },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
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
      const res = await chatApi.send(text, sessionId || undefined);
      if (res.session_id && !sessionId) setSessionId(res.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response || "No response received." },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      const errMsg = error.message || "Failed to connect to backend.";
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

  const handleQuickPrompt = (value: string) => {
    setInput(value);
    setTimeout(() => inputRef.current?.focus(), 50);
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
                Tulasi AI Chat
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: 12, border: "1px solid rgba(16,185,129,0.3)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", textTransform: "uppercase", letterSpacing: 0.5 }}>Online</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "2px 0 0 0" }}>
              Powered by Gemini — Architecting your intelligence
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

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
        >
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleQuickPrompt(p.value)}
              disabled={!hasToken}
              style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: hasToken ? "pointer" : "not-allowed",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-secondary)", transition: "all 0.2s", opacity: hasToken ? 1 : 0.4,
              }}
              onMouseEnter={e => { if (hasToken) { e.currentTarget.style.background = "rgba(124,58,237,0.15)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = "#A78BFA"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {p.label}
            </button>
          ))}
        </motion.div>
      )}

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
