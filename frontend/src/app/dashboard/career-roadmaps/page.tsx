"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ROADMAPS = [
  {
    id: "swe", title: "Software Engineer", icon: "💻", color: "#4ECDC4",
    desc: "The standard path to becoming a generalist SWE at top tech companies.",
    skills: ["Data Structures & Algorithms", "System Design", "Backend APIs", "Frontend Basics", "Databases (SQL/NoSQL)", "Cloud Fundamentals"],
    projects: ["RESTful API with JWT auth", "Full-stack E-commerce store", "Real-time chat application", "CLI tool with testing"],
    coding: ["LeetCode Blind 75", "Arrays & Hashing", "Two Pointers", "Sliding Window", "Binary Search", "Trees & Graphs"],
    interview_tips: ["STAR method stories", "LeetCode Medium daily", "System design concepts", "Behavioral questions prep"],
    milestones: [
      { name: "Master core language (Python/Java/C++)", duration: "1 month" },
      { name: "Complete LeetCode Blind 75", duration: "2 months" },
      { name: "Build 2 full-stack projects", duration: "1.5 months" },
      { name: "Study System Design (Grokking)", duration: "3 weeks" },
      { name: "Mock Interviews & Apply", duration: "Ongoing" },
    ],
  },
  {
    id: "ai", title: "AI Engineer", icon: "🤖", color: "#6C63FF",
    desc: "Build LLMs, RAG architectures, and production AI pipelines.",
    skills: ["Python", "PyTorch / TensorFlow", "Vector Databases", "LangChain", "Hugging Face", "Prompt Engineering"],
    projects: ["Document Q&A bot (RAG)", "Image classification pipeline", "Custom fine-tuned LLM", "AI-powered chatbot"],
    coding: ["Python mastery", "NumPy & Pandas", "Linear Algebra basics", "API integration", "FastAPI"],
    interview_tips: ["LLM architecture depth", "RAG vs fine-tuning tradeoffs", "Deployment & scaling ML", "MLOps concepts"],
    milestones: [
      { name: "Linear Algebra & Probability", duration: "3 weeks" },
      { name: "ML Algorithms (Scikit-learn)", duration: "1 month" },
      { name: "Deep Learning basics (PyTorch)", duration: "1 month" },
      { name: "LLMs, Transformers & Prompt Engineering", duration: "1 month" },
      { name: "Deploy full RAG application", duration: "1 month" },
    ],
  },
  {
    id: "ml", title: "ML Engineer", icon: "📊", color: "#FF6B9D",
    desc: "Focus on production machine learning pipelines and model deployment.",
    skills: ["Python", "Scikit-learn", "PyTorch/TF", "MLflow", "Kubeflow", "Spark", "Feature Engineering"],
    projects: ["End-to-end ML pipeline", "A/B testing system", "Recommendation engine", "Fraud detection model"],
    coding: ["Statistics & probability", "Matrix operations", "Pandas", "SQL aggregations", "Docker"],
    interview_tips: ["Model evaluation metrics", "Feature engineering tricks", "Handling class imbalance", "MLOps tools"],
    milestones: [
      { name: "Statistics & Linear Algebra", duration: "1 month" },
      { name: "Supervised & Unsupervised Learning", duration: "1.5 months" },
      { name: "Feature Engineering & Selection", duration: "3 weeks" },
      { name: "Model Deployment (Flask/FastAPI)", duration: "3 weeks" },
      { name: "MLOps with MLflow & CI/CD", duration: "1 month" },
    ],
  },
  {
    id: "data-scientist", title: "Data Scientist", icon: "🔬", color: "#43E97B",
    desc: "Derive insights from data and build predictive models for business decisions.",
    skills: ["Python/R", "SQL", "Statistics", "Machine Learning", "Tableau/Power BI", "A/B Testing"],
    projects: ["Customer churn prediction", "Sales forecasting dashboard", "Market basket analysis", "Sentiment analysis app"],
    coding: ["SQL window functions", "Pandas & NumPy", "Data visualization", "Statistical tests", "Jupyter notebooks"],
    interview_tips: ["Business case studies", "Explain model to non-tech", "Hypothesis testing", "Experimental design"],
    milestones: [
      { name: "Statistics & Probability", duration: "1 month" },
      { name: "SQL mastery & data manipulation", duration: "3 weeks" },
      { name: "Python for Data Science", duration: "1 month" },
      { name: "Machine Learning fundamentals", duration: "1.5 months" },
      { name: "BI tools & storytelling", duration: "3 weeks" },
    ],
  },
  {
    id: "backend", title: "Backend Developer", icon: "⚙️", color: "#FF8E53",
    desc: "Build robust, scalable server-side applications and APIs.",
    skills: ["Node.js / Python / Go", "REST & GraphQL", "PostgreSQL / MongoDB", "Redis", "Docker & Kubernetes", "Microservices"],
    projects: ["Scalable REST API", "Event-driven service (Kafka)", "Multi-tenant SaaS backend", "Rate-limited public API"],
    coding: ["DSA for backend", "Database design", "Concurrency patterns", "Caching strategies", "Security best practices"],
    interview_tips: ["System design is critical", "Database normalization", "API versioning", "Security (SQL injection, JWT)"],
    milestones: [
      { name: "Core language mastery (Python/Node/Go)", duration: "1.5 months" },
      { name: "Databases: SQL & NoSQL", duration: "1 month" },
      { name: "REST API Design & Auth (JWT/OAuth)", duration: "3 weeks" },
      { name: "Caching (Redis) & Queuing (Kafka)", duration: "1 month" },
      { name: "Docker, CI/CD & Cloud Deploy", duration: "1 month" },
    ],
  },
  {
    id: "frontend", title: "Frontend Developer", icon: "🎨", color: "#FF6B6B",
    desc: "Build beautiful, accessible, and performant user interfaces.",
    skills: ["HTML/CSS/JS", "React / Next.js", "TypeScript", "State Management", "Web Performance", "Accessibility"],
    projects: ["Responsive portfolio website", "Dashboard with complex state", "PWA with offline support", "Design system"],
    coding: ["JavaScript fundamentals", "React patterns", "CSS Grid & Flex", "Browser APIs", "Performance metrics"],
    interview_tips: ["Virtual DOM explained", "CSS specificity rules", "React hooks internals", "Web vitals (LCP, CLS, FID)"],
    milestones: [
      { name: "Advanced JS & DOM Manipulation", duration: "1 month" },
      { name: "React fundamentals & Hooks", duration: "3 weeks" },
      { name: "Next.js & SSR/SSG", duration: "1 month" },
      { name: "CSS mastery (Tailwind, Animations)", duration: "3 weeks" },
      { name: "Web Accessibility & Testing", duration: "3 weeks" },
    ],
  },
  {
    id: "devops", title: "DevOps Engineer", icon: "🔧", color: "#4ECDC4",
    desc: "Automate infrastructure, deployments, and ensure system reliability.",
    skills: ["Linux/Bash", "Docker & Kubernetes", "CI/CD (GitHub Actions)", "Terraform", "AWS/GCP/Azure", "Monitoring (Prometheus)"],
    projects: ["Full CI/CD pipeline", "K8s deployment with autoscaling", "Infra-as-code with Terraform", "Monitoring dashboard"],
    coding: ["Bash scripting", "YAML configuration", "Python automation", "SQL for monitoring queries"],
    interview_tips: ["SRE principles", "DORA metrics", "Blue-green deployments", "Incident management"],
    milestones: [
      { name: "Linux fundamentals & Bash scripting", duration: "1 month" },
      { name: "Docker & containerization", duration: "3 weeks" },
      { name: "Kubernetes orchestration", duration: "1.5 months" },
      { name: "CI/CD with GitHub Actions / Jenkins", duration: "1 month" },
      { name: "Cloud (AWS/GCP) & Terraform IaC", duration: "1.5 months" },
    ],
  },
  {
    id: "cloud", title: "Cloud Engineer", icon: "☁️", color: "#A78BFA",
    desc: "Architect and manage scalable cloud infrastructure on AWS, GCP, or Azure.",
    skills: ["AWS / GCP / Azure", "Terraform & CDK", "Serverless (Lambda)", "Networking & VPC", "IAM & Security", "Cost optimization"],
    projects: ["Multi-region DR setup", "Serverless data pipeline", "Secure VPC architecture", "Cost optimization audit"],
    coding: ["AWS CLI & SDK", "Python boto3", "Terraform HCL", "CloudFormation"],
    interview_tips: ["CAP theorem", "Cloud pricing models", "Shared responsibility model", "Well-Architected Framework"],
    milestones: [
      { name: "Cloud fundamentals (AWS/GCP)", duration: "1 month" },
      { name: "Networking: VPC, subnets, routing", duration: "3 weeks" },
      { name: "Compute: EC2, Lambda, ECS", duration: "1 month" },
      { name: "IaC: Terraform & CDK", duration: "1 month" },
      { name: "Cloud Certifications (SAA-C03)", duration: "2 months" },
    ],
  },
  {
    id: "cybersec", title: "Cybersecurity Engineer", icon: "🛡️", color: "#EF4444",
    desc: "Protect systems and data from threats, vulnerabilities, and attacks.",
    skills: ["Network security", "Penetration testing", "SIEM tools", "Python for security", "Cryptography", "Incident response"],
    projects: ["Vulnerability scanner", "Honeypot setup", "CTF write-ups", "Security audit report"],
    coding: ["Python scripting", "Bash for security", "SQL injection", "Regular expressions", "Wireshark"],
    interview_tips: ["OWASP Top 10", "CIA triad", "Zero-trust architecture", "Common CVEs", "Incident response steps"],
    milestones: [
      { name: "Networking fundamentals (TCP/IP)", duration: "1 month" },
      { name: "Linux security & hardening", duration: "3 weeks" },
      { name: "Ethical hacking basics (CEH/OSCP prep)", duration: "2 months" },
      { name: "Web app security (OWASP)", duration: "1 month" },
      { name: "Security+ or CEH certification", duration: "2 months" },
    ],
  },
  {
    id: "pm", title: "Product Manager", icon: "📋", color: "#FFD93D",
    desc: "Define product vision, strategy, and work with cross-functional teams.",
    skills: ["Product strategy", "User research", "A/B testing", "Agile / Scrum", "Data analytics", "Stakeholder management"],
    projects: ["Product requirements doc", "GTM strategy", "Feature prioritization framework", "User journey map"],
    coding: ["Basic SQL for analytics", "Google Analytics", "Figma for wireframes", "JIRA / Linear"],
    interview_tips: ["Product sense (design for X)", "Metrics & KPIs", "Estimation questions", "Root cause analysis", "Prioritization frameworks (RICE)"],
    milestones: [
      { name: "Product thinking & frameworks (CIRCLES)", duration: "1 month" },
      { name: "User research & Jobs-to-be-Done", duration: "3 weeks" },
      { name: "Data & metrics (SQL, GA)", duration: "1 month" },
      { name: "Agile & working with engineers", duration: "3 weeks" },
      { name: "PM interview practice (PM Exercises)", duration: "1.5 months" },
    ],
  },
  {
    id: "blockchain", title: "Blockchain Developer", icon: "⛓️", color: "#F59E0B",
    desc: "Build decentralized applications and smart contracts on blockchain platforms.",
    skills: ["Solidity", "Ethereum / EVM", "Web3.js / Ethers.js", "Hardhat / Foundry", "DeFi protocols", "IPFS"],
    projects: ["ERC-20 token", "NFT marketplace", "DeFi lending protocol", "DAO governance contract"],
    coding: ["Solidity patterns", "Gas optimization", "JavaScript for dApps", "Python for blockchain tools"],
    interview_tips: ["EVM opcodes", "Reentrancy attacks", "Gas optimization techniques", "DeFi protocol designs"],
    milestones: [
      { name: "Blockchain & Ethereum fundamentals", duration: "3 weeks" },
      { name: "Solidity programming", duration: "1.5 months" },
      { name: "DeFi protocols & tokenomics", duration: "1 month" },
      { name: "Security & contract auditing", duration: "1 month" },
      { name: "Build & deploy full dApp", duration: "1.5 months" },
    ],
  },
  {
    id: "mobile", title: "Mobile Developer", icon: "📱", color: "#10B981",
    desc: "Build cross-platform or native mobile applications for iOS and Android.",
    skills: ["React Native / Flutter", "iOS (Swift) or Android (Kotlin)", "REST APIs", "Local storage", "Push notifications", "App Store deployment"],
    projects: ["Social media app clone", "Fitness tracker", "E-commerce mobile app", "Chat application"],
    coding: ["JavaScript/Dart fundamentals", "State management (Redux/Provider)", "Native module bridging", "Performance profiling"],
    interview_tips: ["Native vs cross-platform tradeoffs", "App lifecycle management", "Memory management", "Offline-first patterns"],
    milestones: [
      { name: "React Native or Flutter fundamentals", duration: "1.5 months" },
      { name: "Navigation & state management", duration: "1 month" },
      { name: "Native APIs (camera, GPS, notifications)", duration: "3 weeks" },
      { name: "Backend integration & auth", duration: "3 weeks" },
      { name: "App Store deployment & analytics", duration: "2 weeks" },
    ],
  },
  {
    id: "fullstack", title: "Full Stack Developer", icon: "🌐", color: "#06B6D4",
    desc: "Build end-to-end web applications across frontend and backend.",
    skills: ["React/Next.js", "Node.js/Express or FastAPI", "PostgreSQL/MongoDB", "REST APIs", "Docker", "Cloud deployment"],
    projects: ["SaaS application", "Social platform", "E-commerce with payments", "Real-time collaborative tool"],
    coding: ["JavaScript (frontend & backend)", "SQL & NoSQL databases", "Authentication flows", "Testing (Jest/Cypress)"],
    interview_tips: ["Full stack system design", "Database indexing", "Authentication vs Authorization", "SEO & performance"],
    milestones: [
      { name: "Frontend: React & Next.js mastery", duration: "2 months" },
      { name: "Backend: Node.js/Python APIs", duration: "1.5 months" },
      { name: "Databases: PostgreSQL & Redis", duration: "1 month" },
      { name: "Auth, Payments, File uploads", duration: "3 weeks" },
      { name: "Deploy full app to cloud", duration: "2 weeks" },
    ],
  },
  {
    id: "gamedev", title: "Game Developer", icon: "🎮", color: "#8B5CF6",
    desc: "Create interactive games across PC, mobile, and web platforms.",
    skills: ["Unity (C#) / Unreal (C++)", "Game design patterns", "Physics engines", "3D math (vectors, matrices)", "Shaders/GLSL", "Multiplayer networking"],
    projects: ["2D platformer game", "3D FPS prototype", "Mobile casual game", "Multiplayer mini-game"],
    coding: ["C# for Unity / C++ for Unreal", "Linear algebra", "Design patterns (State, Observer)", "Optimization profiling"],
    interview_tips: ["Game loop architecture", "ECS pattern", "Networking for games", "Performance & memory for mobile"],
    milestones: [
      { name: "Unity/Unreal fundamentals", duration: "1.5 months" },
      { name: "2D game: sprites, physics, input", duration: "1 month" },
      { name: "3D game: models, lighting, cameras", duration: "1.5 months" },
      { name: "Game design & level design", duration: "3 weeks" },
      { name: "Polish & publish to store", duration: "1 month" },
    ],
  },
  {
    id: "dataeng", title: "Data Engineer", icon: "🗄️", color: "#F97316",
    desc: "Build and maintain data pipelines, warehouses, and infrastructure at scale.",
    skills: ["Python", "SQL", "Spark / PySpark", "Airflow / Prefect", "dbt", "Snowflake / BigQuery", "Kafka"],
    projects: ["ETL pipeline with Airflow", "Real-time streaming with Kafka", "Data warehouse with dbt", "Data quality monitoring system"],
    coding: ["Advanced SQL", "PySpark transformations", "Python for data pipelines", "Shell scripting"],
    interview_tips: ["OLTP vs OLAP", "Data modeling (star/snowflake schema)", "Batch vs streaming", "SLAs and data quality"],
    milestones: [
      { name: "Advanced SQL & relational modeling", duration: "1 month" },
      { name: "Python for data engineering", duration: "1 month" },
      { name: "Big Data: Spark & distributed computing", duration: "1.5 months" },
      { name: "Orchestration: Airflow & dbt", duration: "1 month" },
      { name: "Streaming: Kafka & real-time pipelines", duration: "1.5 months" },
    ],
  },
];

