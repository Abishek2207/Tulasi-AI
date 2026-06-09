"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Star, Filter, Zap, ExternalLink, Building2, BookmarkPlus, AlertTriangle, FileEdit, CheckCircle2, ScanFace, Upload } from "lucide-react";

const FILTERS = ["Remote", "Chennai", "India", "International", "Internship", "Full-time", "Fresher", "Experienced"];

interface Job {
  id: number;
  company: string;
  logo: string;
  role: string;
  location: string;
  type: string;
  experienceLevel: string;
  salary: string;
  match: number;
  priority: "High" | "Medium" | "Low";
  skills: string[];
  missingSkills: string[];
  posted: string;
  description: string;
  resumeChanges: string[];
}

const JOBS: Job[] = [
  { 
    id: 1, company: "Stripe", logo: "S", role: "Backend Engineer", location: "International", type: "Full-time", experienceLevel: "Experienced", salary: "$120k–$180k", match: 94, priority: "High", 
    skills: ["Python", "Distributed Systems", "PostgreSQL"], missingSkills: ["Kafka"], posted: "2h ago", 
    description: "Build the financial infrastructure for the internet. Work on payments APIs used by millions.",
    resumeChanges: ["Highlight your Redis caching experience under the 'E-commerce API' project.", "Quantify the latency improvements you made in your last role (e.g., 'Reduced latency by 40%')."]
  },
  { 
    id: 2, company: "Freshworks", logo: "F", role: "Frontend Developer", location: "Chennai", type: "Full-time", experienceLevel: "Fresher", salary: "₹12–18 LPA", match: 88, priority: "High", 
    skills: ["React", "TypeScript", "Redux"], missingSkills: ["Ember.js"], posted: "5h ago", 
    description: "Build next-gen customer engagement software used by businesses worldwide.",
    resumeChanges: ["Move your React portfolio link to the very top of the resume.", "Add a specific bullet point about state management in your final year project."]
  },
  { 
    id: 3, company: "Google", logo: "G", role: "STEP Intern (AI/ML)", location: "India", type: "Internship", experienceLevel: "Fresher", salary: "₹1.5L/mo", match: 82, priority: "Medium", 
    skills: ["Python", "Machine Learning"], missingSkills: ["TensorFlow", "C++"], posted: "1d ago", 
    description: "Work directly with Google Brain researchers on cutting-edge ML infrastructure.",
    resumeChanges: ["Emphasize your strong Data Structures & Algorithms foundation.", "Remove unrelated web dev projects to focus strictly on ML and Python scripts."]
  },
  { 
    id: 4, company: "Zepto", logo: "Z", role: "Data Engineer", location: "Remote", type: "Full-time", experienceLevel: "Experienced", salary: "₹20–30 LPA", match: 79, priority: "Low", 
    skills: ["Python", "SQL"], missingSkills: ["PySpark", "Airflow"], posted: "1d ago", 
    description: "Drive data decisions for India's fastest growing q-commerce platform.",
    resumeChanges: ["Add a section explicitly listing your ETL pipeline tools.", "Detail the data volume you handled in your previous SQL database."]
  },
  { 
    id: 5, company: "Postman", logo: "P", role: "SDE-1 (Full Stack)", location: "Remote", type: "Full-time", experienceLevel: "Fresher", salary: "₹14–20 LPA", match: 91, priority: "High", 
    skills: ["Node.js", "TypeScript", "GraphQL"], missingSkills: [], posted: "3h ago", 
    description: "Help 30M developers build better APIs. Work on the core Postman application.",
    resumeChanges: ["You are a strong match. Make sure your GraphQL API project is listed as the first project.", "Add 'API Design' as a core competency keyword."]
  },
  { 
    id: 6, company: "Zoho", logo: "Z", role: "Product Manager Intern", location: "Chennai", type: "Internship", experienceLevel: "Fresher", salary: "₹40k/mo", match: 74, priority: "Medium", 
    skills: ["Agile", "Wireframing"], missingSkills: ["SQL for Analytics", "A/B Testing"], posted: "2d ago", 
    description: "Drive product vision and execution for the Zoho One suite.",
    resumeChanges: ["Translate your coding experience into 'Technical Product Understanding'.", "Highlight any leadership roles in college clubs or hackathons."]
  },
];

