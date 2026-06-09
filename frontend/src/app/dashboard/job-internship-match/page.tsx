"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, MapPin, Clock, ExternalLink, Sparkles, Search, Filter, TrendingUp, Star } from "lucide-react";

const SAMPLE_JOBS = [
  { id: 1, title: "Software Engineer", company: "Google", location: "Bengaluru, India", type: "Full-time", salary: "₹28–45 LPA", match: 94, tags: ["React", "Python", "GCP"], posted: "2d ago", logo: "G", color: "#4285F4", applyUrl: "#" },
  { id: 2, title: "SDE Intern", company: "Microsoft", location: "Hyderabad, India", type: "Internship", salary: "₹60k/month", match: 89, tags: ["C++", "Azure", "TypeScript"], posted: "1d ago", logo: "M", color: "#00A4EF", applyUrl: "#" },
  { id: 3, title: "Backend Engineer", company: "Swiggy", location: "Remote", type: "Full-time", salary: "₹18–28 LPA", match: 85, tags: ["Node.js", "Kafka", "PostgreSQL"], posted: "3d ago", logo: "S", color: "#FC8019", applyUrl: "#" },
  { id: 4, title: "ML Engineer", company: "Flipkart", location: "Bengaluru, India", type: "Full-time", salary: "₹20–35 LPA", match: 78, tags: ["Python", "TensorFlow", "Spark"], posted: "5d ago", logo: "F", color: "#F74F00", applyUrl: "#" },
  { id: 5, title: "Full Stack Intern", company: "Razorpay", location: "Bengaluru, India", type: "Internship", salary: "₹45k/month", match: 72, tags: ["React", "Node.js", "MongoDB"], posted: "1d ago", logo: "R", color: "#072654", applyUrl: "#" },
  { id: 6, title: "DevOps Engineer", company: "PhonePe", location: "Bengaluru, India", type: "Full-time", salary: "₹22–32 LPA", match: 68, tags: ["Kubernetes", "AWS", "Terraform"], posted: "4d ago", logo: "P", color: "#5F259F", applyUrl: "#" },
];

const FILTERS = ["All", "Full-time", "Internship", "Remote"];

export default function JobInternshipMatchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const toggleSave = (id: number) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);
  };

  const filtered = SAMPLE_JOBS.filter(job => {
    const matchesFilter = activeFilter === "All" || job.type === activeFilter || (activeFilter === "Remote" && job.location === "Remote");
    const matchesSearch = !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setRefreshing(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #06B6D4, #0891B2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(6,182,212,0.4)" }}>
          <BriefcaseBusiness size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px", fontFamily: "var(--font-outfit)" }}>Job & Internship Match</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>AI-curated opportunities matched to your profile</p>
        </div>
        <button onClick={refresh} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 14, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06B6D4", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {refreshing ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={15} /></motion.div> : <Sparkles size={15} />}
          Refresh Matches
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "New Matches Today", value: "6", color: "#06B6D4" },
          { label: "Avg Match Score", value: "81%", color: "#10B981" },
          { label: "Applications Sent", value: "3", color: "#8B5CF6" },
        ].map(s => (
          <div key={s.label} style={{ padding: "20px 24px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
          <Search size={16} color="rgba(255,255,255,0.3)" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jobs, companies..."
            style={{ background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, flex: 1, fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{ padding: "10px 18px", borderRadius: 14, border: `1px solid ${activeFilter === f ? "#06B6D4" : "rgba(255,255,255,0.08)"}`, background: activeFilter === f ? "rgba(6,182,212,0.1)" : "transparent", color: activeFilter === f ? "#06B6D4" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((job, i) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ padding: "24px 28px", borderRadius: 22, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 20, transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; }}>
            {/* Logo */}
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${job.color}20`, border: `1px solid ${job.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: job.color, flexShrink: 0 }}>
              {job.logo}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "white" }}>{job.title}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10, background: job.type === "Internship" ? "rgba(6,182,212,0.12)" : "rgba(16,185,129,0.12)", color: job.type === "Internship" ? "#06B6D4" : "#10B981" }}>{job.type}</span>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 10 }}>{job.company}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.4)" }}><MapPin size={12} />{job.location}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.4)" }}><Clock size={12} />{job.posted}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#10B981" }}>{job.salary}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {job.tags.map(t => <span key={t} style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>{t}</span>)}
                </div>
              </div>
            </div>

            {/* Match + Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: job.match >= 85 ? "#10B981" : job.match >= 70 ? "#F59E0B" : "#F43F5E" }}>{job.match}%</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>MATCH</div>
              </div>
              <button onClick={() => toggleSave(job.id)}
                style={{ width: 36, height: 36, borderRadius: 12, background: savedJobs.includes(job.id) ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${savedJobs.includes(job.id) ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={16} color={savedJobs.includes(job.id) ? "#F59E0B" : "rgba(255,255,255,0.4)"} fill={savedJobs.includes(job.id) ? "#F59E0B" : "none"} />
              </button>
              <a href={job.applyUrl} style={{ textDecoration: "none" }}>
                <button style={{ padding: "10px 18px", borderRadius: 14, background: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "white", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 6px 14px rgba(6,182,212,0.25)" }}>
                  Apply <ExternalLink size={13} />
                </button>
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
