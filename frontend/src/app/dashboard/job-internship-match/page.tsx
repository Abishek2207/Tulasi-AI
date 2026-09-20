"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { jobsApi } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import {
  BriefcaseBusiness, ExternalLink, MapPin,
  RefreshCw, Wifi, WifiOff, Sparkles, TrendingUp
} from "lucide-react";

export default function JobMatchPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]  = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await jobsApi.list();
    if (res.error) {
      setError(res.error);
    } else {
      const payload = (res as any).data || [];
      setJobs(payload);
      setLastSynced(new Date().toISOString());
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #06B6D4, #0E7490)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(6,182,212,0.35)" }}>
            <BriefcaseBusiness size={26} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Smart Job Match</h1>
              {jobs.length > 0 ? <AgentBadge variant="live" /> : error ? <AgentBadge variant="connect" /> : <AgentBadge variant="beta" />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Real opportunities only · Skill-matched · Source verified</p>
              <SyncIndicator lastSynced={lastSynced} isLoading={loading} error={!!error} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/student" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
          <button onClick={load} disabled={loading} style={{
            padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
        </div>
      </div>

      {/* Data Source Notice */}
      <div style={{
        padding: "12px 18px", borderRadius: 12, marginBottom: 28,
        background: jobs.length > 0 ? "rgba(16,185,129,0.05)" : "rgba(244,63,94,0.05)",
        border: `1px solid ${jobs.length > 0 ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.12)"}`,
        display: "flex", alignItems: "center", gap: 10, fontSize: 13,
        color: jobs.length > 0 ? "rgba(255,255,255,0.5)" : "#F87171",
      }}>
        {jobs.length > 0 ? <Wifi size={14} color="#10B981" /> : <WifiOff size={14} color="#F43F5E" />}
        {jobs.length > 0
          ? `${jobs.length} real opportunities fetched and matched to your skill profile via SerpApi.`
          : error
            ? `Job API error: ${error}. Cannot fetch live Google Jobs.`
            : "Fetching live job data..."
        }
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 16px" }} />
          Matching opportunities to your profile using real data…
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={error ? WifiOff : BriefcaseBusiness}
          title={error ? "Job Data Failed" : "No Real-Time Data Could Be Found"}
          description={error
            ? "The backend job/internship API returned an error or requires an API key."
            : "No live job listings matching your skills are currently available from our sources. Please try again later."}
          ctaLabel="Update Profile Skills"
          ctaHref={`/dashboard/profile`}
          accent="#06B6D4"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {jobs.map((job, i) => (
            <motion.div key={job.job_id || i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: "24px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20, alignItems: "flex-start", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>

              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#06B6D4", flexShrink: 0 }}>
                {job.company[0]}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 3 }}>{job.title}</h3>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{job.company}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: job.overall_score >= 80 ? "#10B981" : job.overall_score >= 50 ? "#F59E0B" : "#F43F5E" }}>
                      {job.overall_score}%
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Match Score</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  {job.location_fit && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      <MapPin size={12} /> {job.location_fit}
                    </span>
                  )}
                  {job.experience_fit && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      <TrendingUp size={12} /> {job.experience_fit}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {job.matched_skills?.map((skill: string) => (
                    <span key={skill} style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.2)" }}>
                      ✓ {skill}
                    </span>
                  ))}
                  {job.missing_skills?.map((skill: string) => (
                    <span key={skill} style={{ fontSize: 11, fontWeight: 600, color: "#F43F5E", background: "rgba(244,63,94,0.1)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(244,63,94,0.2)" }}>
                      ✕ {skill}
                    </span>
                  ))}
                </div>

                {job.evidence && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", marginBottom: 16 }}>
                    <Sparkles size={14} color="#06B6D4" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                      <strong>Evidence:</strong> {job.evidence} (Confidence: {job.confidence})
                    </span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <a href={job.source_url} target="_blank" rel="noopener noreferrer" style={{
                    padding: "10px 24px", borderRadius: 10, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)",
                    color: "#06B6D4", fontWeight: 700, fontSize: 13, textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    View Original Posting <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
