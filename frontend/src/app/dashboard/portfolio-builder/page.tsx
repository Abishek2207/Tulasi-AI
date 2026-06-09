"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate, Github, Globe, CheckCircle2, Sparkles,
  ExternalLink, User, Briefcase, Trophy, Mail, Phone,
  Upload, FileText, ArrowLeft, ArrowRight, Eye, Code2,
  Link2, Star, Zap, Layers, Download, Copy, ChevronDown,
  Monitor, Smartphone, X, Plus
} from "lucide-react";

// ─── TYPES ─────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  github: string;
  live: string;
  achievement: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  points: string[];
}

interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

interface PortfolioData {
  // Personal
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  bio: string;
  skills: string[];
  // Content
  projects: Project[];
  experience: Experience[];
  achievements: Achievement[];
}

// ─── MOCK GENERATED DATA ───────────────────────────────────────────────────
const MOCK_PORTFOLIO: PortfolioData = {
  name: "Abishek R",
  title: "Full Stack Engineer & AI Builder",
  tagline: "I build products that scale. From neural pipelines to pixel-perfect UIs.",
  email: "abishekramamoorthy22@gmail.com",
  phone: "+91 98765 43210",
  location: "Chennai, India",
  github: "Abishek2207",
  linkedin: "abishek-r",
  website: "abishek.dev",
  bio: "Full Stack Engineer passionate about building AI-powered products that solve real-world problems. Founder of TulasiAI — a personalized career intelligence engine helping thousands of engineers land their dream roles. I thrive at the intersection of great engineering and impactful product design.",
  skills: ["TypeScript", "Next.js", "React", "Python", "FastAPI", "PostgreSQL", "Firebase", "OpenAI API", "Docker", "AWS", "Figma", "Node.js"],
  projects: [
    {
      id: "p1", name: "TulasiAI", description: "A full-stack AI career intelligence engine featuring neural skill mapping, AI mock interviews, and personalized daily missions for engineers.",
      tech: ["Next.js", "Python", "OpenAI", "PostgreSQL", "Firebase"], github: "Abishek2207/TulasiAI", live: "tulasiai.in",
      achievement: "10,000+ active users · Featured on ProductHunt"
    },
    {
      id: "p2", name: "MediLink AI", description: "A WhatsApp-based AI triage system for rural healthcare. Assesses symptoms via voice notes and routes patients to specialists.",
      tech: ["FastAPI", "Twilio", "GPT-4o", "Firebase"], github: "Abishek2207/medilink", live: "medilink.ai",
      achievement: "Won 1st Place at Google Solution Challenge 2025"
    },
    {
      id: "p3", name: "DevBoard", description: "A real-time collaborative developer dashboard integrating GitHub, Jira, and Linear into a single command centre.",
      tech: ["React", "Node.js", "WebSockets", "Redis", "PostgreSQL"], github: "Abishek2207/devboard", live: "devboard.app",
      achievement: "500+ GitHub Stars"
    },
  ],
  experience: [
    {
      id: "e1", company: "Tulasi AI Labs", role: "Founder & CEO", duration: "2024 – Present",
      points: [
        "Architected and launched TulasiAI, a personalized career OS for engineers.",
        "Led a 4-person engineering team, managing a full Next.js + Python stack.",
        "Grew to 10,000+ users within 6 months of launch with zero paid marketing.",
      ]
    },
    {
      id: "e2", company: "IIT Madras Research Park", role: "AI Research Intern", duration: "2023 – 2024",
      points: [
        "Developed NLP pipelines for resume parsing with 94% field extraction accuracy.",
        "Published research on skill-gap identification in the context of JD matching.",
        "Integrated research models directly into a production FastAPI backend.",
      ]
    },
  ],
  achievements: [
    { id: "a1", title: "1st Place, Google Solution Challenge", issuer: "Google", year: "2025" },
    { id: "a2", title: "Smart India Hackathon Finalist", issuer: "MoE, Govt of India", year: "2024" },
    { id: "a3", title: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", year: "2024" },
    { id: "a4", title: "Top 50 – ProductHunt Maker of the Year", issuer: "ProductHunt", year: "2025" },
  ],
};

// ─── TEMPLATES ─────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "dark-pro", label: "Dark Pro", desc: "OLED-black, purple glow. Premium dev aesthetic.", accent: "#8B5CF6", preview: "dark" },
  { id: "neon-green", label: "Terminal Hacker", desc: "Matrix-inspired green-on-black for systems engineers.", accent: "#10B981", preview: "dark" },
  { id: "midnight-blue", label: "Midnight Blue", desc: "Deep navy with cyan accents. Sleek & corporate.", accent: "#06B6D4", preview: "dark" },
  { id: "rose-glass", label: "Rose Glass", desc: "Warm rose-tones on glassmorphism. Bold & creative.", accent: "#F43F5E", preview: "dark" },
];

