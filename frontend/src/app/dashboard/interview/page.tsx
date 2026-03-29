"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { interviewApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { TiltCard } from "@/components/ui/TiltCard";
import { 
  Mic, MicOff, Volume2, VolumeX, ArrowRight, CheckCircle2, 
  TrendingUp, BrainCircuit, Terminal, Briefcase, Users, Layout, Timer,
  Video, VideoOff, Camera
} from "lucide-react";

const ROLES = [
  "Software Engineer", "AI Engineer", "Data Scientist", "Backend Developer",
  "Frontend Developer", "DevOps Engineer", "Product Manager", "QA Engineer",
  "Cybersecurity Engineer", "Full Stack Developer", "ML Engineer", "Cloud Engineer",
];

const INTERVIEW_TYPES = [
  { id: "Technical", icon: <Terminal size={24} />, desc: "DSA, logic, and core coding" },
  { id: "HR / Behavioral", icon: <Users size={24} />, desc: "STAR method and culture fit" },
  { id: "System Design", icon: <Layout size={24} />, desc: "Architecture and scalability" },
  { id: "Coding", icon: <Briefcase size={24} />, desc: "Live walkthrough and debugging" },
];

function VoiceWave({ active, color }: { active: boolean; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 24 }}>
      {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6].map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { height: [8, 24 * h, 8] } : { height: 8 }}
          transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
          style={{ width: 3, background: color, borderRadius: 2 }}
        />
      ))}
    </div>
  );
}

const COMPANIES = [
  "Google", "Amazon", "Meta", "Apple", "Netflix", "Microsoft",
  "Startup", "Any Company", "TCS", "Infosys", "IBM", "Deloitte",
];

interface Feedback {
  score: number;
  grade: string;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export default function InterviewPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || COMPANIES[0];
  
