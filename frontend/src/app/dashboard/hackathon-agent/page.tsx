"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Sparkles, Globe, Users, Calendar, ExternalLink, 
  Lightbulb, Target, LayoutDashboard, Presentation, 
  Clock, ChevronRight, CheckCircle2, Zap, ArrowLeft, Code
} from "lucide-react";

interface Hackathon {
  id: number;
  name: string;
  organizer: string;
  prize: string;
  deadline: string;
  mode: string;
  tags: string[];
  participants: string;
  link: string;
  featured: boolean;
}

const HACKATHONS: Hackathon[] = [
  { id: 1, name: "Google Solution Challenge 2025", organizer: "Google", prize: "$100,000", deadline: "Mar 30, 2025", mode: "Online", tags: ["AI", "Social Impact", "Flutter"], participants: "100K+", link: "#", featured: true },
  { id: 2, name: "HackMIT", organizer: "MIT", prize: "$50,000", deadline: "Sep 15, 2025", mode: "In-person", tags: ["Web", "AI/ML", "Hardware"], participants: "1,000", link: "#", featured: true },
  { id: 3, name: "Smart India Hackathon", organizer: "MoE, Govt of India", prize: "₹1L per winner", deadline: "Aug 20, 2025", mode: "In-person", tags: ["GovTech", "Rural", "Health"], participants: "50K+", link: "#", featured: false },
  { id: 4, name: "Unstop Hackathon Series", organizer: "Unstop", prize: "₹5L pool", deadline: "Ongoing", mode: "Online", tags: ["Open Track", "Fresher Friendly"], participants: "10K+", link: "#", featured: false },
  { id: 5, name: "DevFest Hackathon", organizer: "GDG India", prize: "₹2L + Internship", deadline: "Nov 10, 2025", mode: "Hybrid", tags: ["Firebase", "Google Cloud", "Web3"], participants: "5K+", link: "#", featured: false },
];

const IDEA_DOMAINS = ["AI / ML", "HealthTech", "EdTech", "FinTech", "GreenTech", "Web3", "Productivity", "GovTech"];

interface TeamRole { role: string; responsibility: string; }
interface ExecutionPhase { time: string; tasks: string[]; }
interface PitchSlide { title: string; points: string[]; }

interface IdeaResult { 
  id: string;
  title: string; 
  problem: string; 
  solution: string; 
  stack: string[]; 
  team: TeamRole[];
  execution24h: ExecutionPhase[];
  execution48h: ExecutionPhase[];
  pitch: PitchSlide[];
}