// ─── GENERATED CODE ────────────────────────────────────────────────────────
function generateCode(data: PortfolioData, accent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.name} — Portfolio</title>
  <meta name="description" content="${data.bio.slice(0, 150)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --accent: ${accent}; --bg: #050508; --card: rgba(255,255,255,0.03); }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: #F5F5F7; -webkit-font-smoothing: antialiased; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    /* NAV */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(5,5,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 18px 0; }
    nav .inner { display: flex; justify-content: space-between; align-items: center; }
    nav .logo { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; }
    nav .links { display: flex; gap: 28px; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.6); }
    nav .links a:hover { color: white; }
    /* HERO */
    #hero { min-height: 100vh; display: flex; align-items: center; padding: 80px 0 60px; background: radial-gradient(ellipse at 60% 40%, ${accent}15 0%, transparent 60%); }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; background: ${accent}15; border: 1px solid ${accent}30; font-size: 12px; font-weight: 700; color: ${accent}; margin-bottom: 28px; }
    .hero-title { font-size: clamp(40px, 6vw, 80px); font-weight: 900; letter-spacing: -0.04em; line-height: 1; margin-bottom: 20px; }
    .hero-sub { font-size: 20px; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
    .hero-bio { font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.7; max-width: 560px; margin-bottom: 36px; }
    .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-primary { padding: 14px 28px; border-radius: 14px; background: var(--accent); color: white; font-weight: 700; font-size: 15px; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 24px ${accent}40; }
    .btn-ghost { padding: 14px 28px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); font-weight: 700; font-size: 15px; cursor: pointer; }
    /* SECTION */
    section { padding: 100px 0; }
    .section-label { font-size: 12px; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
    .section-title { font-size: clamp(28px, 4vw, 44px); font-weight: 900; letter-spacing: -0.03em; margin-bottom: 16px; }
    .section-sub { font-size: 16px; color: rgba(255,255,255,0.5); margin-bottom: 56px; }
    /* SKILLS */
    .skills-grid { display: flex; flex-wrap: wrap; gap: 12px; }
    .skill-chip { padding: 8px 18px; border-radius: 40px; background: ${accent}12; border: 1px solid ${accent}25; color: ${accent}; font-size: 14px; font-weight: 600; }
    /* PROJECTS */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .project-card { background: var(--card); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; transition: transform 0.25s, border-color 0.25s; }
    .project-card:hover { transform: translateY(-4px); border-color: ${accent}40; }
    .project-title { font-size: 20px; font-weight: 800; margin-bottom: 10px; }
    .project-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 16px; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .tech-tag { font-size: 12px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.06); padding: 4px 10px; border-radius: 8px; }
    .project-achieve { font-size: 12px; font-weight: 700; color: ${accent}; background: ${accent}12; border: 1px solid ${accent}25; padding: 6px 12px; border-radius: 8px; margin-bottom: 16px; }
    .project-links { display: flex; gap: 12px; }
    .proj-link { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 10px; }
    /* EXPERIENCE */
    .exp-timeline { display: flex; flex-direction: column; gap: 32px; }
    .exp-item { position: relative; padding-left: 28px; border-left: 2px solid ${accent}30; }
    .exp-item::before { content: ''; position: absolute; left: -6px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: ${accent}; }
    .exp-role { font-size: 18px; font-weight: 800; }
    .exp-company { font-size: 14px; color: ${accent}; font-weight: 600; margin: 4px 0; }
    .exp-dur { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 12px; }
    .exp-ul { padding-left: 18px; }
    .exp-ul li { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.7; }
    /* ACHIEVEMENTS */
    .ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
    .ach-card { background: var(--card); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; }
    .ach-title { font-size: 15px; font-weight: 800; margin-bottom: 6px; }
    .ach-meta { font-size: 13px; color: rgba(255,255,255,0.5); }
    /* CONTACT */
    #contact { background: radial-gradient(ellipse at 50% 0%, ${accent}10 0%, transparent 60%); }
    .contact-card { text-align: center; max-width: 580px; margin: 0 auto; }
    .contact-email { font-size: 20px; font-weight: 800; color: ${accent}; margin: 20px 0 32px; }
    .social-links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .social-btn { padding: 12px 20px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); font-size: 14px; font-weight: 600; transition: background 0.2s; }
    .social-btn:hover { background: ${accent}15; border-color: ${accent}30; color: ${accent}; }
    /* FOOTER */
    footer { padding: 40px 0; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.3); font-size: 13px; }
  </style>