export default function JobInternshipPage() {
  const [phase, setPhase] = useState<"upload" | "scanning" | "dashboard">("upload");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [saved, setSaved] = useState<number[]>([]);

  const startScan = async () => {
    setPhase("scanning");
    await new Promise(r => setTimeout(r, 3000));
    setPhase("dashboard");
    setSelectedJob(JOBS[0]);
  };

  const toggleFilter = (f: string) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const filteredJobs = JOBS.filter(j => {
    if (activeFilters.length === 0) return true;
    return activeFilters.some(filter => 
      j.location === filter || j.type === filter || j.experienceLevel === filter || (filter === "Remote" && j.location === "Remote")
    );
  });

  const getMatchColor = (m: number) => m >= 90 ? "#10B981" : m >= 75 ? "#F59E0B" : "#F43F5E";
  const getPriorityColor = (p: string) => p === "High" ? "#EF4444" : p === "Medium" ? "#F59E0B" : "#3B82F6";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #06B6D4, #0891B2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(6,182,212,0.4)" }}>
          <Briefcase size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Job & Internship Match</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>AI-curated opportunities based on deep resume analysis</p>
        </div>
      </div>

      {phase === "upload" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(6,182,212,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: "2px dashed rgba(6,182,212,0.4)" }}>
            <Upload size={32} color="#06B6D4" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 12 }}>Upload Your Latest Resume</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 32, lineHeight: 1.6 }}>We will scan your profile, extract your skills, and match you with the highest probability job and internship openings.</p>
          <button onClick={startScan} style={{ padding: "16px 32px", borderRadius: 16, background: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 12px 24px rgba(6,182,212,0.3)" }}>
            <ScanFace size={20} /> Analyze Profile & Match Jobs
          </button>
        </motion.div>
      )}

      {phase === "scanning" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid rgba(6,182,212,0.2)", borderTopColor: "#06B6D4" }} />
          </motion.div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>Analyzing Profile & Resume...</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Cross-referencing your skills with 10,000+ active job openings.</p>
        </div>
      )}

      {phase === "dashboard" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Filters */}
          <div style={{ padding: 20, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <Filter size={16} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Filter Matches</span>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => toggleFilter(f)}
                  style={{ padding: "8px 16px", borderRadius: 12, border: `1px solid ${activeFilters.includes(f) ? "#06B6D4" : "rgba(255,255,255,0.08)"}`, background: activeFilters.includes(f) ? "rgba(6,182,212,0.1)" : "transparent", color: activeFilters.includes(f) ? "#06B6D4" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Split View */}
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
            {/* Job List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredJobs.length === 0 && <div style={{ padding: 20, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>No jobs match selected filters.</div>}
              {filteredJobs.map(job => (
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{job.location}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><Briefcase size={11} />{job.type}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{job.posted}</span>
                  </div>
                  {job.priority === "High" && <div style={{ fontSize: 11, color: "#EF4444", background: "rgba(239,68,68,0.1)", padding: "4px 8px", borderRadius: 6, fontWeight: 700, display: "inline-block" }}>🔥 High Priority Apply</div>}
                </motion.div>
              ))}
            </div>

            {/* Job Detail (Deep Analysis) */}
            {selectedJob && (
              <motion.div key={selectedJob.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ alignSelf: "start", display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Header Card */}
                <div style={{ padding: 32, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "white" }}>{selectedJob.logo}</div>
                      <div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{selectedJob.role}</h2>
                        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}><Building2 size={15} /> {selectedJob.company}</div>
                      </div>
                    </div>
                    <div style={{ padding: "10px 18px", borderRadius: 16, background: `${getMatchColor(selectedJob.match)}15`, border: `1px solid ${getMatchColor(selectedJob.match)}30`, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: getMatchColor(selectedJob.match), fontWeight: 800, marginBottom: 2 }}>AI MATCH</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "white", lineHeight: 1 }}>{selectedJob.match}%</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[
                      { label: "Location", val: selectedJob.location, icon: <MapPin size={14} /> },
                      { label: "Type", val: selectedJob.type, icon: <Briefcase size={14} /> },
                      { label: "Salary", val: selectedJob.salary, icon: <Star size={14} /> },
                      { label: "Priority", val: selectedJob.priority, icon: <Zap size={14} />, color: getPriorityColor(selectedJob.priority) },
                    ].map((d, i) => (
                      <div key={i} style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${d.color ? d.color + "30" : "rgba(255,255,255,0.06)"}` }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>{d.icon} {d.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: d.color || "white" }}>{d.val}</div>
                      </div>
                    ))}
                  </div>
                  
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{selectedJob.description}</p>
                </div>

                {/* AI Analysis Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ padding: 24, borderRadius: 24, background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={18} color="#10B981" /> Matched Skills</h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedJob.skills.map(s => <span key={s} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontSize: 13, fontWeight: 600 }}>{s}</span>)}
                    </div>
                  </div>

                  <div style={{ padding: 24, borderRadius: 24, background: "rgba(244,63,94,0.04)", border: "1px solid rgba(244,63,94,0.15)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={18} color="#F43F5E" /> Missing Skills Gap</h3>
                    {selectedJob.missingSkills.length > 0 ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {selectedJob.missingSkills.map(s => <span key={s} style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#F43F5E", fontSize: 13, fontWeight: 600 }}>{s}</span>)}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>You meet all core technical requirements.</div>
                    )}
                  </div>
                </div>

                {/* Resume Changes Needed */}
                <div style={{ padding: 28, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><FileEdit size={18} color="#06B6D4" /> Resume Action Items</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {selectedJob.resumeChanges.map((change, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 16, borderRadius: 12, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(6,182,212,0.2)", color: "#06B6D4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                  <button style={{ flex: 1, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #06B6D4, #0891B2)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 12px 24px rgba(6,182,212,0.3)" }}>
                    Apply Now <ExternalLink size={18} />
                  </button>
                  <button onClick={() => setSaved(s => s.includes(selectedJob.id) ? s.filter(x => x !== selectedJob.id) : [...s, selectedJob.id])}
                    style={{ padding: "16px 24px", borderRadius: 16, background: saved.includes(selectedJob.id) ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${saved.includes(selectedJob.id) ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)"}`, color: saved.includes(selectedJob.id) ? "#F59E0B" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                    <BookmarkPlus size={22} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
