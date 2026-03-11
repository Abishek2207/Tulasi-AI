"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COMPANIES = [
  // FAANG / MAANG
  {
    id: "google", name: "Google", logo: "G", color: "#4285F4", type: "FAANG",
    desc: "Renowned for algorithmic rigor. Expect dynamic programming, graphs, and deep CS fundamentals. Culture (Googleyness) is evaluated in every round.",
    pattern: "1 Phone Screen (45m) → 4-5 Onsite Loops (Coding, System Design, Googleyness)",
    coding: ["Word Search II", "Merge Intervals", "Longest Valid Parentheses", "Minimum Window Substring", "N-Queens", "Serialize Binary Tree"],
    systemDesign: ["Design YouTube", "Design Google Docs (real-time)", "Design Distributed Web Crawler", "Design Google Search"],
    behavioral: ["Tell me about a time you had to make a decision with incomplete data", "How do you handle disagreements with your team?", "Describe a project you're most proud of"],
    prepRoadmap: ["LeetCode Hard focus (Graphs, DP)", "Study 'Designing Distributed Systems'", "Practice 20 system design questions", "Research Google's tech stack deeply"],
  },
  {
    id: "amazon", name: "Amazon", logo: "A", color: "#FF9900", type: "FAANG",
    desc: "Heavy emphasis on Leadership Principles (LPs) in every round. OOP, scalable architectures, and bar-raising culture.",
    pattern: "Online Assessment → 1 Phone Screen → 4-5 Onsite (Bar Raiser critical)",
    coding: ["Number of Islands", "Two Sum", "LRU Cache", "Word Ladder", "Alien Dictionary", "Trapping Rain Water"],
    systemDesign: ["Design Amazon Locker", "Design Shopping Cart", "Design Order Management System", "Design Product Recommendation"],
    behavioral: ["Tell me about a time you failed (LP: Learn and Be Curious)", "Describe when you had to deliver under tight deadline", "Give example of Customer Obsession in action"],
    prepRoadmap: ["Know all 16 Leadership Principles with STAR stories", "Practice OOP design problems", "System Design: scalability patterns", "Mock LP interview daily"],
  },
  {
    id: "meta", name: "Meta", logo: "M", color: "#0668E1", type: "FAANG",
    desc: "Fast-paced coding: 2 medium problems in 45 min. System design at extreme scale. Values impact and data-driven decisions.",
    pattern: "1 Phone Screen (Coding) → 4 Onsite (2 Coding, 1 System Design, 1 Behavioral)",
    coding: ["Subarray Sum Equals K", "Valid Palindrome II", "Binary Tree Right Side View", "Dot Product Sparse Vectors", "Task Scheduler"],
    systemDesign: ["Design Facebook Newsfeed", "Design Instagram", "Design Messenger", "Design Instagram Stories"],
    behavioral: ["How do you measure success?", "Tell me about trade-offs in a technical decision you made", "How do you handle ambiguity?"],
    prepRoadmap: ["Solve 2 LeetCode problems daily timed", "Focus on Array, String, Graph, DP", "Scale-focused system design thinking", "Data-driven impact stories"],
  },
  {
    id: "apple", name: "Apple", logo: "🍎", color: "#555555", type: "FAANG",
    desc: "Strong focus on quality, attention to detail, and cross-functional impact. Coding + design thinking. Highly values craft.",
    pattern: "1 Recruiter Screen → 1-2 Phone Screens → 6-8 Onsite Loops (team-specific)",
    coding: ["Design Patterns (Singleton, Observer)", "Array & String problems", "OOP Design", "Concurrency problems"],
    systemDesign: ["Design App Store backend", "Design iCloud sync", "Design Push Notification Service"],
    behavioral: ["What Apple product would you redesign and why?", "How do you balance quality with speed?", "Describe attention to detail in past work"],
    prepRoadmap: ["Study Design Patterns deeply", "Polish iOS/macOS ecosystem knowledge", "Focus on code quality, not just correctness", "Research Apple's engineering blog"],
  },
  {
    id: "netflix", name: "Netflix", logo: "N", color: "#E50914", type: "FAANG",
    desc: "Experienced engineers only. High culture bar (Freedom & Responsibility). Distributed systems, microservices, and extreme scale.",
    pattern: "1 Phone Screen → Optional take-home → 4-5 Onsite (Culture fit is huge)",
    coding: ["Group Anagrams", "Top K Frequent", "Median of Two Sorted Arrays", "Merge K Sorted Lists"],
    systemDesign: ["Design Netflix Video Streaming", "Design Recommendation System", "Design CDN", "Design A/B Testing System"],
    behavioral: ["How do you handle disagreement with a manager?", "Describe a time you made a bold technical decision", "How do you create psychological safety in team?"],
    prepRoadmap: ["Read Netflix Tech Blog articles", "Master distributed systems (CAP, Paxos)", "Culture fit: 'Keeper Test' preparation", "Large-scale streaming architecture knowledge"],
  },
  {
    id: "microsoft", name: "Microsoft", logo: "⊞", color: "#00A4EF", type: "FAANG",
    desc: "Values growth mindset, collaboration, and strong CS fundamentals. Azure integration and cloud knowledge is a big plus.",
    pattern: "1 Phone Screen → 4-5 Onsite (Coding, System Design, Behavior per round)",
    coding: ["Valid Parentheses", "Reverse Linked List", "Find Minimum Rotated Array", "Binary Tree Level Order", "Clone Graph"],
    systemDesign: ["Design Azure Service Bus", "Design Teams (real-time video)", "Design OneDrive Sync Service"],
    behavioral: ["Growth mindset story", "Collaboration across teams", "How you handled a massive setback"],
    prepRoadmap: ["Study Azure architecture", "Mixed DSA prep (Medium focus)", "Growth mindset storytelling", "SOLID principles mastery"],
  },
  // MNC Companies
  {
    id: "tcs", name: "TCS", logo: "T", color: "#0060A0", type: "MNC",
    desc: "India's largest IT company. Focus on aptitude, coding basics, and communication. Entry-level heavy on cognitive tests.",
    pattern: "TCS NQT (Numeric Aptitude + Coding) → TR Round → HR Round",
    coding: ["Arrays, Strings basics", "Simple sorting algorithms", "Pattern problems", "Basic recursion"],
    systemDesign: ["High-level database design basics", "Simple API design"],
    behavioral: ["Why TCS?", "Relocation willingness", "Team project experience", "Career goals"],
    prepRoadmap: ["TCS NQT mock tests", "IndiaBix aptitude practice", "Basic Python/Java coding", "HR question prep for freshers"],
  },
  {
    id: "infosys", name: "Infosys", logo: "I", color: "#007CC3", type: "MNC",
    desc: "Strong process-driven culture. Tests aptitude, pseudo-code understanding, and communication for freshers.",
    pattern: "Infosys Specialist Programmer Test → Technical Interview → HR Interview",
    coding: ["Array manipulation", "String problems", "Pseudocode writing", "Logical reasoning"],
    systemDesign: ["Basic client-server model", "Database normalization concepts"],
    behavioral: ["Adaptability stories", "Team collaboration", "Why Infosys?", "Future career plans"],
    prepRoadmap: ["InfyTQ certification", "Aptitude: R.S. Aggarwal", "Programming language basics", "Mock GD preparation"],
  },
  {
    id: "wipro", name: "Wipro", logo: "W", color: "#341F6D", type: "MNC",
    desc: "Wipro NLTH (National Level Talent Hunt) for freshers. Technical, aptitude, and HR rounds.",
    pattern: "Wipro NLTH Aptitude → Coding Test → Technical Interview → HR",
    coding: ["Number patterns", "Array problems", "String manipulation", "Basic OOP"],
    systemDesign: ["Client-server basics", "OOP design principles"],
    behavioral: ["Flexibility in role/location", "Team projects", "Problem-solving examples"],
    prepRoadmap: ["Wipro previous year papers", "HackerEarth coding practice", "Communication skills", "Resume project showcasing"],
  },
  {
    id: "deloitte", name: "Deloitte", logo: "D", color: "#86BC25", type: "MNC",
    desc: "Consulting + Tech. DIAT (Deloitte Interview Assessment Test). Business thinking meets technical skills.",
    pattern: "Online Assessment (Aptitude + Case Study) → Technical Round → HR Round",
    coding: ["Java/Python basics", "Data structures", "Case study problem-solving"],
    systemDesign: ["Data pipeline basics", "Enterprise architecture concepts"],
    behavioral: ["Consulting mindset stories", "Stakeholder management", "Business impact examples"],
    prepRoadmap: ["Case interview prep", "Deloitte DIAT mock tests", "Technology consulting knowledge", "Business communication"],
  },
  {
    id: "accenture", name: "Accenture", logo: "A", color: "#A100FF", type: "MNC",
    desc: "Focus on communication, aptitude, and coding basics. Strong on client-facing skills and adaptability.",
    pattern: "Cognitive Assessment → Technical Interview → HR Interview",
    coding: ["Coding fundamentals (arrays, loops)", "Basic OOP", "Simple algorithms"],
    systemDesign: ["Cloud basics (AWS/Azure)", "Agile process understanding"],
    behavioral: ["Communication ability", "Diversity and inclusion openness", "Adaptability stories"],
    prepRoadmap: ["Accenture mock tests (Cocubes)", "Communication improvement", "Cloud fundamentals certification", "HR stories preparation"],
  },
  {
    id: "hexaware", name: "Hexaware", logo: "H", color: "#E31E24", type: "MNC",
    desc: "Automation and AI-first IT company. Good for freshers with aptitude + basic tech skills.",
    pattern: "Aptitude Test → Coding Test → Technical Interview → HR",
    coding: ["Basic arrays, sorting", "String processing", "Simple recursion"],
    systemDesign: ["Basic automation concepts", "Testing frameworks overview"],
    behavioral: ["Learning ability", "Interest in automation/AI", "Team projects"],
    prepRoadmap: ["Aptitude from PrepInsta", "Basic automation tool knowledge (Selenium/Python)", "Interview communication"],
  },
  {
    id: "ibm", name: "IBM", logo: "I", color: "#1F70C1", type: "MNC",
    desc: "Heavy on cloud (IBM Cloud), AI, and enterprise solutions. Values research and innovation mindset.",
    pattern: "Online Assessment → Technical Interview (Project + DSA) → HR",
    coding: ["Data structures", "Algorithm problems", "Technology-specific questions"],
    systemDesign: ["IBM Cloud architecture", "Enterprise API design", "Microservices patterns"],
    behavioral: ["Curiosity and learning", "Collaboration stories", "Innovation examples"],
    prepRoadmap: ["IBM Digital Badge certifications", "Cloud fundamentals", "DSA preparation", "IBM research awareness"],
  },
  {
    id: "zoho", name: "Zoho", logo: "Z", color: "#C8202D", type: "MNC",
    desc: "Legendary for tough coding rounds even for freshers. No aptitude — pure coding and problem-solving.",
    pattern: "Programming Round 1 → Programming Round 2 → Technical Interview → HR",
    coding: ["Complex array problems", "String algorithms", "Data structures", "Logic-heavy puzzles"],
    systemDesign: ["Product thinking", "Simple backend design"],
    behavioral: ["Product passion", "Self-learning examples", "Long-term career commitment"],
    prepRoadmap: ["HackerRank practice daily", "Zoho previous papers (tough!)", "Logical reasoning", "Database concepts"],
  },
  {
    id: "cognizant", name: "Cognizant", logo: "C", color: "#0072BC", type: "MNC",
    desc: "Strong fresher hiring through campus programs. Focus on aptitude, English communication, and coding basics.",
    pattern: "Cognizant GenC Test → Technical → Communication → HR",
    coding: ["Basic DSA (Easy-Medium)", "Simple coding algorithms", "Pseudocode"],
    systemDesign: ["SDLC concepts", "Basic database design"],
    behavioral: ["Team player stories", "Communication ability", "Adaptability"],
    prepRoadmap: ["GenC assessment practice", "Coding fundamentals", "English communication drills", "Cognizant values awareness"],
  },
  {
    id: "capgemini", name: "Capgemini", logo: "C", color: "#00AEEF", type: "MNC",
    desc: "Game-based hiring with Dare To Be Different rounds. Aptitude + Pseudocode + Essay.",
    pattern: "Aptitude Test → Essay Writing → Pseudocode Test → Technical → HR",
    coding: ["Pseudocode reading", "Basic algorithms", "Problem-solving logic"],
    systemDesign: ["IT service delivery basics", "Agile methodology"],
    behavioral: ["Future goals", "Tech interest areas", "Team experience"],
    prepRoadmap: ["Capgemini previous tests (PrepInsta)", "Essay writing practice", "Agile/Scrum basics", "Communication polish"],
  },
  {
    id: "oracle", name: "Oracle", logo: "O", color: "#F80000", type: "MNC",
    desc: "Strong focus on database expertise, Java, and enterprise architecture. Competitive coding rounds.",
    pattern: "Online Assessment (DSA + DB) → 2-3 Technical Rounds → HR",
    coding: ["Advanced SQL queries", "Java OOP problems", "DSA (Trees, DP)", "Database design"],
    systemDesign: ["Oracle Cloud architecture", "Database sharding", "Enterprise application design"],
    behavioral: ["Technical depth stories", "Self-learning examples", "Innovation mindset"],
    prepRoadmap: ["Advanced SQL mastery", "Java and JDBC deep dive", "Oracle Database fundamentals", "LeetCode Medium/Hard"],
  },
  {
    id: "sap", name: "SAP", logo: "S", color: "#0FAAFF", type: "MNC",
    desc: "Enterprise software giant. Focus on ERP understanding, ABAP/Java knowledge, and business process understanding.",
    pattern: "Online Assessment → Technical Interview → Business + HR Interview",
    coding: ["Java enterprise patterns", "Data manipulation algorithms", "SAP ABAP basics"],
    systemDesign: ["ERP system architecture", "SAP BTP (Business Technology Platform)", "Integration patterns"],
    behavioral: ["Business process understanding", "Customer-centric thinking", "Collaboration"],
    prepRoadmap: ["SAP Learning Hub certification", "Java enterprise basics", "Business process knowledge (CRM, ERP)", "SAP ABAP primer"],
  },
  {
    id: "techmahindra", name: "Tech Mahindra", logo: "TM", color: "#DD0024", type: "MNC",
    desc: "Telecom + IT giant. Aptitude-heavy hiring with good fresher programs.",
    pattern: "Aptitude Test → Coding Test → Technical Interview → HR",
    coding: ["Basic arrays and strings", "Pattern programs", "Simple OOP"],
    systemDesign: ["Basic REST API design", "Telecom domain knowledge"],
    behavioral: ["Adaptability to location/role", "Team skills", "Career goals"],
    prepRoadmap: ["Aptitude practice", "Basic Java/Python", "Communication skills", "Tech Mahindra values research"],
  },
];

