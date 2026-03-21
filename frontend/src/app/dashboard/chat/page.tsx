"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, updateLastMessage, setLoading, setSessionId, clearChat } from "@/store/slices/chatSlice";
import { chatApi } from "@/lib/api";
import { RootState } from "@/store";
import { useSession } from "next-auth/react";
import { trackEvent } from "@/lib/analytics";

// ─── Tool definitions ──────────────────────────────────────────────────────────
const TOOLS = [
  { id: "chat", icon: "🤖", label: "AI Chat", placeholder: "Ask anything… coding, career, concepts…", color: "#7C3AED" },
  { id: "resume", icon: "📄", label: "Resume Coach", placeholder: "Paste your resume for feedback, or describe your experience…", color: "#06B6D4" },
  { id: "interview", icon: "🎯", label: "Mock Interview", placeholder: "Tell me the role and level (e.g. SDE-2 at Google)…", color: "#10B981" },
  { id: "cover_letter", icon: "✉️", label: "Cover Letter", placeholder: "Paste the job description to generate your cover letter…", color: "#F43F5E" },
];

// ─── Smart suggestions per tool ────────────────────────────────────────────────
const TOOL_SUGGESTIONS: Record<string, string[]> = {
  chat: ["Explain Big O notation", "System design tips", "Python debugging help", "Best AI resources 2025"],
  resume: ["Review my resume for a SDE role", "Improve my summary section", "Add action verbs to bullet points", "ATS optimization tips"],
  interview: ["Start a Google SDE-2 interview", "Behavioral STAR questions", "System design mock: Design YouTube", "SQL interview questions"],
  cover_letter: ["Write cover letter for a FinTech startup", "Make my tone more confident", "Keep it under 250 words", "Tailor to job description"],
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function isErrorMsg(content: string) {
  return content.startsWith("❌") || content.startsWith("⏳");
}

// ─── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <motion.button onClick={async () => { await navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "2px 8px", fontSize: 11, color: copied ? "#43E97B" : "var(--text-muted)", cursor: "pointer", transition: "all 0.2s" }}
    >{copied ? "✅" : "📋"}</motion.button>
  );
}