</head>
<body>

<nav>
  <div class="container inner">
    <div class="logo" style="color: ${accent}">${data.name.split(" ")[0]}<span style="color:white">.</span></div>
    <div class="links">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#experience">Experience</a>
      <a href="#contact">Contact</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section id="hero">
  <div class="container">
    <div class="hero-badge">⚡ Available for Work · ${data.location}</div>
    <h1 class="hero-title">${data.name}</h1>
    <div class="hero-sub">${data.title}</div>
    <p class="hero-bio">${data.bio}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-primary">Get In Touch →</a>
      <a href="https://github.com/${data.github}" target="_blank" class="btn-ghost">View GitHub</a>
    </div>
  </div>
</section>

<!-- ABOUT & SKILLS -->
<section id="about">
  <div class="container">
    <div class="section-label">About Me</div>
    <h2 class="section-title">Skills & Expertise</h2>
    <p class="section-sub">Technologies I use to build production-ready software.</p>
    <div class="skills-grid">
      ${data.skills.map(s => `<span class="skill-chip">${s}</span>`).join("\n      ")}
    </div>
  </div>
</section>

<!-- PROJECTS -->
<section id="projects" style="background: rgba(255,255,255,0.01);">
  <div class="container">
    <div class="section-label">Work</div>
    <h2 class="section-title">Projects That Matter</h2>
    <p class="section-sub">Real-world products built end-to-end.</p>
    <div class="projects-grid">
      ${data.projects.map(p => `
      <div class="project-card">
        <div class="project-title">${p.name}</div>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join("")}</div>
        <div class="project-achieve">🏆 ${p.achievement}</div>
        <div class="project-links">
          <a href="https://github.com/${p.github}" target="_blank" class="proj-link">GitHub ↗</a>
          <a href="https://${p.live}" target="_blank" class="proj-link">Live ↗</a>
        </div>
      </div>`).join("\n")}
    </div>
  </div>
</section>

<!-- EXPERIENCE -->
<section id="experience">
  <div class="container">
    <div class="section-label">Experience</div>
    <h2 class="section-title">Where I've Worked</h2>
    <p class="section-sub">My professional journey.</p>
    <div class="exp-timeline">
      ${data.experience.map(e => `
      <div class="exp-item">
        <div class="exp-role">${e.role}</div>
        <div class="exp-company">${e.company}</div>
        <div class="exp-dur">${e.duration}</div>
        <ul class="exp-ul">${e.points.map(pt => `<li>${pt}</li>`).join("")}</ul>
      </div>`).join("\n")}
    </div>
  </div>
</section>