export default function CompanyPrepPage() {
  const [selectedId, setSelectedId] = useState("google");
  const [filter, setFilter] = useState("All");
  const [tab, setTab] = useState("coding");

  const selected = COMPANIES.find(c => c.id === selectedId)!;
  const filtered = filter === "All" ? COMPANIES : COMPANIES.filter(c => c.type === filter);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-outfit)", marginBottom: 12 }}>
          Company <span style={{ background: "linear-gradient(135deg, #FF9900, #4285F4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Interview Prep</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
          Targeted guides for 18+ companies — FAANG/MAANG and top MNCs.
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
        {["All", "FAANG", "MNC"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "7px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: filter === f ? "#6C63FF" : "rgba(255,255,255,0.05)",
              color: filter === f ? "white" : "var(--text-muted)", transition: "all 0.2s",
            }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Company List */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 8, maxHeight: "70vh", overflowY: "auto" }}>
          {filtered.map(comp => (
            <motion.div key={comp.id} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedId(comp.id)}
              style={{
                background: selectedId === comp.id ? "rgba(255,255,255,0.06)" : "transparent",
                border: selectedId === comp.id ? `1px solid ${comp.color}80` : "1px solid rgba(255,255,255,0.05)",
                padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: comp.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "white", flexShrink: 0 }}>
                {comp.logo}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selectedId === comp.id ? "white" : "var(--text-secondary)" }}>{comp.name}</div>
                <div style={{ fontSize: 11, color: comp.color, fontWeight: 600 }}>{comp.type}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selected.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="dash-card"
            style={{ flex: 1, padding: 32, background: "rgba(255,255,255,0.02)", border: `1px solid ${selected.color}40` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: selected.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white" }}>{selected.logo}</div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "white" }}>{selected.name}</h2>
                <span style={{ background: `${selected.color}20`, color: selected.color, padding: "2px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{selected.type}</span>
              </div>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 20 }}>{selected.desc}</p>

            <div style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}30`, borderLeft: `4px solid ${selected.color}`, borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: selected.color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>📋 Interview Pattern</div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "white" }}>{selected.pattern}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[
                { id: "coding", label: "💻 Coding" },
                { id: "systemDesign", label: "🏗️ System Design" },
                { id: "behavioral", label: "🎤 Behavioral" },
                { id: "prepRoadmap", label: "🗺️ Prep Plan" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: tab === t.id ? selected.color : "rgba(255,255,255,0.06)",
                    color: tab === t.id ? "black" : "var(--text-muted)", transition: "all 0.2s",
                  }}>{t.label}</button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {["coding", "systemDesign", "behavioral", "prepRoadmap"].map(key => (
                  tab === key && (
                    <ul key={key} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: 0, listStyle: "none" }}>
                      {(selected[key as keyof typeof selected] as string[]).map((item, idx) => (
                        <li key={idx} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 14, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ color: selected.color, flexShrink: 0 }}>{tab === "prepRoadmap" ? `${idx + 1}.` : "⚡"}</span> {item}
                        </li>
                      ))}
                    </ul>
                  )
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