  const [role, setRole] = useState(ROLES[0]);
  const [company, setCompany] = useState(initialCompany);
  const [interviewType, setInterviewType] = useState("Technical");
  const [numQuestions, setNumQuestions] = useState(5);
  const [phase, setPhase] = useState<"setup" | "active" | "feedback">("setup");
  const [sessionId, setSessionId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionNum, setQuestionNum] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (cameraEnabled && phase !== "feedback") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => setStream(s))
        .catch(err => {
          console.error("Camera error:", err);
          setCameraEnabled(false);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [cameraEnabled, phase]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "active" && timeLeft > 0 && !loading) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && phase === "active") {
      submitAnswer();
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, loading]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(120);
      if (voiceEnabled) speakQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  const speakQuestion = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.start();
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    trackEvent("interview_started", { role, company, type: interviewType });
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const data = await interviewApi.start(role, company, interviewType, token);
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      setQuestionNum(1);
      setPhase("active");
    } catch (e: any) {
      setError(e.message || "Failed to initialize interview engine.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const data = await interviewApi.answer(answer, sessionId, token);
      setAnswer("");
      if ((data as any).status === "completed") {
        setFeedback((data as any).feedback);
        setPhase("feedback");
      } else {
        const nextQ = (data as any).question || "End of Session";
        setCurrentQuestion(nextQ);
        setQuestionNum((prev) => prev + 1);
      }
    } catch (e: any) {
      setError(e.message || "Error processing response.");
    } finally {
      setLoading(false);
      setIsListening(false);
    }
  };

  const reset = () => {
    setPhase("setup");
    setSessionId("");
    setCurrentQuestion("");
    setAnswer("");
    setFeedback(null);
    setError("");
    setQuestionNum(1);
  };

  const getScoreColor = (score: number) => (score >= 80 ? "#43E97B" : score >= 60 ? "#FFD93D" : "#FF6B6B");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60, position: "relative" }}>
      {/* Background radial gradient */}
      <div style={{ 
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", 
        width: "100%", height: 400, background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 70%)", 
        pointerEvents: "none", zIndex: -1 
      }} />

      <div style={{ textAlign: "center", marginBottom: 48, padding: "0 10px" }}>
        <h1 className="hero-title" style={{ fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16, letterSpacing: "-1.5px" }}>
          AI <span className="gradient-text">Mock Interviews</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "clamp(15px, 2vw, 18px)", maxWidth: 550, margin: "0 auto", lineHeight: 1.6 }}>
          Experience high-fidelity, real-time interviews. Instant scoring across 
          DS&A, behavioral, and system design criteria.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP PHASE */}
        {phase === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card card-padding" style={{ marginBottom: 32, background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124, 58, 237, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                  <Briefcase size={20} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Configure Simulation</h2>
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>Target Career Path</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      style={{
                        padding: "10px 18px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                        background: role === r ? "rgba(124, 58, 237, 0.15)" : "transparent",
                        color: role === r ? "var(--brand-primary)" : "var(--text-secondary)",
                        border: `1px solid ${role === r ? "var(--brand-primary)" : "var(--border)"}`,
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Grid */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1.5px" }}>Assessment Domain</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 16 }}>
                  {INTERVIEW_TYPES.map((t) => (
                    <TiltCard
                      key={t.id}
                      intensity={5}
                      onClick={() => setInterviewType(t.id)}
                      style={{
                        padding: "20px", cursor: "pointer", textAlign: "left",
                        background: interviewType === t.id ? "rgba(6, 182, 212, 0.08)" : "transparent",
                        border: `1px solid ${interviewType === t.id ? "var(--brand-secondary)" : "var(--border)"}`,
                      }}
                    >
                      <div style={{ color: interviewType === t.id ? "var(--brand-secondary)" : "var(--text-muted)", marginBottom: 12 }}>{t.icon}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: interviewType === t.id ? "white" : "var(--text-primary)" }}>{t.id}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{t.desc}</div>
                    </TiltCard>
                  ))}
                </div>
              </div>

              <div className="responsive-grid" style={{ marginBottom: 40 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1.5px" }}>Simulated Organization</label>
                  <select value={company} onChange={(e) => setCompany(e.target.value)} className="input-field" style={{ width: "100%", height: 50, borderRadius: 12, background: "rgba(0,0,0,0.2)" }}>
                    {COMPANIES.map((c) => <option key={c} value={c} style={{ background: "#05070D" }}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
                <div className="glass-card" style={{ padding: 24, textAlign: "left" }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", display: "block", marginBottom: 12 }}>TOTAL QUESTIONS</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[3, 5, 8, 10].map(n => (
                      <button key={n} onClick={() => setNumQuestions(n)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: numQuestions === n ? "#8B5CF615" : "rgba(255,255,255,0.03)", color: numQuestions === n ? "#8B5CF6" : "var(--text-muted)", border: `1px solid ${numQuestions === n ? "#8B5CF6" : "rgba(255,255,255,0.06)"}`, fontWeight: 700, cursor: "pointer" }}>{n}</button>
                    ))}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: 24, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", display: "block" }}>VOICE MODE 🎙️</label>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>AI will speak and listen</p>
                      </div>
                      <button 
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        style={{ 
                          width: 50, height: 26, borderRadius: 20, padding: 4, cursor: "pointer", transition: "all 0.3s",
                          background: voiceEnabled ? "#8B5CF6" : "rgba(255,255,255,0.1)", border: "none"
                        }}
                      >
                        <motion.div animate={{ x: voiceEnabled ? 24 : 0 }} style={{ width: 18, height: 18, background: "white", borderRadius: "50%" }} />
                      </button>
                   </div>
                </div>
                <div className="glass-card" style={{ padding: 24, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", display: "block" }}>VIDEO MODE 🎥</label>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Show your professional posture</p>
                      </div>
                      <button 
                        onClick={() => setCameraEnabled(!cameraEnabled)}
                        style={{ 
                          width: 50, height: 26, borderRadius: 20, padding: 4, cursor: "pointer", transition: "all 0.3s",
                          background: cameraEnabled ? "#06B6D4" : "rgba(255,255,255,0.1)", border: "none"
                        }}
                      >
                        <motion.div animate={{ x: cameraEnabled ? 24 : 0 }} style={{ width: 18, height: 18, background: "white", borderRadius: "50%" }} />
                      </button>
                   </div>
                </div>
              </div>

              {cameraEnabled && stream && (
                <div style={{ marginBottom: 32, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", position: "relative", height: 240, background: "#000" }}>
                   <video 
                     autoPlay muted playsInline 
                     ref={v => { if (v) v.srcObject = stream; }}
                     style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                   />
                   <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: 4, fontSize: 10, color: "white", fontWeight: 700 }}>PREVIEW</div>
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={startInterview}
                disabled={loading}
                className="btn-primary"
                style={{ width: "100%", padding: 18, borderRadius: 16, fontSize: 16, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 10px 30px rgba(124, 58, 237, 0.2)" }}
              >
                {loading ? "Engaging AI Interlocutor..." : `INITIALIZE INTERVIEW ENGINE `} <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ACTIVE PHASE - PROFESSIONAL VIDEO CALL UI */}
        {phase === "active" && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, height: "calc(100vh - 250px)", minHeight: 600 }}>
            
            {/* Primary Video / Interaction Area */}
            <div className="glass-card" style={{ padding: 0, background: "rgba(0,0,0,0.4)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Progress Bar top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "rgba(139,92,246,0.1)", zIndex: 20 }}>
                   <motion.div animate={{ width: `${(timeLeft / 120) * 100}%` }} style={{ height: "100%", background: "#8B5CF6", boxShadow: "0 0 10px #8B5CF6" }} />
                </div>

                {/* Video Feed or Placeholder */}
                <div style={{ flex: 1, position: "relative", background: "#05070D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {cameraEnabled && stream ? (
                      <video 
                        autoPlay muted playsInline 
                        ref={v => { if (v) v.srcObject = stream; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                      />
                   ) : (
                      <div style={{ textAlign: "center", opacity: 0.5 }}>
                         <VideoOff size={64} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                         <p style={{ fontSize: 14, fontWeight: 700 }}>Camera is Disabled</p>
                      </div>
                   )}

                   {/* On-video Overlays */}
                   <div style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", padding: "6px 14px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
                         <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F43F5E", boxShadow: "0 0 6px #F43F5E" }} />
                         <span style={{ fontSize: 11, fontWeight: 900, color: "white", letterSpacing: 1 }}>SESSION LIVE</span>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", padding: "6px 14px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, color: timeLeft < 30 ? "#F43F5E" : "white" }}>
                         <Timer size={14} />
                         <span style={{ fontSize: 12, fontWeight: 800 }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                      </div>
                   </div>

                   {/* Self Name Tag */}
                   <div style={{ position: "absolute", bottom: 24, left: 24, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 800, color: "white" }}>
                      {session?.user?.name || "Candidate"} (You)
                   </div>

                   {/* Interactive Controls Bar Overlay */}
                   <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 12, zIndex: 30 }}>
                      <button onClick={() => setCameraEnabled(!cameraEnabled)} style={{ width: 48, height: 48, borderRadius: "50%", background: cameraEnabled ? "rgba(255,255,255,0.1)" : "#F43F5E", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                         {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                      </button>
                      <button onClick={startListening} className={isListening ? "pulse" : ""} style={{ width: 48, height: 48, borderRadius: "50%", background: isListening ? "#F43F5E" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", position: "relative" }}>
                         {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                         {isListening && <div style={{ position: "absolute", bottom: -24 }}><VoiceWave active color="#F43F5E" /></div>}
                      </button>
                      <button onClick={() => setVoiceEnabled(!voiceEnabled)} style={{ width: 48, height: 48, borderRadius: "50%", background: voiceEnabled ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                         {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      </button>
                      <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)" }} />
                      <button onClick={reset} style={{ padding: "0 24px", height: 48, borderRadius: 24, background: "#F43F5E", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 11, letterSpacing: 1.5 }}>
                         LEAVE SESSION
                      </button>
                   </div>
                </div>

                {/* Subtitles Overlay */}
                {isListening && answer && (
                  <div style={{ position: "absolute", bottom: 100, left: "10%", right: "10%", textAlign: "center", zIndex: 40 }}>
                     <div style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", padding: "12px 24px", borderRadius: 12, display: "inline-block", fontSize: 16, border: "1px solid rgba(255,255,255,0.1)", color: "white" }}>
                        {answer}
                     </div>
                  </div>
                )}
            </div>

            {/* AI Interlocutor Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
               {/* Question Box */}
                <div className="glass-card" style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" }}>
                   {/* Virtual Interlocutor Avatar */}
                   <div style={{ height: 180, borderRadius: 12, background: "#0c0e14", marginBottom: 20, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7, filter: "grayscale(100%) contrast(1.2)" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #0c0e14 0%, transparent 50%)" }} />
                      {isSpeaking && <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)" }}><VoiceWave active color="#8B5CF6" /></div>}
                      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(139,92,246,0.3)", padding: "4px 10px", borderRadius: 20, fontSize: 9, fontWeight: 900, color: "white", letterSpacing: 1 }}>AI CORE</div>
                   </div>

                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 900 }}>AI</div>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "var(--brand-primary)", letterSpacing: 1.5 }}>INTERVIEWER</span>
                   </div>
                   
                   <div style={{ flex: 1, overflowY: "auto", fontSize: 18, fontWeight: 800, color: "white", lineHeight: 1.5, marginBottom: 20 }}>
                     {currentQuestion}
                  </div>

                  <div style={{ padding: "16px", background: "rgba(139,92,246,0.05)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.1)" }}>
                     <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 1 }}>HINT / TIP</div>
                     <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, fontStyle: "italic" }}>
                        Think out loud and structure your response using the STAR method if applicable.
                     </p>
                  </div>
               </div>

               {/* Transcript Box */}
               <div className="glass-card" style={{ height: 220, padding: "20px", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 12, letterSpacing: 1 }}>TRANSCRIPT HISTORY</div>
                  <div style={{ flex: 1, overflowY: "auto", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                     {answer || "Begin speaking to generate transcript..."}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim()}
                    className="btn-primary"
                    style={{ width: "100%", padding: 12, borderRadius: 10, fontWeight: 900, fontSize: 12, marginTop: 12 }}
                  >
                    {loading ? "PROCESSING..." : (questionNum === numQuestions ? "FINISH INTERVIEW" : "SUBMIT ANSWER")}
                  </motion.button>
               </div>
            </div>
          </motion.div>
        )}

        {/* FEEDBACK PHASE */}
        {phase === "feedback" && feedback && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="glass-card card-padding" style={{ textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} style={{ marginBottom: 24 }}>
                <CheckCircle2 size={84} color={getScoreColor(feedback.score)} style={{ margin: "0 auto", filter: `drop-shadow(0 0 20px ${getScoreColor(feedback.score)}40)` }} />
              </motion.div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                <h2 style={{ fontSize: "clamp(64px, 15vw, 96px)", fontWeight: 900, color: getScoreColor(feedback.score), margin: 0 }}>{feedback.score}</h2>
                <span style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 700, color: "var(--text-muted)" }}>/100</span>
              </div>

              <div style={{ 
                display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", 
                padding: "8px 24px", borderRadius: 30, border: "1px solid var(--border)", margin: "24px 0 40px" 
              }}>
                <span style={{ fontWeight: 900, fontSize: 18, color: getScoreColor(feedback.score) }}>{feedback.grade}</span>
                <span style={{ width: 4, height: 4, background: "var(--text-muted)", borderRadius: "50%" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{feedback.recommendation}</span>
              </div>

              <p style={{ fontSize: 18, color: "var(--text-primary)", lineHeight: 1.8, maxWidth: 650, margin: "0 auto 48px", fontWeight: 500 }}>
                {feedback.feedback_summary}
              </p>

              <div className="responsive-grid" style={{ gap: 16, textAlign: "left", marginBottom: 48 }}>
                <TiltCard intensity={5} style={{ background: "rgba(67, 233, 123, 0.05)", border: "1px solid rgba(67, 233, 123, 0.2)", padding: 32 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 900, color: "#43E97B", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><TrendingUp size={16} /> Architectural Strengths</h3>
                  {feedback.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 14, color: "white", marginBottom: 12, display: "flex", gap: 10, lineHeight: 1.5 }}>
                      <span style={{ color: "#43E97B", fontWeight: 900 }}>+</span> {s}
                    </div>
                  ))}
                </TiltCard>
                <TiltCard intensity={5} style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: 32 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 900, color: "#F43F5E", textTransform: "uppercase", letterSpacing: 2, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><BrainCircuit size={16} /> Technical Improvements</h3>
                  {feedback.improvements.map((s, i) => (
                    <div key={i} style={{ fontSize: 14, color: "white", marginBottom: 12, display: "flex", gap: 10, lineHeight: 1.5 }}>
                      <span style={{ color: "#F43F5E", fontWeight: 900 }}>→</span> {s}
                    </div>
                  ))}
                </TiltCard>
              </div>

              <div className="hero-buttons" style={{ justifyContent: "center" }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={reset} className="btn-primary" style={{ padding: "16px 40px", borderRadius: 16, fontWeight: 900, width: "100%" }}>
                  Initialize New Run
                </motion.button>
                <a href="/dashboard/certificates" style={{ textDecoration: "none", width: "100%" }}>
                  <button className="btn-ghost" style={{ padding: "16px 32px", borderRadius: 16, fontWeight: 700, width: "100%" }}>
                    Access Archive
                  </button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
