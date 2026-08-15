"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Brain, Target, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import AdaptiveCameraUX from "@/components/dashboard/AdaptiveCameraUX";
import toast from "react-hot-toast";

type State = "focused" | "distracted" | "low engagement" | "neutral" | "uncertain";

export default function FocusSystemPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("FastAPI Dependency Injection");
  const [duration, setDuration] = useState(25);
  const [session, setSession] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  const [showGame, setShowGame] = useState(false);
  const [gameData, setGameData] = useState<any>(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleCompleteSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Global exit intercept (simulated intervention)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive) {
        e.preventDefault();
        e.returnValue = "Your focus session is still active!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isActive]);

  const handleStartSession = async () => {
    try {
      const { data } = await apiFetch<any>("/api/v1/focus/start", { 
        method: "POST", 
        body: JSON.stringify({ topic, duration_minutes: duration }) 
      });
      setSession(data);
      setTimeLeft(duration * 60);
      setIsActive(true);
    } catch (e) {
      console.error(e);
      // Fallback local start
      setTimeLeft(duration * 60);
      setIsActive(true);
    }
  };

  const handleCompleteSession = async () => {
    if (session) {
      try {
        await apiFetch("/api/v1/focus/complete", { 
          method: "POST", 
          body: JSON.stringify({ session_id: session.id }) 
        });
      } catch (e) { console.error(e); }
    }
    setSession(null);
    setIsActive(false);
  };

  const loadBrainGame = async () => {
    setShowGame(true);
    setLoadingGame(true);
    setGameData(null);
    setCurrentQ(0);
    setSelectedOpt(null);
    setIsCorrect(null);
    try {
      const { data } = await apiFetch<any>(`/api/v1/focus/game?topic=${encodeURIComponent(topic)}`);
      setGameData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGame(false);
    }
  };

  const checkAnswer = (opt: string, correct: string) => {
    setSelectedOpt(opt);
    setIsCorrect(opt === correct);
  };

  const handleCameraState = (state: State) => {
    if (!isActive) return;
    
    if (state === "distracted") {
      toast("Let's switch to a 5-minute active recall challenge.", { icon: "👀", duration: 5000, style: { background: "#1e293b", color: "#fff" }});
    } else if (state === "low engagement") {
      toast("Would you like a shorter explanation or a practical example?", { icon: "💤", duration: 5000, style: { background: "#1e293b", color: "#fff" }});
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = 100 - ((timeLeft / (duration * 60)) * 100);

  return (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto", width: "100%", color: "white", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      
      {!isActive && !session && !showGame && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", maxWidth: 500 }}>
          <div style={{ width: 64, height: 64, background: "rgba(79, 70, 229, 0.1)", borderRadius: 32, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#818cf8" }}>
            <Target size={32} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Deep Focus Mode</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 40 }}>
            Enter a distraction-free environment to master your current topic.
          </p>
          
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 32, textAlign: "left" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Topic</label>
              <input 
                value={topic} onChange={e => setTopic(e.target.value)}
                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 16px", borderRadius: 12, color: "white", fontSize: 16, outline: "none", fontFamily: "var(--font-inter)" }}
              />
            </div>
            
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Duration</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[15, 25, 45, 60].map(min => (
                  <button 
                    key={min} onClick={() => setDuration(min)}
                    style={{ 
                      flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      background: duration === min ? "rgba(79, 70, 229, 0.2)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${duration === min ? "#4F46E5" : "transparent"}`,
                      color: duration === min ? "#818cf8" : "rgba(255,255,255,0.7)"
                    }}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={handleStartSession}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #4F46E5, #EC4899)", border: "none", borderRadius: 16, color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)" }}
            >
              Enter Focus Zone
            </button>
          </div>
        </motion.div>
      )}

      {(isActive || session) && !showGame && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", width: "100%", maxWidth: 600 }}>
          <div style={{ display: "inline-block", background: "rgba(79, 70, 229, 0.1)", color: "#818cf8", padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
            Focusing on: {topic}
          </div>
          
          <AdaptiveCameraUX onStateChange={handleCameraState} />
          
          <div style={{ position: "relative", width: 300, height: 300, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="300" height="300" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="150" cy="150" r="140" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="150" cy="150" r="140" fill="transparent" stroke="#4F46E5" strokeWidth="6" strokeDasharray={2 * Math.PI * 140} strokeDashoffset={(2 * Math.PI * 140) * (1 - progress / 100)} style={{ transition: "stroke-dashoffset 1s linear" }} strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: 72, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em", textShadow: "0 0 40px rgba(79, 70, 229, 0.5)" }}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 40 }}>
            <button 
              onClick={() => setIsActive(!isActive)}
              style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.1)", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
            >
              {isActive ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button 
              onClick={handleCompleteSession}
              style={{ width: 64, height: 64, borderRadius: 32, background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
            >
              <Square size={24} />
            </button>
          </div>
          
          <div style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button 
              onClick={loadBrainGame}
              style={{ padding: "12px 24px", background: "rgba(236, 72, 153, 0.1)", border: "1px solid rgba(236, 72, 153, 0.2)", borderRadius: 16, color: "#f472b6", fontSize: 15, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            >
              <Brain size={18} /> Take a Brain Break
            </button>
          </div>
        </motion.div>
      )}

      {/* Brain Training Mini Game Modal */}
      <AnimatePresence>
        {showGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.95)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 600, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 40, position: "relative" }}>
              <button onClick={() => setShowGame(false)} style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14 }}>Close</button>
              
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, color: "#f472b6" }}>
                <Brain size={24} /> <span style={{ fontSize: 18, fontWeight: 700 }}>Cognitive Training</span>
              </div>
              
              {loadingGame ? (
                <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
                  <Loader2 size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px", color: "#f472b6" }} />
                  Generating dynamic quiz based on "{topic}"...
                </div>
              ) : gameData && gameData.questions ? (
                <div>
                  <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                    {gameData.questions[currentQ].type}
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>{gameData.questions[currentQ].question}</h3>
                  
                  {gameData.questions[currentQ].context && (
                    <div style={{ background: "rgba(0,0,0,0.4)", padding: 16, borderRadius: 12, fontFamily: "monospace", fontSize: 14, color: "#818cf8", marginBottom: 24, whiteSpace: "pre-wrap" }}>
                      {gameData.questions[currentQ].context}
                    </div>
                  )}
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {gameData.questions[currentQ].options.map((opt: string, idx: number) => {
                      const isSelected = selectedOpt === opt;
                      let bg = "rgba(255,255,255,0.05)";
                      let border = "1px solid rgba(255,255,255,0.05)";
                      let color = "white";
                      
                      if (selectedOpt) {
                        const isCorrectOpt = opt === gameData.questions[currentQ].correct_answer;
                        if (isCorrectOpt) { bg = "rgba(16, 185, 129, 0.1)"; border = "1px solid #10b981"; color = "#10b981"; }
                        else if (isSelected && !isCorrect) { bg = "rgba(239, 68, 68, 0.1)"; border = "1px solid #ef4444"; color = "#ef4444"; }
                      }

                      return (
                        <button 
                          key={idx}
                          disabled={selectedOpt !== null}
                          onClick={() => checkAnswer(opt, gameData.questions[currentQ].correct_answer)}
                          style={{
                            padding: 16, borderRadius: 12, background: bg, border, color, fontSize: 15, fontWeight: 500, textAlign: "left", cursor: selectedOpt ? "default" : "pointer", transition: "all 0.2s"
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedOpt && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: isCorrect ? "#10b981" : "#ef4444", fontWeight: 700, marginBottom: 8 }}>
                        {isCorrect ? <CheckCircle2 size={18} /> : <Square size={18} />} {isCorrect ? "Correct!" : "Incorrect"}
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                        {gameData.questions[currentQ].explanation}
                      </p>
                      
                      <button 
                        onClick={() => {
                          if (currentQ < gameData.questions.length - 1) {
                            setCurrentQ(currentQ + 1);
                            setSelectedOpt(null);
                            setIsCorrect(null);
                          } else {
                            setShowGame(false);
                          }
                        }}
                        style={{ marginTop: 24, padding: "10px 20px", background: "#4F46E5", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                      >
                        {currentQ < gameData.questions.length - 1 ? "Next Question" : "Return to Focus"}
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
