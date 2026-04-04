"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { Compass, Clock, Map, Target, Bot, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api";

export default function PrepPlanPage() {
  const { data: session } = useSession();
  const [role, setRole] = useState("Software Engineer");
  const [duration, setDuration] = useState(3);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/prep-plan/my-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/prep-plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, duration_months: duration }),
      });
      if (res.ok) {
        toast.success("Prep plan generated!");
        fetchPlans();
      } else {
        toast.error("Failed to generate plan");
      }
    } catch (e) {
      toast.error("Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  const ROLES = ["Software Engineer", "AI/ML Engineer", "Data Analyst", "Product Manager", "UI/UX Designer"];
  const DURATIONS = [1, 3, 6];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(16,185,129,0.1)", borderRadius: 30, color: "#10B981", marginBottom: 16 }}>
          <Map size={18} />
          <span style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>Career Architect</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 16 }}>
          Role-Based Prep Plan
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
          Generate a highly-curated, week-by-week blueprint engineered specifically for your target role and timeline.
        </p>
      </motion.div>

      {/* Generator */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 40, marginBottom: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
              <Target size={16} /> Target Role
            </label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{ width: "100%", padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 16, outline: "none" }}
            >
              {ROLES.map(r => <option key={r} value={r} style={{ background: "#0B0E14" }}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
              <Clock size={16} /> Timeline
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {DURATIONS.map(d => (
                <button 
                  key={d} 
                  onClick={() => setDuration(d)}
                  style={{
                    flex: 1, padding: 16, borderRadius: 14, border: `1px solid ${duration === d ? "#10B981" : "rgba(255,255,255,0.1)"}`,
                    background: duration === d ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: duration === d ? "#10B981" : "var(--text-secondary)",
                    fontWeight: 800, fontSize: 15, cursor: "pointer", transition: "0.2s"
                  }}
                >
                  {d} Month{d > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary" 
          style={{ width: "100%", padding: 16, borderRadius: 14, marginTop: 32, fontSize: 16, fontWeight: 800, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #10B981, #06B6D4)", color: loading ? "var(--text-muted)" : "white" }}
        >
          {loading ? "Generating Blueprint..." : "Synthesize Plan"}
          {!loading && <Bot size={20} />}
        </button>
      </motion.div>

      {/* Active Plans */}
      <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "var(--font-outfit)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <Compass color="var(--brand-primary)" /> My Strategic Blueprints
      </h2>
      
      {plans.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "rgba(255,255,255,0.02)", borderRadius: 24, border: "1px dashed rgba(255,255,255,0.1)" }}>
          <p style={{ color: "var(--text-muted)" }}>No prep plans actively running. Generate your first blueprint above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {plans.map((p) => (
            <div key={p.id} className="glass-card" style={{ padding: 32, borderLeft: "4px solid #10B981" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {p.duration} Strategy
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 900 }}>{p.plan.title}</h3>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {p.plan.weeks?.map((week: any, i: number) => (
                  <div key={i} style={{ padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <h4 style={{ fontSize: 16, fontWeight: 900, marginBottom: 12, color: "#10B981", display: "flex", alignItems: "center", gap: 8 }}>
                      <Clock size={16} /> Week {week.week}: {week.focus}
                    </h4>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {week.tasks?.map((task: string, j: number) => (
                        <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                          <CheckCircle size={16} color="rgba(255,255,255,0.2)" style={{ marginTop: 2, flexShrink: 0 }} />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
