"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { systemDesignApi } from "@/lib/api";
import {
  Server, Send, RefreshCw, ChevronRight, CheckCircle2,
  TrendingUp, Lock, HardDrive, Database, Network
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import toast from "react-hot-toast";

interface Scenario {
  title: string;
  description: string;
  solution_hints: string[];
}

interface Evaluation {
  analysis: string;
  guidance: string;
  architecture_tip: string;
  next_step: string;
}

export default function SystemDesignPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasProfile = user?.is_onboarded;

  const generateScenario = async () => {
    if (!session?.user?.accessToken) return;
    setGenerating(true);
    setEvaluations([]);
    setCurrentStep(1);
    setAnswer("");
    setError(null);
    try {
        const scenario = await systemDesignApi.generateScenario(
            (user as any)?.target_role || "Backend Engineer", 
            "Medium", 
            null, 
            session.user.accessToken
        );
        setActiveScenario(scenario);
    } catch (err: any) {
        setError(err.message || "Failed to generate scenario.");
    }
    setGenerating(false);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || loading || !activeScenario) return;
    if (!session?.user?.accessToken) {
        toast.error("Please login to use this tool");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const parsed = await systemDesignApi.guidedSolution(
          activeScenario.title,
          currentStep,
          answer,
          session.user.accessToken
      );
      if (parsed && parsed.analysis) {
          setEvaluations(prev => [...prev, parsed]);
          setAnswer("");
          setCurrentStep(s => s + 1);
      } else {
          setError("Could not get a valid response from the server.");
      }
    } catch (err: any) {
      setError(err?.message || "Could not get feedback. Please try again.");
    }
    setLoading(false);
  };

  if (!hasProfile) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
        <Header />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 32px", borderRadius: 24, background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.08)", gap: 20 }}>
          <Lock size={40} color="#3B82F6" strokeWidth={1.5} />
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 }}>Profile Required</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 380 }}>Complete your profile first so the System Design Agent can tailor complexity to your level.</p>
          </div>
          <Link href="/onboarding" style={{ padding: "12px 28px", borderRadius: 14, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60A5FA", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Complete Profile →</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 80 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, alignItems: "start" }}>
        
        {/* Generate Scenario Button */}
        {!activeScenario && (
            <div style={{ padding: 40, textAlign: "center", borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: 18, color: "white", marginBottom: 16 }}>Ready for a System Design Challenge?</h3>
                <button onClick={generateScenario} disabled={generating} style={{ padding: "12px 24px", borderRadius: 12, background: "#3B82F6", color: "white", fontWeight: 700, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {generating ? <RefreshCw className="animate-spin" size={16} /> : <Server size={16} />}
                    {generating ? "Generating Scenario..." : "Generate AI Scenario"}
                </button>
            </div>
        )}

        {/* Active Scenario */}
        {activeScenario && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{activeScenario.title}</h3>
                <button onClick={generateScenario} disabled={generating} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  <RefreshCw size={12} className={generating ? "animate-spin" : ""} /> New Scenario
                </button>
              </div>
              <p style={{ fontSize: 16, color: "white", lineHeight: 1.7, fontWeight: 500 }}>{activeScenario.description}</p>
            </div>

            {/* Evaluations Chain */}
            {evaluations.map((ev, i) => (
                <div key={i} style={{ padding: 24, borderRadius: 24, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <h4 style={{ fontSize: 14, color: "#60A5FA", fontWeight: 800, marginBottom: 12 }}>Phase {i + 1} Assessment</h4>
                    <p style={{ color: "white", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{ev.analysis}</p>
                    <div style={{ padding: 12, background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", marginBottom: 12 }}>
                        <strong style={{ color: "#F59E0B", fontSize: 12, textTransform: "uppercase" }}>Architect Tip:</strong>
                        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>{ev.architecture_tip}</p>
                    </div>
                    <div style={{ fontSize: 14, color: "#34D399", fontWeight: 700 }}>Next: {ev.guidance}</div>
                </div>
            ))}

            {/* Answer Box */}
            <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 12 }}>
                Phase {currentStep}: Your Proposal
              </label>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                rows={6}
                placeholder="Describe your design decisions, trade-offs, and architecture for this phase..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, resize: "vertical",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", fontSize: 14, lineHeight: 1.7, outline: "none",
                  fontFamily: "var(--font-inter)", boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 14 }}>
                <button
                  onClick={handleSubmit} disabled={!answer.trim() || loading}
                  style={{
                    padding: "11px 28px", borderRadius: 12, border: "none", cursor: answer.trim() && !loading ? "pointer" : "not-allowed",
                    background: answer.trim() && !loading ? "linear-gradient(135deg, #3B82F6, #1D4ED8)" : "rgba(255,255,255,0.05)",
                    color: answer.trim() && !loading ? "white" : "rgba(255,255,255,0.25)",
                    fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
                    boxShadow: answer.trim() && !loading ? "0 8px 20px rgba(59,130,246,0.35)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? <><RefreshCw size={15} className="animate-spin" /> Evaluating…</> : <><Send size={15} /> Submit & Continue</>}
                </button>
              </div>
            </div>

            {error && <div style={{ padding: 16, borderRadius: 14, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", fontSize: 13, color: "#F87171" }}>⚠️ {error}</div>}

          </div>
        )}

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </motion.div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(59,130,246,0.35)" }}>
          <Server size={26} color="white" />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>System Design Agent</h1>
            <AgentBadge variant="beta" />
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Dynamic AI scenarios · Multi-phase architectural evaluation</p>
        </div>
      </div>
      <Link href="/dashboard/professional" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
    </div>
  );
}