// ─── Feedback buttons ──────────────────────────────────────────────────────────
function FeedbackBtns({ msgId, sessionId, token }: { msgId: string; sessionId: string; token: string }) {
  const [voted, setVoted] = useState<1 | -1 | null>(null);
  const vote = async (rating: 1 | -1) => {
    setVoted(rating);
    try { await chatApi.feedback(sessionId, msgId, rating); } catch {}
  };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {([1, -1] as const).map(r => (
        <motion.button key={r} onClick={() => vote(r)} disabled={voted !== null}
          whileHover={voted === null ? { scale: 1.15 } : {}} whileTap={voted === null ? { scale: 0.9 } : {}}
          style={{ background: voted === r ? (r > 0 ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)") : "none", border: `1px solid ${voted === r ? (r > 0 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.5)") : "var(--border)"}`, borderRadius: 7, padding: "2px 8px", fontSize: 12, cursor: voted !== null ? "default" : "pointer", transition: "all 0.2s" }}
        >{r > 0 ? "👍" : "👎"}</motion.button>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const dispatch = useDispatch();
  const { messages, isLoading, sessionId } = useSelector((s: RootState) => s.chat);
  const [input, setInput] = useState("");
  const [activeTool, setActiveTool] = useState("chat");
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  
  const currentTool = TOOLS.find(t => t.id === activeTool) ?? TOOLS[0];
  const suggestions = TOOL_SUGGESTIONS[activeTool] ?? [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    trackEvent("chat_used", { provider: "gemini-2.5-flash" });

    // Add user message
    dispatch(addMessage({ id: Date.now().toString(), role: "user", content: text, timestamp: Date.now() }));
    setLastUserMsg(text);
    setInput("");
    dispatch(setLoading(true));
    setIsWakingUp(false);

    const aiMsgId = (Date.now() + 1).toString();
    dispatch(addMessage({ id: aiMsgId, role: "assistant", content: "", timestamp: Date.now() }));
    setStreamingId(aiMsgId);

    const maxRetries = 2;
    let attempt = 0;
    let success = false;
    setRetryAttempt(0);

    while (attempt <= maxRetries && !success) {
      setRetryAttempt(attempt);
      const wakeTimer = setTimeout(() => setIsWakingUp(true), 5000);
      try {
        const res = await chatApi.send(text, sessionId || undefined, activeTool);
        dispatch(updateLastMessage({ id: aiMsgId, append: res.response }));
        if (res.session_id) dispatch(setSessionId(res.session_id));
        success = true;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        if (errMsg.includes("401") || errMsg.includes("Session expired")) {
          dispatch(updateLastMessage({ id: aiMsgId, content: "❌ Session expired. Please log in again." }));
          success = true; // No point retrying auth failures
        } else if (errMsg.includes("500 Server Error")) {
          if (attempt < maxRetries) {
            dispatch(updateLastMessage({ id: aiMsgId, content: `⏳ Attempt ${attempt + 1} failed. Retrying...` }));
          } else {
            dispatch(updateLastMessage({ id: aiMsgId, content: `❌ ${errMsg.replace("500 Server Error: ", "")}` }));
            success = true;
          }
        } else if (
          errMsg.includes("Backend unreachable") ||
          errMsg.includes("Connection failed")
        ) {
          if (attempt < maxRetries) {
            dispatch(updateLastMessage({ id: aiMsgId, content: `⏳ Attempt ${attempt + 1} failed. Retrying...` }));
          } else {
            dispatch(updateLastMessage({ id: aiMsgId, content: `❌ Backend unreachable. All ${maxRetries + 1} attempts failed.` }));
            success = true;
          }
        } else {
          dispatch(updateLastMessage({ id: aiMsgId, append: `\n❌ ${errMsg}` }));
          success = true;
        }
      } finally {
        clearTimeout(wakeTimer);
        setIsWakingUp(false);
      }

      if (!success) {
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
        }
      }
    }

    setRetryAttempt(0);
    setStreamingId(null);
    dispatch(setLoading(false));
  }, [input, isLoading, sessionId, token, activeTool, dispatch]);

  const handleRetry = () => { if (lastUserMsg) sendMessage(lastUserMsg); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", maxWidth: 960, margin: "0 auto" }}>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.5px", marginBottom: 2 }}>
            {currentTool.icon} <span className="gradient-text">{currentTool.label}</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Powered by Gemini · context-aware · streaming</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="badge badge-green" style={{ padding: "5px 12px", fontSize: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", marginRight: 6, boxShadow: "0 0 5px #10B981" }} />
            Live
          </div>
          {messages.length > 0 && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => dispatch(clearChat())}
              className="btn-ghost" style={{ padding: "6px 14px", fontSize: 12, borderRadius: 10 }}>
              🗑 Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* ─── AI Tools Switcher ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, background: "rgba(0,0,0,0.25)", padding: 6, borderRadius: 16, border: "1px solid var(--border)" }}>
        {TOOLS.map(tool => (
          <motion.button key={tool.id} onClick={() => { setActiveTool(tool.id); setInput(""); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s",
              background: activeTool === tool.id ? `linear-gradient(135deg, ${tool.color}30, ${tool.color}15)` : "transparent",
              color: activeTool === tool.id ? tool.color : "var(--text-muted)",
              boxShadow: activeTool === tool.id ? `0 0 0 1px ${tool.color}40` : "none",
            }}
          >
            {tool.icon} <span style={{ display: "flex", gap: 0 }}>{tool.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ─── Chat area ─────────────────────────────────────────────── */}
      <div className="glass-card" style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 18, marginBottom: 14 }}>
        <AnimatePresence mode="popLayout">

          {/* Empty state */}
          {messages.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${currentTool.color}, ${currentTool.color}aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 20px 50px ${currentTool.color}40` }}
              >{currentTool.icon}</motion.div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Start your AI journey ✨</div>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 380, lineHeight: 1.65 }}>
                  Your <strong>{currentTool.label}</strong> is ready. Pick a suggestion or type anything below.
                </p>
              </div>
              {/* Smart suggestions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 580 }}>
                {suggestions.map((s, i) => (
                  <motion.button key={s} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}
                    whileHover={{ scale: 1.04, y: -2, borderColor: `${currentTool.color}60` }} whileTap={{ scale: 0.96 }}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    style={{ padding: "8px 14px", borderRadius: 12, border: `1px solid ${currentTool.color}25`, background: `${currentTool.color}08`, color: "var(--text-primary)", fontSize: 12, cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}
                  >{s}</motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <motion.div key={msg.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

              {msg.role === "user" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingLeft: "20%" }}>
                  {msg.content && <div className="chat-bubble-user">{msg.content}</div>}
                  <span style={{ fontSize: 10, color: "var(--text-muted)", marginRight: 2 }}>{formatTime(msg.timestamp)}</span>
                </div>

              ) : isErrorMsg(msg.content) ? (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: "14%" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚠️</div>
                  <div>
                    <div style={{ padding: "10px 14px", background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "4px 14px 14px 14px", color: "#FB7185", fontSize: 13, lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatTime(msg.timestamp)}</span>
                      {lastUserMsg && (
                        <motion.button onClick={handleRetry} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          style={{ padding: "2px 10px", background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 7, color: "#FB7185", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                          🔄 Retry
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

              ) : (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingRight: "14%" }}>
                  <motion.div whileHover={{ rotate: 12 }}
                    style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${currentTool.color}, ${currentTool.color}aa)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: `0 4px 12px ${currentTool.color}40` }}>
                    {currentTool.icon}
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <div className="chat-bubble-ai" style={{ position: "relative" } as any}>
                      {msg.content === "" && isLoading && streamingId === msg.id ? (
                        <div style={{ display: "flex", gap: 4, padding: "4px 0" }}>
                          {[0, 1, 2].map(i => (
                            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                              style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                          ))}
                        </div>
                      ) : (
                        msg.content
                      )}
                      {/* Blinking cursor while streaming */}
                      {streamingId === msg.id && msg.content !== "" && (
                        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                          style={{ display: "inline-block", width: 2, height: "1em", background: "var(--brand-primary)", marginLeft: 2, verticalAlign: "middle", borderRadius: 1 } as any} />
                      )}
                    </div>
                    {/* Only show actions once streaming is done */}
                    {streamingId !== msg.id && msg.content && (
                      <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{formatTime(msg.timestamp)}</span>
                        <CopyBtn text={msg.content} />
                        {sessionId && (
                          <FeedbackBtns msgId={msg.id} sessionId={sessionId} token={token} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Loading indicator — shown while waking or retrying */}
          {isLoading && (isWakingUp || retryAttempt > 0) && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 14px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12 }}>
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: 14 }}>⚙️</motion.span>
              <span style={{ color: "#FCD34D", fontSize: 13 }}>
                {retryAttempt > 0
                  ? `Retrying… (attempt ${retryAttempt} of 2)`
                  : "Waking up AI server… this may take a moment"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ─── Input area ─────────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: "10px", borderRadius: 20, display: "flex", gap: 10, alignItems: "flex-end", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={isLoading ? `${currentTool.icon} AI is responding…` : currentTool.placeholder}
          disabled={isLoading}
          rows={1}
          style={{ flex: 1, background: "transparent", border: "none", borderRadius: 14, padding: "13px 16px", color: "var(--text-primary)", fontSize: 15, resize: "none", outline: "none", fontFamily: "var(--font-sans)", maxHeight: 200, lineHeight: 1.5, opacity: isLoading ? 0.5 : 1 }}
        />
        <motion.button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          whileHover={!isLoading && input.trim() ? { scale: 1.06, y: -2 } : {}}
          whileTap={!isLoading && input.trim() ? { scale: 0.94 } : {}}
          style={{
            background: input.trim() && !isLoading ? `linear-gradient(135deg, ${currentTool.color}, ${currentTool.color}cc)` : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: 13, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() && !isLoading ? "pointer" : "not-allowed", flexShrink: 0, margin: "4px 4px 4px 0",
            transition: "all 0.3s", boxShadow: input.trim() && !isLoading ? `0 8px 20px ${currentTool.color}50` : "none", opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white" }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.button>
      </div>

      <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 11, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
        Gemini 2.5 Flash · Auto-retry · Context-aware memory
      </p>
    </div>
  );
}
