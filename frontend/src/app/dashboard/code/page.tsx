"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { codeApi } from "@/lib/api";

export default function CodePracticePage() {
  const { data: session } = useSession();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProblem, setActiveProblem] = useState<any>(null);
  const [code, setCode] = useState(activeProblem.starter);
  
  // Console state
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'ai'>('output');
  const [output, setOutput] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [contestMode, setContestMode] = useState(false);
  const [language, setLanguage] = useState("python");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await codeApi.problems();
        setProblems(data.problems || []);
        if (data.problems && data.problems.length > 0) {
          setActiveProblem(data.problems[0]);
          setCode(`def solve(x):\n    # Starter code for ${data.problems[0].title}\n    pass\n`);
        }
      } catch (err) {
        console.error("Failed to fetch problems", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const categories = ["All", ...Array.from(new Set(problems.map(p => p.category)))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredProblems = problems.filter(p => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (selectedDifficulty !== "All" && p.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleProblemChange = (p: any) => {
    setActiveProblem(p);
    setCode(`def solve(x):\n    # Starter code for ${p.title}\n    pass\n`);
    setOutput("");
    setAiExplanation("");
    setActiveConsoleTab('output');
  };

  const handleRunCode = async () => {
    const token = (session?.user as any)?.accessToken;
    if (!token) return setOutput("Please log in to run code.");
    setActiveConsoleTab('output');
    setIsRunning(true);
    setOutput("Running code...");
    try {
      const data = await codeApi.run(code, language, token);
      let outText = data.output || "No output returned.";
      if (data.execution_time_ms !== undefined) {
        outText += `\n\n[Finished in ${data.execution_time_ms}ms]`;
      }
      setOutput(outText);
    } catch (err) {
      setOutput("Network Error: Could not connect to execution server.\n(Render Free Tier might be waking up, please try again soon)");
    }
    setIsRunning(false);
  };

  const explainCode = async () => {
    const token = (session?.user as any)?.accessToken;
    if (!token) {
      setAiExplanation("Please log in to use AI Help.");
      return;
    }
    setActiveConsoleTab('ai');
    setIsExplaining(true);
    setAiExplanation("");
    try {
      const data = await codeApi.explain(code, language, token);
      setAiExplanation(data.explanation || "AI could not generate an explanation at this time.");
    } catch (err) {
      setAiExplanation("Network Error: Could not connect to AI server.");
    }
    setIsExplaining(false);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: 16 }}>
      
      {/* Left Pane: Problems */}
      <div className="dash-card" style={{ width: "35%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        {/* Filters Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Coding Challenges</h2>
            <button 
              onClick={() => setContestMode(!contestMode)}
              style={{ background: contestMode ? "#FF6B6B" : "rgba(255,255,255,0.1)", color: "white", border: "none", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              {contestMode ? "🏆 EXIT CONTEST" : "🏆 CONTEST MODE"}
            </button>
          </div>
          
          <div style={{ display: "flex", gap: 8 }}>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", color: "white", padding: "6px 8px", borderRadius: 6, fontSize: 12 }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", color: "white", padding: "6px 8px", borderRadius: 6, fontSize: 12 }}>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        
        {/* Problem List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredProblems.map(p => (
            <div 
              key={p.id}
              onClick={() => handleProblemChange(p)}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: activeProblem?.id === p.id ? "rgba(108,99,255,0.1)" : "transparent",
                borderLeft: activeProblem?.id === p.id ? "3px solid var(--brand-primary)" : "3px solid transparent",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.id}. {p.title}</span>
                <span className={`badge ${p.difficulty === 'Easy' ? 'badge-green' : p.difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: 10 }}>{p.difficulty}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4, color: "var(--text-secondary)" }}>{p.category}</span>
                {p.companies && p.companies[0] && (
                  <span style={{ fontSize: 10, background: "rgba(108,99,255,0.15)", color: "#A78BFA", padding: "2px 6px", borderRadius: 4 }}>🏢 {p.companies[0]}</span>
                )}
              </div>
            </div>
          ))}
          {filteredProblems.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No problems match your filters.</div>
          )}
        </div>

        {/* Description Area */}
        {activeProblem ? (
          <div style={{ flex: 1.5, borderTop: "1px solid var(--border)", padding: 20, overflowY: "auto", background: "var(--background)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{activeProblem.title}</h3>
              {contestMode && <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14 }}>⏳ 45:00</span>}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {activeProblem.description}
            </p>
            {activeProblem.sample_input && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Sample Input</div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--brand-primary)" }}>{activeProblem.sample_input}</div>
              </div>
            )}
            {activeProblem.sample_output && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Sample Output</div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--brand-primary)" }}>{activeProblem.sample_output}</div>
              </div>
            )}
            {activeProblem.hint && (
              <div style={{ marginTop: 24, padding: "12px", border: "1px solid rgba(167, 139, 250, 0.2)", borderRadius: 8, background: "rgba(167, 139, 250, 0.05)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", marginBottom: 4 }}>💡 HINT</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{activeProblem.hint}</div>
              </div>
            )}
          </div>
        ) : (
           <div style={{ flex: 1.5, borderTop: "1px solid var(--border)", padding: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
             {loading ? "Loading problems..." : "Select a problem to view details."}
           </div>
        )}
      </div>

      {/* Right Pane: Editor & Console */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Monaco Editor */}
        <div className="dash-card" style={{ flex: 2, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: contestMode ? "1px solid #FF6B6B" : "1px solid var(--border)" }}>
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={language} onChange={e => setLanguage(e.target.value)} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12 }}>
                <option value="python">Python 3</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {!contestMode && (
                <button 
                  onClick={explainCode}
                  disabled={isExplaining}
                  style={{ background: "transparent", border: "1px solid #A78BFA", color: "#A78BFA", padding: "6px 16px", fontSize: 13, borderRadius: 6, cursor: "pointer" }}
                >
                  🤖 AI Help
                </button>
              )}
              <button 
                onClick={handleRunCode}
                disabled={isRunning}
                className="btn btn-primary" 
                style={{ padding: "6px 24px", fontSize: 13, borderRadius: 6, opacity: isRunning ? 0.7 : 1 }}
              >
                {isRunning ? "Running..." : "▶ Run Code"}
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "python" ? "python" : language === "cpp" ? "cpp" : "java"}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Console / AI Explanation Pane */}
        <div className="dash-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Console Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <button 
              onClick={() => setActiveConsoleTab('output')}
              style={{ padding: "10px 20px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", border: "none", cursor: "pointer", background: "transparent", color: activeConsoleTab === 'output' ? "white" : "var(--text-muted)", borderBottom: activeConsoleTab === 'output' ? "2px solid var(--brand-primary)" : "2px solid transparent" }}
            >
              Console Output
            </button>
            <button 
              onClick={() => setActiveConsoleTab('ai')}
              style={{ padding: "10px 20px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", border: "none", cursor: "pointer", background: "transparent", color: activeConsoleTab === 'ai' ? "#A78BFA" : "var(--text-muted)", borderBottom: activeConsoleTab === 'ai' ? "2px solid #A78BFA" : "2px solid transparent" }}
            >
              AI Assistant ✨
            </button>
          </div>
          
          {/* Console Content */}
          <div style={{ flex: 1, padding: 16, overflowY: "auto", background: "#0a0a0a" }}>
            <AnimatePresence mode="wait">
              {activeConsoleTab === 'output' && (
                <motion.pre key="out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: output.includes("Error") ? "#ff6b6b" : "#43E97B", whiteSpace: "pre-wrap" }}>
                  {output || "Run your code to see the output here."}
                </motion.pre>
              )}

              {activeConsoleTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>
                  {isExplaining ? (
                    <div style={{ color: "#A78BFA" }}>🤖 Analyzing your code and approach...</div>
                  ) : aiExplanation ? (
                    <div dangerouslySetInnerHTML={{ __html: aiExplanation.replace(/\n\n/g, '<br/><br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ) : (
                    <div style={{ color: "var(--text-muted)" }}>Click "AI Help" above to get hints, time complexity analysis, or approach explanations without giving away the full solution.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