export default function CareerRoadmapsPage() {
  const [activeId, setActiveId] = useState("swe");
  const [activeSection, setActiveSection] = useState("milestones");
  const active = ROADMAPS.find(r => r.id === activeId)!;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Career <span style={{ background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Roadmaps</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          15 step-by-step guides to mastering the skills for top tech roles. Follow at your own pace.
        </p>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Sidebar Nav */}
        <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {ROADMAPS.map(r => (
            <button key={r.id} onClick={() => setActiveId(r.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left",
                background: activeId === r.id ? `${r.color}20` : "transparent",
                color: activeId === r.id ? r.color : "var(--text-muted)",
                boxShadow: activeId === r.id ? `inset 3px 0 0 ${r.color}` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 18 }}>{r.icon}</span> {r.title}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div key={active.id}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="dash-card"
            style={{ flex: 1, padding: 36, background: "rgba(255,255,255,0.02)", border: `1px solid ${active.color}30` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${active.color}20`, border: `1px solid ${active.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {active.icon}
              </div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: active.color, margin: 0 }}>{active.title}</h2>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)" }}>{active.desc}</p>
              </div>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16 }}>
              {[
                { id: "milestones", label: "🛣️ Roadmap" },
                { id: "skills", label: "🛠️ Skills" },
                { id: "projects", label: "🚀 Projects" },
                { id: "coding", label: "💻 Coding" },
                { id: "interview", label: "🎯 Interview" },
              ].map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{
                    padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: activeSection === s.id ? active.color : "rgba(255,255,255,0.06)",
                    color: activeSection === s.id ? "black" : "var(--text-secondary)",
                    transition: "all 0.2s",
                  }}
                >{s.label}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {activeSection === "milestones" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, borderLeft: `2px solid ${active.color}`, paddingLeft: 24, marginLeft: 8 }}>
                    {active.milestones.map((m, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -31, top: 6, width: 12, height: 12, borderRadius: "50%", background: "var(--background)", border: `2px solid ${active.color}` }} />
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 4px" }}>{m.name}</h4>
                        <span style={{ fontSize: 12, color: active.color, fontWeight: 600, background: `${active.color}15`, padding: "2px 10px", borderRadius: 6 }}>⏱ {m.duration}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "skills" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {active.skills.map(s => (
                      <span key={s} style={{ padding: "8px 16px", background: `${active.color}15`, border: `1px solid ${active.color}40`, borderRadius: 20, fontSize: 13, fontWeight: 600, color: "white" }}>{s}</span>
                    ))}
                  </div>
                )}

                {activeSection === "projects" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {active.projects.map((p, i) => (
                      <div key={i} style={{ padding: "14px 18px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ color: active.color, fontSize: 18 }}>🚀</span>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === "coding" && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {active.coding.map(c => (
                      <span key={c} style={{ padding: "8px 16px", background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#9B95FF" }}>💻 {c}</span>
                    ))}
                  </div>
                )}

                {activeSection === "interview" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {active.interview_tips.map((tip, i) => (
                      <div key={i} style={{ padding: "12px 16px", background: "rgba(255,215,0,0.06)", borderRadius: 10, border: "1px solid rgba(255,215,0,0.15)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#FFD700" }}>⭐</span>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{tip}</span>
                      </div>
                    ))}
                    <a href="/dashboard/interview" style={{ textDecoration: "none", marginTop: 8 }}>
                      <button style={{ width: "100%", padding: "12px", borderRadius: 12, background: `linear-gradient(135deg, ${active.color}, #6C63FF)`, border: "none", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                        🎯 Start Mock Interview →
                      </button>
                    </a>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
