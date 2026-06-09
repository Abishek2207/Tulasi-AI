"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Star, Filter, Zap, ExternalLink, Building2, TrendingUp, BookmarkPlus } from "lucide-react";

const ROLES = ["All", "Frontend", "Backend", "Full Stack", "AI/ML", "DevOps", "Product Manager", "Data Scientist"];
const TYPES = ["All", "Internship", "Full Time", "Remote", "Fresher"];

interface Job {
  id: number;
  company: string;
  logo: string;
  role: string;
  location: string;
  type: string;
  salary: string;
  match: number;
  skills: string[];
  posted: string;
  hot: boolean;
  description: string;
}

const JOBS: Job[] = [
  { id: 1, company: "Stripe", logo: "S", role: "Backend Engineer", location: "Remote", type: "Full Time", salary: "₹30–45 LPA", match: 94, skills: ["Python", "Distributed Systems", "PostgreSQL"], posted: "2h ago", hot: true, description: "Build the financial infrastructure for the internet. Work on payments APIs used by millions." },
  { id: 2, company: "Razorpay", logo: "R", role: "SDE-2 (Full Stack)", location: "Bengaluru", type: "Full Time", salary: "₹25–35 LPA", match: 88, skills: ["React", "Node.js", "Go"], posted: "5h ago", hot: true, description: "Build next-gen payment products used by 8M+ businesses across India." },
  { id: 3, company: "Google", logo: "G", role: "STEP Intern (AI/ML)", location: "Hyderabad", type: "Internship", salary: "₹2L/mo", match: 82, skills: ["Python", "TensorFlow", "ML"], posted: "1d ago", hot: false, description: "Work directly with Google Brain researchers on cutting-edge ML infrastructure." },
  { id: 4, company: "Zepto", logo: "Z", role: "Data Scientist", location: "Mumbai", type: "Full Time", salary: "₹20–30 LPA", match: 79, skills: ["Python", "SQL", "PySpark"], posted: "1d ago", hot: false, description: "Drive data decisions for India's fastest growing q-commerce platform." },
  { id: 5, company: "Postman", logo: "P", role: "Frontend Engineer (Fresher)", location: "Remote", type: "Fresher", salary: "₹12–18 LPA", match: 91, skills: ["React", "TypeScript", "GraphQL"], posted: "3h ago", hot: true, description: "Help 30M developers build better APIs. Work on the core Postman application." },
  { id: 6, company: "CRED", logo: "C", role: "DevOps / SRE", location: "Bengaluru", type: "Full Time", salary: "₹22–32 LPA", match: 74, skills: ["Kubernetes", "AWS", "Terraform"], posted: "2d ago", hot: false, description: "Build and maintain infrastructure that serves India's most premium users." },
];

export default function JobInternshipPage() {
  const [roleFilter, setRoleFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState<Job | null>(JOBS[0]);
  const [saved, setSaved] = useState<number[]>([]);

  const filtered = JOBS.filter(j =>
    (roleFilter === "All" || j.skills.some(s => s.toLowerCase().includes(roleFilter.toLowerCase())) || j.role.toLowerCase().includes(roleFilter.toLowerCase())) &&
    (typeFilter === "All" || j.type === typeFilter)
  );

  const getMatchColor = (m: number) => m >= 90 ? "#10B981" : m >= 75 ? "#F59E0B" : "#F43F5E";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #06B6D4, #0891B2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(6,182,212,0.4)" }}>
          <Briefcase size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Job & Internship Match</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>AI-curated opportunities ranked by your profile match</p>
        </div>
        <div style={{ marginLeft: "auto", padding: "10px 20px", borderRadius: 14, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#06B6D4", textTransform: "uppercase" }}>Profile Match</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "white" }}>87% avg</div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Matched Roles", val: "6", icon: <Zap size={16} color="#06B6D4" /> },
          { label: "Hot Openings", val: "3", icon: <TrendingUp size={16} color="#F43F5E" /> },
          { label: "Remote Jobs", val: "2", icon: <MapPin size={16} color="#10B981" /> },
          { label: "Saved", val: saved.length.toString(), icon: <BookmarkPlus size={16} color="#F59E0B" /> },
        ].map((stat, i) => (
          <div key={i} style={{ padding: "16px 20px", borderRadius: 18, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
            {stat.icon}
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{stat.val}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 13 }}><Filter size={14} /> Filters:</div>
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${typeFilter === t ? "#06B6D4" : "rgba(255,255,255,0.08)"}`, background: typeFilter === t ? "rgba(6,182,212,0.1)" : "transparent", color: typeFilter === t ? "#06B6D4" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Split View */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
        {/* Job List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(job => (
            <motion.div key={job.id} whileHover={{ y: -2 }} onClick={() => setSelectedJob(job)}
              style={{ padding: 20, borderRadius: 20, background: selectedJob?.id === job.id ? "rgba(6,182,212,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedJob?.id === job.id ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "white" }}>{job.logo}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{job.role}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{job.company}</div>
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: getMatchColor(job.match) }}>{job.match}%</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{job.location}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{job.posted}</span>
                {job.hot && <span style={{ fontSize: 11, color: "#F43F5E", background: "rgba(244,63,94,0.1)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>🔥 Hot</span>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Job Detail */}
        {selectedJob && (
          <motion.div key={selectedJob.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", alignSelf: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "white" }}>{selectedJob.logo}</div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{selectedJob.role}</h2>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}><Building2 size={14} /> {selectedJob.company}</div>
                </div>
              </div>
              <div style={{ padding: "8px 16px", borderRadius: 14, background: `${getMatchColor(selectedJob.match)}18`, border: `1px solid ${getMatchColor(selectedJob.match)}35` }}>
                <div style={{ fontSize: 11, color: getMatchColor(selectedJob.match), fontWeight: 800 }}>AI MATCH</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{selectedJob.match}%</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Location", val: selectedJob.location, icon: <MapPin size={14} /> },
                { label: "Type", val: selectedJob.type, icon: <Clock size={14} /> },
                { label: "Salary", val: selectedJob.salary, icon: <Star size={14} /> },
              ].map((d, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>{d.icon} {d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{d.val}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 24 }}>{selectedJob.description}</p>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase" }}>Required Skills</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selectedJob.skills.map(s => <span key={s} style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06B6D4", fontSize: 13, fontWeight: 700 }}>{s}</span>)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ flex: 1, padding: "14px", borderRadius: 14, background: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "white", fontWeight: 900, fontSize: 14, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Apply Now <ExternalLink size={16} />
              </button>
              <button onClick={() => setSaved(s => s.includes(selectedJob.id) ? s.filter(x => x !== selectedJob.id) : [...s, selectedJob.id])}
                style={{ padding: "14px 20px", borderRadius: 14, background: saved.includes(selectedJob.id) ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${saved.includes(selectedJob.id) ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`, color: saved.includes(selectedJob.id) ? "#F59E0B" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <BookmarkPlus size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