const MOCK_IDEAS: IdeaResult[] = [
  { 
    id: "idea_1",
    title: "MediLink AI", 
    problem: "Rural patients cannot access specialist doctors due to distance and high consultation costs, leading to delayed diagnoses.", 
    solution: "A low-bandwidth, WhatsApp-based AI triage system that assesses symptoms via voice notes and connects high-risk patients to the nearest available specialist via scheduled video calls.", 
    stack: ["FastAPI", "Twilio API", "OpenAI GPT-4o", "Firebase", "WebRTC"], 
    team: [
      { role: "Backend / AI Lead", responsibility: "Set up FastAPI, integrate OpenAI for triage logic, handle Twilio Webhooks." },
      { role: "Frontend Developer", responsibility: "Build the doctor dashboard in Next.js for viewing patient triage summaries." },
      { role: "Product / Pitch", responsibility: "Design the user flow, create the pitch deck, and record the demo." }
    ],
    execution24h: [
      { time: "Hours 1-4", tasks: ["Project setup & Git config", "Design DB schema in Firebase", "Set up Twilio sandbox"] },
      { time: "Hours 5-10", tasks: ["Build AI triage prompt engineering", "Connect WhatsApp bot to FastAPI"] },
      { time: "Hours 11-16", tasks: ["Build Doctor Dashboard skeleton", "Implement auth for doctors"] },
      { time: "Hours 17-24", tasks: ["Integrate video call API", "End-to-end testing", "Record raw demo"] }
    ],
    execution48h: [
      { time: "Hours 25-30", tasks: ["Refine UI/UX on dashboard", "Handle WhatsApp edge cases"] },
      { time: "Hours 31-38", tasks: ["Add multi-language support to AI", "Deploy to Vercel/Render"] },
      { time: "Hours 39-48", tasks: ["Finalize pitch deck", "Polish demo video", "Submit project"] }
    ],
    pitch: [
      { title: "The Problem", points: ["70% of rural patients lack specialist access", "Delayed diagnoses cause preventable fatalities"] },
      { title: "The Solution", points: ["WhatsApp-first AI triage", "Zero-install for patients", "Smart routing to available doctors"] },
      { title: "Market Potential", points: ["$5B Telehealth market in emerging economies", "B2B model with rural hospitals"] },
      { title: "Our MVP", points: ["Live WhatsApp bot", "Working AI triage", "Functional Doctor Dashboard"] }
    ]
  },
  { 
    id: "idea_2",
    title: "SkillBridge", 
    problem: "College students struggle to convert theoretical coursework into practical, employable skills, failing technical interviews.", 
    solution: "An AI-powered roadmap generator that analyzes a student's GitHub and university syllabus to generate a personalized micro-project plan.", 
    stack: ["Next.js", "GitHub API", "OpenAI", "PostgreSQL", "TailwindCSS"], 
    team: [
      { role: "Fullstack Dev", responsibility: "Build Next.js app, integrate GitHub OAuth and API." },
      { role: "AI Integration", responsibility: "Develop prompts for parsing syllabus and generating roadmaps." },
      { role: "UI/UX Designer", responsibility: "Design the interactive skill radar and roadmap timeline." }
    ],
    execution24h: [
      { time: "Hours 1-4", tasks: ["Initialize Next.js", "Setup PostgreSQL via Supabase", "Implement GitHub Login"] },
      { time: "Hours 5-12", tasks: ["Fetch user repositories", "Send data to OpenAI for analysis"] },
      { time: "Hours 13-18", tasks: ["Build roadmap UI", "Render AI response in UI"] },
      { time: "Hours 19-24", tasks: ["Polish UI", "Record 2-minute pitch"] }
    ],
    execution48h: [
      { time: "Hours 25-32", tasks: ["Add 'Save Roadmap' feature", "Implement Skill Radar chart"] },
      { time: "Hours 33-40", tasks: ["Add PDF syllabus upload parsing", "Refine AI prompts"] },
      { time: "Hours 41-48", tasks: ["Deploy", "Write Devpost submission", "Finalize Pitch"] }
    ],
    pitch: [
      { title: "The Problem", points: ["High graduate unemployment", "Disconnect between academia and industry"] },
      { title: "Our Solution: SkillBridge", points: ["AI analyzes GitHub commits", "Generates missing skill roadmap", "Suggests exact projects to build"] },
      { title: "Business Model", points: ["Freemium for students", "B2B SaaS for Universities"] },
      { title: "Next Steps", points: ["Integrate with LinkedIn", "Partner with 3 local colleges"] }
    ]
  }
];