<!-- ACHIEVEMENTS -->
<section style="background: rgba(255,255,255,0.01);">
  <div class="container">
    <div class="section-label">Recognition</div>
    <h2 class="section-title">Achievements</h2>
    <p class="section-sub">Awards, certifications & milestones.</p>
    <div class="ach-grid">
      ${data.achievements.map(a => `
      <div class="ach-card">
        <div style="font-size:24px;margin-bottom:10px;">🏅</div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-meta">${a.issuer} · ${a.year}</div>
      </div>`).join("\n")}
    </div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact">
  <div class="container">
    <div class="contact-card">
      <div class="section-label" style="text-align:center">Let's Talk</div>
      <h2 class="section-title">Get In Touch</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:16px;margin-bottom:16px;">Whether you have a project, an opportunity, or just want to say hi — my inbox is open.</p>
      <a href="mailto:${data.email}" class="contact-email">${data.email}</a>
      <div class="social-links">
        <a href="https://github.com/${data.github}" target="_blank" class="social-btn">GitHub</a>
        <a href="https://linkedin.com/in/${data.linkedin}" target="_blank" class="social-btn">LinkedIn</a>
        ${data.website ? `<a href="https://${data.website}" target="_blank" class="social-btn">Website</a>` : ""}
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="container">Built with ❤️ by ${data.name} · Powered by TulasiAI Portfolio Builder</div>
</footer>

