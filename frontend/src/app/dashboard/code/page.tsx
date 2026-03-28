"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { codeApi, CodeProblem } from "@/lib/api";
import { 
  Play, Send, Code, Terminal, ChevronRight, 
  Search, Filter, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import toast from "react-hot-toast";

const LANGUAGES = [
  { name: "Python 3", id: "python", starter: "def solution():\n    # Write your code here\n    pass\n\nprint(solution())" },
  { name: "JavaScript", id: "javascript", starter: "function solution() {\n  // Write your code here\n  return;\n}\n\nconsole.log(solution());" },
  { name: "C", id: "c", starter: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf(\"Hello World\\n\");\n    return 0;\n}" },
  { name: "C++", id: "cpp", starter: "#include <iostream>\n\nint main() {\n    // Write your code here\n    std::cout << \"Hello World\" << std::endl;\n    return 0;\n}" },
  { name: "Java", id: "java", starter: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println(\"Hello World\");\n    }\n}" }
];

export default function CodePracticePage() {
  const [problems, setProblems] = useState<CodeProblem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeProblem, setActiveProblem] = useState<CodeProblem | null>(null);
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await codeApi.problems(filter === "All" ? "" : filter, "", search, token);
      setProblems(data.problems as unknown as CodeProblem[]);
      setCategories(data.categories || []);
      if (!activeProblem && data.problems.length > 0) {
        selectProblem(data.problems[0] as unknown as CodeProblem);
      }
    } catch (e) {
      toast.error("Failed to fetch problems from HQ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [filter, search]);

  // Reset code when language or problem changes
  useEffect(() => {
    if (activeProblem) {
       setCode(language.starter);
    }
  }, [language.id, activeProblem?.id]);

  const selectProblem = (p: CodeProblem) => {
    setActiveProblem(p);
    setConsoleOutput(null);
    setCode(language.starter);
  };

  const runCode = async () => {
    if (!token) return;
    setRunning(true);
    setConsoleOutput(null);
    try {
      const resp = await codeApi.run(code, language.id, token);
      setConsoleOutput(resp.output || resp.stderr || "No output.");
      if (resp.status === "success") {
        toast.success("Execution complete.");
      } else {
        toast.error("Runtime error detected.");
      }
    } catch (e: any) {
      setConsoleOutput(`[CRITICAL ERROR]\n${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
    if (!activeProblem || !token) return;
    setSubmitting(true);
    try {
      // Logic: Run it first, then if success, mark as solved. 
      // For a real production app, the backend would run tests.
      // Here, we'll run it and if it completes, we mark as solved (simplified).
      const runResp = await codeApi.run(code, language.id, token);
      setConsoleOutput(runResp.output);
      
      if (runResp.status === "success" || runResp.status === "Accepted") {
        const data = await codeApi.markSolved(activeProblem.id, token);
        if (data.newly_solved) {
          toast.success(`ACCEPTED! +${data.xp_earned} XP earned.`);
          setActiveProblem({...activeProblem, solved: true} as any);
          fetchProblems(); // refresh list to show tick
        } else {
          toast.success("Accepted! (Already solved)");
        }
      } else {
        toast.error("Submission rejected. Check your logic.");
      }
    } catch (e: any) {
      toast.error(e.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)", gap: 16, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* Problem Sidebar */}
      <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="glass-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Code size={18} className="text-brand" />
            <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.5 }}>Challenge Vault</h3>
          </div>
          
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter problems..."
              className="input-field" style={{ padding: "8px 12px 8px 34px", fontSize: 13, width: "100%", height: 38 }} 
            />
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }} className="hide-scrollbar">
            {["All", ...categories].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: "1px solid",
                  background: filter === cat ? "var(--brand-primary)" : "rgba(255,255,255,0.05)",
                  borderColor: filter === cat ? "var(--brand-primary)" : "rgba(255,255,255,0.1)",
                  color: filter === cat ? "white" : "var(--text-secondary)", cursor: "pointer"
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card hide-scrollbar" style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {loading ? (
             <div style={{ padding: 20, textAlign: "center", color: "#666", fontSize: 13 }}>Syncing problems...</div>
          ) : (
            problems.map(p => (
              <button key={p.id} onClick={() => selectProblem(p)}
                style={{
                  width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, border: "none",
                  background: activeProblem?.id === p.id ? "rgba(255,255,255,0.05)" : "transparent",
                  color: activeProblem?.id === p.id ? "white" : "var(--text-muted)",
                  textAlign: "left", cursor: "pointer", borderLeft: activeProblem?.id === p.id ? "3px solid var(--brand-primary)" : "3px solid transparent",
                  transition: "all 0.2s"
                }}>
                <div style={{ 
                  width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900,
                  color: p.solved ? "#43E97B" : "inherit"
                }}>
                  {p.solved ? <CheckCircle2 size={14} /> : p.difficulty?.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>{p.category}</div>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.3 }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Code Editor & Description */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Top Header */}
        <div className="glass-card" style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
             <select 
               value={language.id} 
               onChange={e => setLanguage(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])}
               className="input-field" style={{ padding: "6px 12px", width: 140, background: "rgba(0,0,0,0.2)", border: "none", fontSize: 13, fontWeight: 600 }}>
               {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
             </select>
             {activeProblem?.solved && (
               <div style={{ fontSize: 11, fontWeight: 800, color: "#43E97B", display: "flex", alignItems: "center", gap: 6, background: "rgba(67,233,123,0.1)", padding: "4px 12px", borderRadius: 20 }}>
                 <CheckCircle2 size={12} /> SOLVED
               </div>
             )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
               onClick={runCode} disabled={running || submitting}
               style={{ 
                 background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", 
                 padding: "8px 20px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer",
                 display: "flex", alignItems: "center", gap: 8 
               }}>
               {running ? <div className="spinner-small" /> : <Play size={14} />} Run
            </button>
            <button
               onClick={submitCode} disabled={running || submitting}
               className="btn-primary"
               style={{ 
                 padding: "8px 24px", borderRadius: 12, fontSize: 13, fontWeight: 800,
                 display: "flex", alignItems: "center", gap: 8
               }}>
               {submitting ? <div className="spinner-small" /> : <Send size={14} />} Submit
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: "flex", gap: 16, minHeight: 0 }}>
          
          {/* Editor */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "#0c0c0d" }}>
               <div style={{ padding: "8px 16px", background: "#161618", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <span style={{ fontSize: 11, fontWeight: 900, color: "#555", letterSpacing: 1 }}>EDITOR</span>
                 <span style={{ fontSize: 10, color: "#444" }}>main.{language.id === 'python' ? 'py' : language.id === 'javascript' ? 'js' : language.id === 'cpp' ? 'cpp' : language.id === 'c' ? 'c' : 'java'}</span>
               </div>
               <textarea 
                  value={code} onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  placeholder="Initiate solution stream..."
                  style={{
                    flex: 1, background: "transparent", border: "none", color: "#d4d4d4",
                    fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 14, padding: "24px",
                    outline: "none", resize: "none", lineHeight: 1.6
                  }}
               />
            </div>

            <div className="glass-card" style={{ height: 200, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "#050505" }}>
               <div style={{ padding: "8px 16px", background: "#111", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 10 }}>
                 <Terminal size={12} className="text-secondary" />
                 <span style={{ fontSize: 11, fontWeight: 900, color: "#555", letterSpacing: 1 }}>TERMINAL</span>
               </div>
               <div style={{ flex: 1, padding: "16px 20px", color: "#888", fontFamily: "monospace", fontSize: 13, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                  {consoleOutput || "Wait for input..."}
               </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card hide-scrollbar" style={{ width: 400, padding: 32, overflowY: "auto" }}>
             {activeProblem ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12, fontFamily: "var(--font-outfit)" }}>{activeProblem.title}</h2>
                 <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, background: "rgba(124,58,237,0.1)", color: "var(--brand-primary)", padding: "4px 12px", borderRadius: 20 }}>{activeProblem.difficulty}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 20 }}>{activeProblem.category}</span>
                 </div>
                 
                 <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
                    {activeProblem.description}
                 </div>

                 {activeProblem.sample_input && (
                    <div style={{ marginBottom: 24 }}>
                       <h4 style={{ fontSize: 12, fontWeight: 900, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase" }}>Sample Payload</h4>
                       <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 12, fontFamily: "monospace", fontSize: 13, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ color: "var(--brand-primary)", marginBottom: 4 }}>Input:</div>
                          <div style={{ color: "#ccc" }}>{activeProblem.sample_input}</div>
                          <div style={{ color: "#43E97B", marginTop: 12, marginBottom: 4 }}>Expected Output:</div>
                          <div style={{ color: "#ccc" }}>{activeProblem.sample_output}</div>
                       </div>
                    </div>
                 )}

                 <div style={{ background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--brand-primary)" }}>
                       <Info size={16} />
                       <span style={{ fontSize: 13, fontWeight: 800 }}>Hint</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                       {activeProblem.hint || "Analyze the problem structure and consider edge cases."}
                    </p>
                 </div>
               </motion.div>
             ) : (
               <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#444" }}>
                 <Code size={48} style={{ opacity: 0.1, marginBottom: 20 }} />
                 <p style={{ fontSize: 14 }}>Select a problem to initiate sync.</p>
               </div>
             )}
          </div>

        </div>

      </div>
    </div>
  );
}