export default function HackathonAgentPage() {
  const [tab, setTab] = useState<"discover" | "generate">("discover");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<IdeaResult[] | null>(null);
  
  // Detail View State
  const [selectedIdea, setSelectedIdea] = useState<IdeaResult | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "team" | "execution" | "pitch">("overview");

  const generate = async () => {
    if (!selectedDomain) return;
    setGenerating(true);
    setIdeas(null);
    setSelectedIdea(null);
    // Simulate AI delay
    await new Promise(r => setTimeout(r, 2500));
    setIdeas(MOCK_IDEAS);
    setGenerating(false);
  };

  const viewIdeaDetails = (idea: IdeaResult) => {
    setSelectedIdea(idea);
    setDetailTab("overview");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(245,158,11,0.4)" }}>
          <Trophy size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Hackathon Agent</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Discover hackathons and generate end-to-end winning project strategies.</p>
        </div>
      </div>

      {/* Main Tabs (Only show if not in Idea Detail view) */}
      {!selectedIdea && (
        <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
          {[{ id: "discover", label: "🌍 Discover Hackathons" }, { id: "generate", label: "💡 AI Ideation & Planning" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{ padding: "10px 20px", borderRadius: 14, background: tab === t.id ? "rgba(245,158,11,0.1)" : "transparent", border: tab === t.id ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent", color: tab === t.id ? "#F59E0B" : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* VIEW: DISCOVER */}
      {!selectedIdea && tab === "discover" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="animate-slide-up">
          {HACKATHONS.map(h => (
            <motion.div key={h.id} whileHover={{ y: -2 }}
              style={{ padding: 24, borderRadius: 22, background: h.featured ? "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(255,255,255,0.01))" : "rgba(255,255,255,0.02)", border: `1px solid ${h.featured ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)"}`, transition: "border 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {h.featured && <span style={{ fontSize: 11, fontWeight: 800, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "3px 10px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>⭐ Featured</span>}
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}><Globe size={12} /> {h.mode}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{h.name}</h3>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Organized by {h.organizer}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {h.tags.map(tag => <span key={tag} style={{ fontSize: 12, color: "#F59E0B", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>{tag}</span>)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "white" }}>{h.prize}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {h.deadline}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={12} /> {h.participants}</span>
                  </div>
                  <a href={h.link} target="_blank" rel="noreferrer"
                    style={{ padding: "10px 20px", borderRadius: 12, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    View Hackathon <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* VIEW: GENERATE IDEAS */}
      {!selectedIdea && tab === "generate" && (
        <div className="animate-slide-up">
          <div className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Sparkles color="#F59E0B" />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "white" }}>What are you building for?</h2>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Select a domain to generate tailored problem statements and MVP ideas designed to win hackathons.</p>
            
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              {IDEA_DOMAINS.map(d => (
                <button key={d} onClick={() => setSelectedDomain(d)}
                  style={{ padding: "12px 20px", borderRadius: 12, border: `1px solid ${selectedDomain === d ? "#F59E0B" : "rgba(255,255,255,0.1)"}`, background: selectedDomain === d ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)", color: selectedDomain === d ? "#F59E0B" : "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                  {d}
                </button>
              ))}
            </div>
            
            <button onClick={generate} disabled={!selectedDomain || generating}
              style={{ width: "100%", padding: "18px", borderRadius: 16, background: selectedDomain ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(255,255,255,0.05)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: selectedDomain ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: !selectedDomain ? 0.5 : 1, transition: "all 0.3s" }}
              className={selectedDomain ? "hover-lift" : ""}>
              {generating ? (
                <>
                  <div className="orbital-spinner" style={{ width: 20, height: 20, borderTopColor: "white", borderRightColor: "rgba(255,255,255,0.5)" }} /> 
                  Synthesizing Ideas...
                </>
              ) : (
                <><Zap size={20} /> Generate Winning Strategies</>
              )}
            </button>
          </div>

          {ideas && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.6)", paddingLeft: 8 }}>Generated Concepts</h3>
              {ideas.map((idea, i) => (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass-card premium-glow" style={{ padding: 28, cursor: "pointer" }} onClick={() => viewIdeaDetails(idea)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lightbulb size={20} color="#F59E0B" />
                      </div>
                      <h3 style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{idea.title}</h3>
                    </div>
                    <button style={{ background: "transparent", border: "none", color: "#F59E0B", display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      View Plan <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>CORE PROBLEM</div>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{idea.problem}</p>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {idea.stack.slice(0, 4).map(s => <span key={s} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 8 }}>{s}</span>)}
                    {idea.stack.length > 4 && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "4px" }}>+{idea.stack.length - 4} more</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: IDEA DETAILS WIZARD */}
      {selectedIdea && (
        <div className="animate-slide-in-right">
          <button onClick={() => setSelectedIdea(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={16} /> Back to Ideas
          </button>
          
          <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #F59E0B, #D97706)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(245,158,11,0.3)" }}>
                <Target size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>{selectedIdea.title}</h2>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", display: "flex", gap: 12, marginTop: 4 }}>
                  <span>Hackathon Execution Strategy</span>
                </div>
              </div>
            </div>
            
            {/* Strategy Tabs */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginTop: 24 }}>
              {[
                { id: "overview", icon: <LayoutDashboard size={16}/>, label: "Overview" },
                { id: "team", icon: <Users size={16}/>, label: "Team & Roles" },
                { id: "execution", icon: <Clock size={16}/>, label: "Execution Plan" },
                { id: "pitch", icon: <Presentation size={16}/>, label: "Pitch Deck" }
              ].map(t => (
                <button key={t.id} onClick={() => setDetailTab(t.id as any)}
                  style={{ padding: "10px 16px", borderRadius: 12, background: detailTab === t.id ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: detailTab === t.id ? "white" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", transition: "all 0.2s" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ minHeight: 400 }}>
            {/* DETAIL: OVERVIEW */}
            {detailTab === "overview" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#F43F5E", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Target size={14}/> THE PROBLEM</div>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{selectedIdea.problem}</p>
                  </div>
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#10B981", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Lightbulb size={14}/> THE SOLUTION</div>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{selectedIdea.solution}</p>
                  </div>
                </div>
                
                <div className="glass-card" style={{ padding: 24 }}>
                   <div style={{ fontSize: 12, fontWeight: 800, color: "#8B5CF6", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Code size={14}/> TECH STACK</div>
                   <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                     {selectedIdea.stack.map(s => (
                       <span key={s} style={{ fontSize: 13, color: "white", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", padding: "6px 14px", borderRadius: 10, fontWeight: 600 }}>{s}</span>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {/* DETAIL: TEAM */}
            {detailTab === "team" && (
              <div className="animate-fade-in glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20 }}>Recommended Team Structure</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {selectedIdea.team.map((member, i) => (
                    <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Users size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 4 }}>{member.role}</div>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{member.responsibility}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DETAIL: EXECUTION */}
            {detailTab === "execution" && (
              <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={18} /> 24-Hour Hackathon Plan
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
                    <div style={{ position: "absolute", left: 15, top: 10, bottom: 10, width: 2, background: "rgba(255,255,255,0.05)" }} />
                    {selectedIdea.execution24h.map((phase, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, position: "relative", zIndex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 16, background: "#18181A", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <CheckCircle2 size={14} color="#F59E0B" />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{phase.time}</div>
                          <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.6 }}>
                            {phase.tasks.map((task, j) => <li key={j}>{task}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#06B6D4", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={18} /> Ext. 48-Hour Plan (Optional)
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
                    <div style={{ position: "absolute", left: 15, top: 10, bottom: 10, width: 2, background: "rgba(255,255,255,0.05)" }} />
                    {selectedIdea.execution48h.map((phase, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, position: "relative", zIndex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 16, background: "#18181A", border: "2px solid #06B6D4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <CheckCircle2 size={14} color="#06B6D4" />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{phase.time}</div>
                          <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.6 }}>
                            {phase.tasks.map((task, j) => <li key={j}>{task}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DETAIL: PITCH DECK */}
            {detailTab === "pitch" && (
              <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                {selectedIdea.pitch.map((slide, i) => (
                  <div key={i} className="glass-card" style={{ padding: 24, display: "flex", gap: 20 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "rgba(255,255,255,0.1)", lineHeight: 1 }}>0{i+1}</div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 12 }}>{slide.title}</h4>
                      <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6 }}>
                        {slide.points.map((pt, j) => <li key={j}>{pt}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
                
                <div style={{ padding: 20, borderRadius: 14, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", marginTop: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#10B981", marginBottom: 4 }}>💡 Pro Tip for Demo</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Focus 80% of your presentation on the live demo. Judges care more about what you built than your slides. Ensure the core 'wow' feature works perfectly.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </motion.div>
  );
}
