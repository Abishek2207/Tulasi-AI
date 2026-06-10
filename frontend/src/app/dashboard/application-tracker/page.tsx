"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "@/hooks/useSession";
import {
  ClipboardList, Plus, Trash2, ExternalLink, ChevronDown,
  Briefcase, CheckCircle2, Clock, X, TrendingUp,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AppStatus = "Applied" | "Shortlisted" | "Interview" | "Offer" | "Rejected";

interface Application {
  id: string;
  company: string;
  role: string;
  status: AppStatus;
  applied_date: string;
  source_url?: string;
  notes?: string;
  user_id: string;
}

const STATUSES: AppStatus[] = ["Applied", "Shortlisted", "Interview", "Offer", "Rejected"];

const STATUS_CONFIG: Record<AppStatus, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Applied:     { color: "#60A5FA", bg: "rgba(96,165,250,0.08)",   border: "rgba(96,165,250,0.2)",   icon: <Clock size={12} /> },
  Shortlisted: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.2)",   icon: <TrendingUp size={12} /> },
  Interview:   { color: "#A78BFA", bg: "rgba(167,139,250,0.08)",  border: "rgba(167,139,250,0.2)",  icon: <Briefcase size={12} /> },
  Offer:       { color: "#10B981", bg: "rgba(16,185,129,0.08)",   border: "rgba(16,185,129,0.2)",   icon: <CheckCircle2 size={12} /> },
  Rejected:    { color: "#F43F5E", bg: "rgba(244,63,94,0.08)",    border: "rgba(244,63,94,0.2)",    icon: <X size={12} /> },
};

const EMPTY: Omit<Application, "id" | "user_id"> = {
  company: "", role: "", status: "Applied",
  applied_date: new Date().toISOString().split("T")[0],
  source_url: "", notes: "",
};

export default function ApplicationTrackerPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AppStatus | "All">("All");
  const [error, setError] = useState<string | null>(null);

  // ── Load from Supabase ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("applied_date", { ascending: false });
      if (!error) setApps(data || []);
      setLoading(false);
    })();
  }, [userId]);

  // ── Add ─────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.company.trim() || !form.role.trim() || !userId) return;
    setSaving(true);
    setError(null);
    const { data, error } = await supabase
      .from("applications")
      .insert([{ ...form, user_id: userId }])
      .select()
      .single();
    if (error) {
      setError("Could not save. Make sure the 'applications' table exists in Supabase.");
    } else if (data) {
      setApps(prev => [data, ...prev]);
      setForm({ ...EMPTY });
      setShowForm(false);
    }
    setSaving(false);
  };

  // ── Update Status ────────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: AppStatus) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    await supabase.from("applications").update({ status }).eq("id", id);
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteApp = async (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id));
    await supabase.from("applications").delete().eq("id", id);
  };

  const filtered = filterStatus === "All" ? apps : apps.filter(a => a.status === filterStatus);

  // Stats
  const stats = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<AppStatus, number>);
  const responseRate = apps.length > 0
    ? Math.round(((stats.Shortlisted + stats.Interview + stats.Offer) / apps.length) * 100)
    : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(59,130,246,0.35)" }}>
            <ClipboardList size={26} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Application Tracker</h1>
              <AgentBadge variant="live" />
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Track every application stage — real data, stored securely.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/student" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
          <button onClick={() => setShowForm(true)} style={{
            padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
            border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, boxShadow: "0 8px 20px rgba(59,130,246,0.3)",
          }}>
            <Plus size={16} /> Add Application
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
              style={{
                padding: "16px 18px", borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                background: filterStatus === s ? cfg.bg : "rgba(255,255,255,0.02)",
                border: `1px solid ${filterStatus === s ? cfg.border : "rgba(255,255,255,0.06)"}`,
              }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: filterStatus === s ? cfg.color : "white", marginBottom: 4 }}>{stats[s]}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Response Rate */}
      {responseRate !== null && apps.length > 0 && (
        <div style={{ padding: "14px 20px", borderRadius: 14, marginBottom: 24, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
          <TrendingUp size={16} color="#10B981" />
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            <strong style={{ color: "#10B981" }}>{responseRate}%</strong> response rate from {apps.length} applications
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: 14, borderRadius: 14, marginBottom: 16, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", fontSize: 13, color: "#F87171" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ padding: 28, borderRadius: 24, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 20 }}>New Application</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { key: "company",      label: "Company *",    placeholder: "Google, Stripe, Zepto…" },
                { key: "role",         label: "Role *",       placeholder: "Software Engineer Intern" },
                { key: "applied_date", label: "Date Applied", placeholder: "",                         type: "date" },
                { key: "source_url",   label: "Job URL",      placeholder: "https://jobs.lever.co/…" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6 }}>Notes</label>
              <textarea value={form.notes || ""} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Recruiter name, next steps, etc."
                rows={2}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleAdd} disabled={!form.company.trim() || !form.role.trim() || saving}
                style={{ padding: "11px 28px", borderRadius: 12, background: "linear-gradient(135deg, #3B82F6, #1D4ED8)", border: "none", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {saving ? "Saving…" : "Save Application"}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); }}
                style={{ padding: "11px 20px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applications List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={apps.length === 0 ? "No Applications Yet" : `No ${filterStatus} Applications`}
          description={apps.length === 0
            ? "Track every application you send. Click 'Add Application' to log your first one."
            : `You have no applications marked as ${filterStatus} yet.`}
          ctaLabel="+ Add Application"
          onCtaClick={() => setShowForm(true)}
          accent="#3B82F6"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: "18px 22px", borderRadius: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>

                {/* Company Initial */}
                <div style={{ width: 44, height: 44, borderRadius: 14, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: cfg.color, flexShrink: 0 }}>
                  {app.company[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "white" }}>{app.company}</span>
                    {app.source_url && (
                      <a href={app.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.3)" }}>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {app.role} · {new Date(app.applied_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  {app.notes && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{app.notes}</div>}
                </div>

                {/* Status Selector */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <select
                    value={app.status}
                    onChange={e => updateStatus(app.id, e.target.value as AppStatus)}
                    style={{
                      padding: "7px 28px 7px 10px", borderRadius: 10, border: `1px solid ${cfg.border}`,
                      background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 13,
                      cursor: "pointer", outline: "none", appearance: "none",
                    }}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={12} color={cfg.color} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>

                {/* Delete */}
                <button onClick={() => deleteApp(app.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", padding: 4, display: "flex", borderRadius: 6, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#F43F5E")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
                  <Trash2 size={15} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