</body>
</html>`;
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────
type Step = "input" | "generating" | "preview" | "code";

export default function PortfolioBuilderPage() {
  const [step, setStep] = useState<Step>("input");
  const [template, setTemplate] = useState("dark-pro");
  const [inputMethod, setInputMethod] = useState<"manual" | "upload">("manual");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generationStage, setGenerationStage] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioData>(MOCK_PORTFOLIO);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [activePreviewSection, setActivePreviewSection] = useState<"hero" | "projects" | "experience" | "achievements" | "contact">("hero");
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedTemplate = TEMPLATES.find(t => t.id === template)!;
  const accent = selectedTemplate.accent;

  const GENERATION_STAGES = [
    "Parsing resume & extracting data...",
    "Crafting hero tagline & bio...",
    "Generating project narratives...",
    "Building experience section...",
    "Compiling achievements...",
    "Assembling GitHub-ready code...",
    "Finalizing layout & styles...",
  ];

  const generate = async () => {
    setStep("generating");
    for (let i = 0; i < GENERATION_STAGES.length; i++) {
      setGenerationStage(i);
      await new Promise(r => setTimeout(r, 500));
    }
    await new Promise(r => setTimeout(r, 400));
    setStep("preview");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  }, []);

  const copyCode = () => {
    const code = generateCode(portfolio, accent);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const code = generateCode(portfolio, accent);
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const PREVIEW_SECTIONS = [
    { id: "hero", label: "Hero" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "achievements", label: "Achievements" },
    { id: "contact", label: "Contact" },
  ] as const;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
        <div style={{ width: 52, height: 52, borderRadius: 18, background: "linear-gradient(135deg, #EC4899, #BE185D)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(236,72,153,0.4)" }}>
          <LayoutTemplate size={26} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.5px" }}>Portfolio Builder</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>AI generates your premium, recruiter-ready portfolio site in seconds.</p>
        </div>

        {/* Step pill */}
        {step !== "generating" && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 40, padding: "6px 16px" }}>
            {(["input", "preview", "code"] as const).map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: step === s ? "#EC4899" : (["input", "preview", "code"].indexOf(step) > i ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.06)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "white", transition: "all 0.3s" }}>{i + 1}</div>
                {i < 2 && <div style={{ width: 16, height: 1, background: "rgba(255,255,255,0.1)" }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── STEP 1: INPUT ─── */}
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* LEFT: Template + Input Method */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Template */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Choose Template</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => setTemplate(t.id)}
                        style={{ padding: "14px 16px", borderRadius: 14, border: `1px solid ${template === t.id ? t.accent : "rgba(255,255,255,0.07)"}`, background: template === t.id ? `${t.accent}12` : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.accent, boxShadow: `0 0 8px ${t.accent}80`, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{t.label}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{t.desc}</div>
                        </div>
                        {template === t.id && <CheckCircle2 size={16} color={t.accent} style={{ marginLeft: "auto" }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Method Toggle */}
                <div className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Input Method</div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    {[{ id: "manual", label: "Manual Entry", icon: <User size={15} /> }, { id: "upload", label: "Upload Resume", icon: <Upload size={15} /> }].map(m => (
                      <button key={m.id} onClick={() => setInputMethod(m.id as any)}
                        style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${inputMethod === m.id ? "#EC4899" : "rgba(255,255,255,0.08)"}`, background: inputMethod === m.id ? "rgba(236,72,153,0.1)" : "transparent", color: inputMethod === m.id ? "#EC4899" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Upload Area */}
                  {inputMethod === "upload" && (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      style={{ padding: 32, borderRadius: 16, border: `2px dashed ${isDragging ? "#EC4899" : uploadedFile ? "#10B981" : "rgba(255,255,255,0.12)"}`, background: isDragging ? "rgba(236,72,153,0.06)" : uploadedFile ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.01)", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}>
                      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={e => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                      {uploadedFile ? (
                        <>
                          <FileText size={32} color="#10B981" style={{ margin: "0 auto 12px" }} />
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#10B981" }}>{uploadedFile.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Ready to process</div>
                        </>
                      ) : (
                        <>
                          <Upload size={32} color="rgba(255,255,255,0.25)" style={{ margin: "0 auto 12px" }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Drop your resume here</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>PDF, DOCX, or TXT · Max 5MB</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Manual Form */}
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 20 }}>Your Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                  {[
                    { key: "name", label: "Full Name *", placeholder: "Abishek R" },
                    { key: "title", label: "Professional Title *", placeholder: "Full Stack Engineer & AI Builder" },
                    { key: "tagline", label: "Hero Tagline", placeholder: "I build products that scale." },
                    { key: "email", label: "Email", placeholder: "you@example.com" },
                    { key: "github", label: "GitHub Username", placeholder: "yourusername" },
                    { key: "linkedin", label: "LinkedIn Handle", placeholder: "your-linkedin" },
                    { key: "location", label: "Location", placeholder: "Chennai, India" },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{field.label}</label>
                      <input
                        value={(portfolio as any)[field.key]}
                        onChange={e => setPortfolio(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                      />
                    </div>
                  ))}

                  {/* Bio */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Short Bio</label>
                    <textarea
                      value={portfolio.bio}
                      onChange={e => setPortfolio(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Passionate developer who loves building AI-powered products..."
                      rows={3}
                      style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "white", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div style={{ marginTop: 24 }}>
              <button onClick={generate}
                disabled={!portfolio.name || !portfolio.title}
                className={portfolio.name && portfolio.title ? "hover-lift" : ""}
                style={{ width: "100%", padding: "20px", borderRadius: 18, background: portfolio.name && portfolio.title ? "linear-gradient(135deg, #EC4899, #BE185D)" : "rgba(255,255,255,0.04)", color: "white", fontWeight: 900, fontSize: 17, border: "none", cursor: portfolio.name && portfolio.title ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: !portfolio.name || !portfolio.title ? 0.5 : 1, boxShadow: portfolio.name && portfolio.title ? "0 16px 32px rgba(236,72,153,0.3)" : "none", transition: "all 0.3s" }}>
                <Sparkles size={22} /> Generate Premium Portfolio
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: GENERATING ─── */}
        {step === "generating" && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 480, gap: 32 }}>
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.05)" }} />
              <div className="orbital-spinner" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderTopColor: "#EC4899", borderRightColor: "rgba(236,72,153,0.4)", borderWidth: 3 }} />
              <div style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "rgba(236,72,153,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={28} color="#EC4899" />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 10 }}>Building Your Portfolio...</div>
              <AnimatePresence mode="wait">
                <motion.div key={generationStage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ fontSize: 15, color: "#EC4899", fontWeight: 600 }}>
                  {GENERATION_STAGES[generationStage]}
                </motion.div>
              </AnimatePresence>
            </div>
            <div style={{ width: 360, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <motion.div animate={{ width: `${((generationStage + 1) / GENERATION_STAGES.length) * 100}%` }} transition={{ duration: 0.4 }}
                style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #EC4899, #BE185D)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 360 }}>
              {GENERATION_STAGES.map((stage, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: i <= generationStage ? 1 : 0.3, transition: "opacity 0.3s" }}>
                  {i < generationStage ? <CheckCircle2 size={15} color="#10B981" /> : i === generationStage ? <div className="pulse-dot" style={{ width: 10, height: 10, background: "#EC4899", borderRadius: "50%" }} /> : <div style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />}
                  <span style={{ fontSize: 13, color: i <= generationStage ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>{stage}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── STEP 3: PREVIEW ─── */}
        {step === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => setStep("input")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                <ArrowLeft size={15} /> Edit Details
              </button>
              <div style={{ flex: 1 }} />

              {/* Device Toggle */}
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 4 }}>
                {[{ id: "desktop", icon: <Monitor size={15} /> }, { id: "mobile", icon: <Smartphone size={15} /> }].map(d => (
                  <button key={d.id} onClick={() => setPreviewDevice(d.id as any)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: previewDevice === d.id ? "rgba(255,255,255,0.1)" : "transparent", color: previewDevice === d.id ? "white" : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    {d.icon}
                  </button>
                ))}
              </div>

              <button onClick={() => setStep("code")}
                style={{ padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Code2 size={15} /> View Code
              </button>
              <button onClick={downloadCode}
                style={{ padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EC4899, #BE185D)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, border: "none", boxShadow: "0 8px 16px rgba(236,72,153,0.3)" }}>
                <Download size={15} /> Download HTML
              </button>
            </div>

            {/* Section Navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
              {PREVIEW_SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActivePreviewSection(s.id)}
                  style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${activePreviewSection === s.id ? accent : "rgba(255,255,255,0.08)"}`, background: activePreviewSection === s.id ? `${accent}15` : "transparent", color: activePreviewSection === s.id ? accent : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Preview Frame */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: previewDevice === "desktop" ? "100%" : 375, transition: "width 0.3s", maxWidth: "100%" }}>
                <div className="glass-card" style={{ overflow: "hidden", borderRadius: 20 }}>
                  {/* Browser Chrome */}
                  <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Globe size={11} /> {portfolio.website || `${portfolio.name.toLowerCase().replace(/ /g, "")}.dev`}
                    </div>
                  </div>

                  {/* Portfolio Preview Content */}
                  <div style={{ background: "#050508", padding: 0, maxHeight: 520, overflowY: "auto" }}>

                    {activePreviewSection === "hero" && (
                      <div style={{ padding: "60px 40px 50px", background: `radial-gradient(ellipse at 60% 40%, ${accent}15 0%, transparent 60%)` }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: `${accent}15`, border: `1px solid ${accent}30`, fontSize: 11, fontWeight: 700, color: accent, marginBottom: 24 }}>
                          ⚡ Available for Work · {portfolio.location}
                        </div>
                        <div style={{ fontSize: previewDevice === "mobile" ? 32 : 56, fontWeight: 900, color: "white", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 16 }}>{portfolio.name}</div>
                        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>{portfolio.title}</div>
                        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 500, marginBottom: 32 }}>{portfolio.bio}</div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <div style={{ padding: "12px 24px", borderRadius: 12, background: accent, color: "white", fontWeight: 700, fontSize: 14 }}>Get In Touch →</div>
                          <div style={{ padding: "12px 24px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 14 }}>View GitHub</div>
                        </div>
                      </div>
                    )}

                    {activePreviewSection === "projects" && (
                      <div style={{ padding: "48px 32px" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8 }}>Work</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 32 }}>Projects That Matter</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          {portfolio.projects.map(p => (
                            <div key={p.id} style={{ padding: 22, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 8 }}>{p.name}</div>
                              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12, lineHeight: 1.5 }}>{p.description}</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                                {p.tech.map(t => <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>{t}</span>)}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: accent, background: `${accent}12`, border: `1px solid ${accent}25`, padding: "5px 10px", borderRadius: 8, display: "inline-block" }}>🏆 {p.achievement}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activePreviewSection === "experience" && (
                      <div style={{ padding: "48px 32px" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8 }}>Experience</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 32 }}>Where I've Worked</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                          {portfolio.experience.map(e => (
                            <div key={e.id} style={{ paddingLeft: 22, borderLeft: `2px solid ${accent}40`, position: "relative" }}>
                              <div style={{ position: "absolute", left: -6, top: 6, width: 10, height: 10, borderRadius: "50%", background: accent }} />
                              <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>{e.role}</div>
                              <div style={{ fontSize: 14, color: accent, fontWeight: 600, margin: "4px 0" }}>{e.company}</div>
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>{e.duration}</div>
                              <ul style={{ paddingLeft: 16 }}>
                                {e.points.map((pt, i) => <li key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{pt}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activePreviewSection === "achievements" && (
                      <div style={{ padding: "48px 32px" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8 }}>Recognition</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 32 }}>Achievements</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                          {portfolio.achievements.map(a => (
                            <div key={a.id} style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                              <div style={{ fontSize: 24, marginBottom: 10 }}>🏅</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 6 }}>{a.title}</div>
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{a.issuer} · {a.year}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activePreviewSection === "contact" && (
                      <div style={{ padding: "60px 32px", textAlign: "center", background: `radial-gradient(ellipse at 50% 0%, ${accent}10 0%, transparent 60%)` }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12 }}>Let's Talk</div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: "-0.03em", marginBottom: 12 }}>Get In Touch</div>
                        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>Open to opportunities, collaborations & conversations.</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: accent, marginBottom: 28 }}>{portfolio.email}</div>
                        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                          {[{ label: "GitHub", val: portfolio.github }, { label: "LinkedIn", val: portfolio.linkedin }].filter(s => s.val).map(s => (
                            <div key={s.label} style={{ padding: "10px 18px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{s.label}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={downloadCode}
                style={{ flex: 1, padding: "16px", borderRadius: 16, background: "linear-gradient(135deg, #EC4899, #BE185D)", color: "white", fontWeight: 900, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 14px 28px rgba(236,72,153,0.3)" }}>
                <Download size={20} /> Download Portfolio HTML
              </button>
              <button onClick={() => setStep("code")}
                style={{ padding: "16px 24px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Github size={18} /> GitHub-Ready Code
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 4: CODE ─── */}
        {step === "code" && (
          <motion.div key="code" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setStep("preview")} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>
                <ArrowLeft size={15} /> Back to Preview
              </button>
              <div style={{ flex: 1 }} />
              <button onClick={copyCode}
                style={{ padding: "10px 18px", borderRadius: 12, background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.1)"}`, color: copied ? "#10B981" : "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />} {copied ? "Copied!" : "Copy Code"}
              </button>
              <button onClick={downloadCode}
                style={{ padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #EC4899, #BE185D)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, border: "none" }}>
                <Download size={15} /> Download
              </button>
            </div>

            {/* File structure */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>GitHub-Ready Structure</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 2 }}>
                <div style={{ color: "#EC4899" }}>📁 {portfolio.name.toLowerCase().replace(/ /g, "-")}-portfolio/</div>
                <div style={{ paddingLeft: 20 }}>├── <span style={{ color: "#10B981" }}>index.html</span> <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>← Complete portfolio (single file)</span></div>
                <div style={{ paddingLeft: 20 }}>├── <span style={{ color: "#F59E0B" }}>README.md</span> <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>← Auto-generated</span></div>
                <div style={{ paddingLeft: 20 }}>└── <span style={{ color: "#06B6D4" }}>.github/</span></div>
                <div style={{ paddingLeft: 40 }}>└── <span style={{ color: "#06B6D4" }}>workflows/deploy.yml</span> <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>← GitHub Pages CI/CD</span></div>
              </div>
            </div>

            {/* Code block */}
            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>index.html</span>
              </div>
              <pre style={{ margin: 0, padding: "24px", background: "#070710", color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.7, overflowX: "auto", maxHeight: 500, overflowY: "auto", fontFamily: "var(--font-mono)" }}>
                {generateCode(portfolio, accent).split("\n").slice(0, 80).join("\n")}
                {"\n\n... (full file in download)"}
              </pre>
            </div>

            {/* Deploy Instructions */}
            <div style={{ padding: 24, borderRadius: 18, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#10B981", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Github size={16} /> Deploy to GitHub Pages in 3 Steps
              </div>
              {[
                "Create a repo named: username.github.io",
                "Upload index.html to the repo root",
                "Go to Settings → Pages → Deploy from main branch",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#10B981", flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
