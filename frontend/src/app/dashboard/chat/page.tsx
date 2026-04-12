"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, ChatMsg, ChatSession } from "@/lib/api";
import { Bot, Send, Trash2, Plus, MessageSquare, Menu, X, Clock, History, BrainCircuit, Copy, Check, GraduationCap, Building2, TrendingUp, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { VoiceButton } from "@/components/VoiceButton";
import { ReviewForm } from "@/components/ReviewForm";
import { Star } from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        gap: 12,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: isUser ? "rgba(255,255,255,0.08)" : "var(--gradient-primary)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: "white",
        boxShadow: isUser ? "none" : "0 0 16px rgba(124,58,237,0.3)",
      }}>
        {isUser ? "U" : <Bot size={18} />}
      </div>

      <div style={{
        maxWidth: isUser ? "75%" : "85%",
        padding: "14px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "linear-gradient(135deg, #007AFF, #0056D6)" : "rgba(255,255,255,0.03)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.07)",
        color: "var(--text-primary)",
        fontSize: 14.5,
        lineHeight: 1.7,
        boxShadow: isUser ? "0 4px 18px rgba(0,122,255,0.25)" : "none",
        wordBreak: "break-word",
        position: "relative",
      }}>
        {!isUser && (
          <button
            onClick={handleCopy}
            style={{
              position: "absolute", top: -10, right: -10,
              background: copied ? "#10B981" : "rgba(124,58,237,0.9)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white", padding: 6, borderRadius: "50%", cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              opacity: hovered || copied ? 1 : 0,
              transform: hovered || copied ? "scale(1)" : "scale(0.8)",
              transition: "all 0.2s",
              zIndex: 10
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
        
        {isUser ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeContent = String(children).replace(/\n$/, "");
                const [codeCopied, setCodeCopied] = useState(false);

                const copyCode = () => {
                  navigator.clipboard.writeText(codeContent);
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                };

                return !inline && match ? (
                  <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", margin: "14px 0", border: "1px solid rgba(255,255,255,0.08)", background: "#0D1117" }}>
                    <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>{match[1]}</span>
                      <button 
                        onClick={copyCode}
                        style={{ background: "none", border: "none", color: codeCopied ? "#10B981" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "white"}
                        onMouseLeave={e => e.currentTarget.style.color = codeCopied ? "#10B981" : "var(--text-muted)"}
                      >
                        {codeCopied ? <Check size={12} /> : <Copy size={12} />}
                        {codeCopied ? "COPIED" : "COPY"}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, padding: "16px", background: "transparent", fontSize: "14px", lineHeight: 1.6 }}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code {...props} className={className} style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: 6, fontSize: "0.9em", color: "#A78BFA", fontWeight: 600 }}>
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

        {(msg as any).sources && (msg as any).sources.length > 0 && (
          <div style={{ marginTop: 12, padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: 12, fontSize: 13, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontWeight: 700, color: "var(--brand-primary)", marginBottom: 6 }}>Knowledge Context Used:</div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {(msg as any).sources.map((src: any, idx: number) => (
                <li key={idx} style={{ color: "var(--text-muted)", marginBottom: 4 }}>
                  [{src.type}] {src.content.substring(0, 120)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [mode, setMode] = useState<string>("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await chatApi.sessions();
      setSessions(res.sessions || []);
    } catch {}
  };

  const loadHistory = async (id: string) => {
    setLoading(true);
    setSessionId(id);
    localStorage.setItem("tulasi_chat_session", id);
    try {
      const res = await chatApi.history(id);
      setMessages([{ role: "assistant", content: GREETING }, ...res.messages]);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch {
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([{ role: "assistant", content: GREETING }]);
    setSessionId("");
    localStorage.removeItem("tulasi_chat_session");
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await chatApi.clearHistory(id);
      setSessions(prev => prev.filter(s => s.session_id !== id));
      if (sessionId === id) startNewChat();
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSessions();
    const saved = localStorage.getItem("tulasi_chat_session");
    if (saved) loadHistory(saved);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      let aiResponseContent = "...";
      let aiSources = null;

      if (mode === "personal_rag") {
        const res = await chatApi.ragQuery(text);
        aiResponseContent = res.answer || "No localized RAG response.";
        aiSources = res.sources;
      } else {
        const res = await chatApi.send(text, sessionId || undefined, mode);
        if (res.session_id && !sessionId) {
          setSessionId(res.session_id);
          localStorage.setItem("tulasi_chat_session", res.session_id);
          fetchSessions();
        }
        aiResponseContent = res.response || "...";
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiResponseContent, sources: aiSources } as any]);
      
      // Prompt for review after 5 user messages
      const nextCount = msgCount + 1;
      setMsgCount(nextCount);
      if (nextCount === 5) {
        setShowReviewPrompt(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: 20, position: "relative" }}>
      
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", minWidth: 0 }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mobile-only"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 8, cursor: "pointer", color: "white" }}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.35)", flexShrink: 0 }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(90deg, #fff, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tulasi AI Chat</h1>
              {/* Branding Removed per Founder Request */}
            </div>
          </div>
          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.15)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.3)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "#10B981", textTransform: "uppercase", letterSpacing: 0.5 }}>Neural Link Established</span>
          </div>
        </div>

        {/* AI Mode Selector */}
        <div style={{ display: "flex", gap: 10, padding: "4px 4px", overflowX: "auto", scrollbarWidth: "none", marginBottom: 16 }}>
          {[
            { id: "chat", label: "General Chat", icon: <MessageSquare size={14} /> },
            { id: "learning_engine", label: "Learning Engine", icon: <GraduationCap size={14} /> },
            { id: "doubt", label: "Doubt Solver", icon: <HelpCircle size={14} /> },
            { id: "system_design", label: "System Design", icon: <Building2 size={14} /> },
            { id: "career_strategy", label: "Career Strategy", icon: <TrendingUp size={14} /> },
            { id: "interview", label: "Mock Interview", icon: <BrainCircuit size={14} /> },
            { id: "personal_rag", label: "Personalized RAG", icon: <BrainCircuit size={14} /> }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: mode === m.id ? "var(--gradient-primary)" : "rgba(255,255,255,0.03)",
                color: mode === m.id ? "white" : "var(--text-muted)",
                border: "1px solid", borderColor: mode === m.id ? "transparent" : "rgba(255,255,255,0.08)",
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, padding: "20px",
          background: "rgba(255,255,255,0.015)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)", marginBottom: 16, scrollbarWidth: "none"
        }}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} index={i} />)}
          {loading && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "18px 18px 18px 4px" }}><TypingDots /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Review Prompt */}
        <AnimatePresence>
          {showReviewPrompt && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                margin: "0 20px 16px", padding: "12px 20px", 
                background: "linear-gradient(90deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.15) 100%)",
                borderRadius: 16, border: "1px solid rgba(139,92,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, boxShadow: "0 0 20px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFD93D" }}>
                   <Star size={18} fill="#FFD93D" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "white" }}>Help us improve?</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Share your experience and get 100 XP instantly.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  onClick={() => setShowReviewPrompt(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  NOT NOW
                </button>
                <button 
                  onClick={() => {
                    setIsReviewModalOpen(true);
                    setShowReviewPrompt(false);
                  }}
                  style={{ background: "var(--brand-primary)", color: "white", border: "none", padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  REVIEW NOW
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal Integration */}
        <AnimatePresence>
          {isReviewModalOpen && (
            <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsReviewModalOpen(false)}
               style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 1000 }}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               style={{ 
                 position: "relative", zIndex: 1001, width: "100%", maxWidth: 600,
                 background: "#0B0E14", border: "1px solid rgba(255,255,255,0.08)",
                 borderRadius: 32, padding: "40px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
               }}
             >
               <ReviewForm onClose={() => setIsReviewModalOpen(false)} />
             </motion.div>
           </div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "10px 16px", display: "flex", gap: 12, alignItems: "flex-end", backdropFilter: "blur(12px)" }}>
          <textarea
            ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask anything..." rows={1}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 15, padding: "8px 0", resize: "none", maxHeight: 150 }}
          />
          <VoiceButton onTranscript={(text) => setInput(p => p + " " + text)} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: 12, background: input.trim() ? "var(--gradient-primary)" : "rgba(255,255,255,0.05)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Send size={18} color="white" />
          </motion.button>
        </div>
      </div>

      {/* History Sidebar - Right Side */}
      <motion.div
        animate={{ x: isSidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768) ? 0 : 320 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          width: 280, height: "100%", background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20,
          display: "flex", flexDirection: "column", overflow: "hidden",
          position: (typeof window !== "undefined" && window.innerWidth < 768) ? "absolute" : "relative",
          right: 0, zIndex: 50, backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ padding: 16, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={startNewChat} style={{
            width: "100%", padding: "12px", borderRadius: 12, background: "rgba(139,92,246,0.1)",
            color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)",
            display: "flex", alignItems: "center", gap: 10, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16, paddingLeft: 8 }}>
            Recent Conversations
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No history yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sessions.map(s => (
                <div
                  key={s.session_id}
                  onClick={() => loadHistory(s.session_id)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: sessionId === s.session_id ? "rgba(139,92,246,0.15)" : "transparent",
                    border: "1px solid", borderColor: sessionId === s.session_id ? "rgba(139,92,246,0.3)" : "transparent",
                    display: "flex", alignItems: "center", gap: 10, transition: "0.2s"
                  }}
                >
                  <MessageSquare size={16} color={sessionId === s.session_id ? "#A78BFA" : "var(--text-muted)"} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: sessionId === s.session_id ? 700 : 500, color: sessionId === s.session_id ? "white" : "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.title}
                    </div>
                  </div>
                  <Trash2 size={14} className="delete-btn" onClick={(e) => deleteSession(e, s.session_id)} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-muted)" }}>
            <Clock size={14} /> 2026 Season
          </div>
        </div>
      </motion.div>
    </div>
  );
}
