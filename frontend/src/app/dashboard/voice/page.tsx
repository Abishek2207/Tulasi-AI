"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Zap, Brain } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { API_URL } from "@/lib/api";

type Message = { role: "user" | "ai"; text: string; ts: number };

const PULSE_COLORS = ["#8B5CF6", "#06B6D4", "#EC4899"];

export default function VoiceAIPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Student";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [error, setError] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = useCallback((text: string) => {
    if (muted || !synthRef.current) return;
    synthRef.current.cancel();

    // Split into sentences so TTS starts immediately on first sentence
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith("en-IN") ||
      v.name.toLowerCase().includes("google") ||
      v.name.toLowerCase().includes("natural")
    ) || voices.find(v => v.lang.startsWith("en"));

    let idx = 0;
    const speakNext = () => {
      if (idx >= sentences.length) { setIsSpeaking(false); setStatus("idle"); return; }
      const utt = new SpeechSynthesisUtterance(sentences[idx].trim());
      utt.lang = "en-IN";
      utt.rate = 1.1;
      utt.pitch = 1.0;
      utt.volume = 1.0;
      if (preferred) utt.voice = preferred;
      utt.onstart = () => { setIsSpeaking(true); setStatus("speaking"); };
      utt.onend = () => { idx++; speakNext(); };
      utt.onerror = () => { idx++; speakNext(); };
      utteranceRef.current = utt;
      synthRef.current!.speak(utt);
    };
    speakNext();
  }, [muted]);

  const sendToAI = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setStatus("thinking");
    setTranscript("");

    const userMsg: Message = { role: "user", text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/api/chat/voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          tool: "chat",
          session_id: "voice_ai_session",
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const reply = data.response || data.message || "I couldn't process that. Please try again.";

      const aiMsg: Message = { role: "ai", text: reply, ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setError("");
      speakText(reply);
    } catch {
      setError("Connection issue. Please try again.");
      setStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  }, [speakText]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (synthRef.current) synthRef.current.cancel();

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setError("");
    };

    rec.onresult = (e: any) => {
      const t = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(t);

      // Send immediately on final result (fastest possible)
      if (e.results[e.results.length - 1].isFinal) {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
          rec.stop();
          sendToAI(t);
        }, 200);
      }
    };

    rec.onerror = (e: any) => {
      setError(e.error === "no-speech" ? "No speech detected. Tap mic and speak clearly." : `Error: ${e.error}`);
      setIsListening(false);
      setStatus("idle");
    };

    rec.onend = () => {
      setIsListening(false);
      // Do NOT auto-send here — onresult already handles it
    };

    recognitionRef.current = rec;
    rec.start();
  }, [sendToAI, status, transcript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus("idle");
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
  }, []);

  const toggleListen = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m && synthRef.current) synthRef.current.cancel();
      return !m;
    });
  }, []);

  const resetConversation = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    recognitionRef.current?.stop();
    setMessages([]);
    setTranscript("");
    setStatus("idle");
    setIsListening(false);
    setIsSpeaking(false);
    setError("");
  }, []);

  const statusLabel: Record<string, string> = {
    idle: "Tap mic to speak",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "AI is responding...",
  };

  const statusColor: Record<string, string> = {
    idle: "rgba(255,255,255,0.3)",
    listening: "#EC4899",
    thinking: "#8B5CF6",
    speaking: "#06B6D4",
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32, textAlign: "center" }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 30,
          background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
          fontSize: 11, fontWeight: 900, color: "#8B5CF6", letterSpacing: 1.5, marginBottom: 16
        }}>
          <Zap size={12} /> STUDENT ONLY · VOICE AI
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-1.5px", marginBottom: 8 }}>
          Talk to Your <span className="gradient-text">AI Mentor</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Speak naturally — your AI mentor hears, understands, and responds in real-time.
        </p>
      </motion.div>

      {/* Orb + Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40, gap: 24 }}
      >
        {/* Animated Orb */}
        <div style={{ position: "relative", width: 160, height: 160 }}>
          {/* Pulse rings */}
          {(status === "listening" || status === "speaking") && [0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `2px solid ${status === "listening" ? "#EC4899" : "#06B6D4"}`,
              }}
            />
          ))}

          {/* Main orb button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleListen}
            animate={status === "thinking" ? { rotate: 360 } : { rotate: 0 }}
            transition={status === "thinking" ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
            style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              background: status === "idle"
                ? "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))"
                : status === "listening"
                  ? "linear-gradient(135deg, #EC4899, #8B5CF6)"
                  : status === "thinking"
                    ? "linear-gradient(135deg, #8B5CF6, #4338CA)"
                    : "linear-gradient(135deg, #06B6D4, #0891B2)",
              border: `2px solid ${statusColor[status]}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: status !== "idle"
                ? `0 0 40px ${statusColor[status]}60, 0 0 80px ${statusColor[status]}30`
                : "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            {status === "thinking" ? (
              <Brain size={40} color="white" />
            ) : isListening ? (
              <Mic size={40} color="white" />
            ) : (
              <MicOff size={40} color={status === "idle" ? "rgba(255,255,255,0.5)" : "white"} />
            )}
          </motion.button>
        </div>

        {/* Status text */}
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 15, fontWeight: 700,
            color: statusColor[status],
            letterSpacing: "0.5px"
          }}
        >
          {statusLabel[status]}
        </motion.div>

        {/* Live transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: "12px 20px", borderRadius: 16,
                background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)",
                color: "#EC4899", fontSize: 14, fontWeight: 600, maxWidth: 500, textAlign: "center",
                fontStyle: "italic"
              }}
            >
              "{transcript}"
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                padding: "10px 18px", borderRadius: 12,
                background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
                color: "#FF6B6B", fontSize: 13, fontWeight: 600, maxWidth: 440, textAlign: "center"
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 40 }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={toggleMute}
          style={{
            padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: muted ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.05)",
            color: muted ? "#FF6B6B" : "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer"
          }}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {muted ? "Unmute AI" : "Mute AI"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={resetConversation}
          style={{
            padding: "10px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer"
          }}
        >
          <RotateCcw size={16} /> Reset
        </motion.button>
      </div>

      {/* Conversation */}
      {messages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          ref={scrollRef}
          style={{
            maxHeight: 420, overflowY: "auto", scrollbarWidth: "none",
            display: "flex", flexDirection: "column", gap: 14, paddingRight: 4
          }}
        >
          {messages.map((msg, i) => (
            <motion.div
              key={msg.ts}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0, duration: 0.2 }}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth: "82%", padding: "14px 18px", borderRadius: msg.role === "user" ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.2))"
                  : "rgba(255,255,255,0.04)",
                border: msg.role === "user"
                  ? "1px solid rgba(139,92,246,0.3)"
                  : "1px solid rgba(255,255,255,0.07)",
                fontSize: 15, lineHeight: 1.6, color: "white", fontWeight: 500
              }}>
                {msg.role === "ai" && (
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#8B5CF6", marginBottom: 6, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    AI Mentor
                  </div>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}

          {/* Thinking indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", justifyContent: "flex-start" }}
            >
              <div style={{
                padding: "14px 18px", borderRadius: "20px 20px 20px 6px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                display: "flex", gap: 6, alignItems: "center"
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6" }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {messages.length === 0 && !isListening && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "40px 20px" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎙️</div>
          <p style={{ color: "var(--text-muted)", fontSize: 15, fontWeight: 500 }}>
            Tap the mic and ask anything — placement prep, DSA doubts, resume tips, HR questions...
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
            {["How do I crack TCS NQT?", "Explain binary search", "Help me with my resume", "HR interview tips"].map(q => (
              <motion.button
                key={q}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => sendToAI(q)}
                style={{
                  padding: "8px 16px", borderRadius: 20,
                  background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                  color: "#A78BFA", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
