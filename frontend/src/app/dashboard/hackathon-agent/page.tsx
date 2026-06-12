"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AgentBadge } from "@/components/ui/AgentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { hackathonsApi, type Hackathon } from "@/lib/api";
import {
  Rocket, ExternalLink, Calendar, Globe, Users,
  RefreshCw, Wifi, WifiOff,
} from "lucide-react";

export default function HackathonAgentPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]  = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await hackathonsApi.list();
    if (res.error) {
      setError(res.error);
    } else {
      const payload: any = res.data;
      const arr = Array.isArray(payload) ? payload : (payload?.data || []);
      if (arr.length > 0) {
        const valid = (arr as Hackathon[]).filter(h => h.title?.trim() && String(h.registration_url ?? "").trim());
        setHackathons(valid);
        setLastSynced(new Date().toISOString());
      }
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F97316, #EA580C)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(249,115,22,0.35)" }}>
            <Rocket size={26} color="white" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>Hackathon Agent</h1>
              {hackathons.length > 0 ? <AgentBadge variant="live" /> : error ? <AgentBadge variant="connect" /> : <AgentBadge variant="beta" />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Real hackathons only · Source verified · No fake listings</p>
              <SyncIndicator lastSynced={lastSynced} isLoading={loading} error={!!error} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/student" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Back</Link>
          <button onClick={load} disabled={loading} style={{
            padding: "9px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
        </div>
      </div>

      {/* Data Source Notice */}
      <div style={{
        padding: "12px 18px", borderRadius: 12, marginBottom: 28,
        background: hackathons.length > 0 ? "rgba(16,185,129,0.05)" : "rgba(244,63,94,0.05)",
        border: `1px solid ${hackathons.length > 0 ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.12)"}`,
        display: "flex", alignItems: "center", gap: 10, fontSize: 13,
        color: hackathons.length > 0 ? "rgba(255,255,255,0.5)" : "#F87171",
      }}>
        {hackathons.length > 0 ? <Wifi size={14} color="#10B981" /> : <WifiOff size={14} color="#F43F5E" />}
        {hackathons.length > 0
          ? `Showing ${hackathons.length} verified hackathons from live data source. Source URL and registration links are included.`
          : error
            ? `Could not reach the hackathon data source: ${error}. Check your backend API.`
            : "Fetching hackathon data…"
        }
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 16px" }} />
          Fetching live hackathons…
        </div>
      ) : hackathons.length === 0 ? (
        <EmptyState
          icon={error ? WifiOff : Rocket}
          title={error ? "Data Source Not Connected" : "No Hackathons Available"}
          description={error
            ? "The hackathon API returned an error. Connect a live data source (Devfolio, Unstop, MLH) in your backend to see real listings."
            : "No hackathon listings are currently in the database. The backend needs to fetch from a live source."}
          ctaLabel={error ? "View Backend API" : undefined}
          ctaHref={error ? `${process.env.NEXT_PUBLIC_API_URL}/docs` : undefined}
          accent="#F97316"
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {hackathons.map((h, i) => (
            <motion.div key={h.id || i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: 24, borderRadius: 22, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(249,115,22,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", lineHeight: 1.4 }}>{h.title}</h3>
                {h.mode && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#F97316", background: "rgba(249,115,22,0.1)", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.2)", flexShrink: 0, textTransform: "capitalize" }}>
                    {h.mode}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {h.deadline && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    <Calendar size={13} color="#F59E0B" />
                    Deadline: {new Date(h.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
                {h.eligibility && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    <Users size={13} color="#8B5CF6" />
                    {h.eligibility}
                  </div>
                )}
                {h.prize && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    🏆 {h.prize}
                  </div>
                )}
                {h.source && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    <Globe size={11} />
                    Source: {h.source}
                    {h.fetched_at && ` · ${new Date(String(h.fetched_at)).toLocaleDateString()}`}
                  </div>
                )}
              </div>

              {h.description && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, flex: 1 }}>
                  {h.description.length > 120 ? h.description.slice(0, 120) + "…" : h.description}
                </p>
              )}

              {h.registration_url && (
                <a href={String(h.registration_url)} target="_blank" rel="noopener noreferrer" style={{
                  padding: "10px 0", borderRadius: 12, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
                  color: "#FB923C", fontWeight: 700, fontSize: 13, textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(249,115,22,0.18)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(249,115,22,0.1)")}>
                  Register Now <ExternalLink size={13} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
