"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { jobsApi, type JobListing } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import {
  BriefcaseBusiness, ExternalLink, MapPin, Calendar,
  RefreshCw, Wifi, WifiOff, Sparkles, DollarSign,
} from "lucide-react";

export default function SeniorJobMatchPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]  = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    let skills = (session?.user as any)?.skills?.join(",") || "";
    if (!skills) skills = "senior, lead, principal, architect"; // Default for seniors
    const res = await jobsApi.list(skills ? { skills } : undefined);
    if (res.error) {
      setError(res.error);
    } else {
      const payload: any = res.data;
      const arr = Array.isArray(payload) ? payload : (payload?.data || []);
      if (arr.length > 0) {
        const valid = (arr as JobListing[]).filter(j => j.title?.trim() && j.company?.trim());
        setJobs(valid);
        setLastSynced(new Date().toISOString());
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [session]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(245,158,11,0.35)" }}>
            <BriefcaseBusiness size={26} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Senior Roles Match</h1>
              {jobs.length > 0 ? <AgentBadge variant="live" /> : error ? <AgentBadge variant="connect" /> : <AgentBadge variant="beta" />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Executive & Senior Level · Real-time feeds</p>
              <SyncIndicator lastSynced={lastSynced} isLoading={loading} error={!!error} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/professional" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
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
          ? `${jobs.length} senior opportunities fetched and matched to your profile.`
          : error
            ? `Job API error: ${error}. Using external sources like Remotive.`
            : "Fetching live job data..."
        }
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 16px" }} />
          Matching senior opportunities to your profile…
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={error ? WifiOff : BriefcaseBusiness}
          title={error ? "Job Data Failed" : "No Real-Time Data Could Be Found"}
          description={error
            ? "The backend job/internship API returned an error."
            : "No live job listings matching your skills are currently available from our sources. Please try again later."}
          ctaLabel="Update Profile Skills"
          ctaHref={`/dashboard/profile`}
          accent="#F59E0B"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map((job, i) => (
            <motion.div key={job.id || i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: "20px 24px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20, alignItems: "flex-start", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.25)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>

              {/* Company Initial */}
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#F59E0B", flexShrink: 0 }}>
                {job.company[0]}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 3 }}>{job.title}</h3>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{job.company}</span>
                  </div>
                  {job.stipend && (
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                      <DollarSign size={12} />{job.stipend}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
                  {job.location && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      <MapPin size={12} /> {job.location}
                    </span>
                  )}
                  {job.remote && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", background: "rgba(245,158,11,0.08)", padding: "2px 8px", borderRadius: 6 }}>Remote</span>
                  )}
                  {job.posted_date && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                      <Calendar size={12} /> {new Date(job.posted_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>

                {job.skills_required && job.skills_required.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {job.skills_required.slice(0, 5).map(skill => (
                      <span key={skill} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {job.apply_link && (
                    <a href={job.apply_link} target="_blank" rel="noopener noreferrer" style={{
                      padding: "8px 20px", borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                      color: "#F59E0B", fontWeight: 700, fontSize: 13, textDecoration: "none",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      Apply Now <ExternalLink size={12} />
                    </a>
                  )}
                  {job.source && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>via {job.source}</span>
                  )}
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
