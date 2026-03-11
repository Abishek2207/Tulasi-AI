"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";

const PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", company: "Google", desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.", starter: "def two_sum(nums, target):\n    # Write your code here\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))" },
  { id: 2, title: "Reverse String", difficulty: "Easy", category: "Strings", company: "Amazon", desc: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.", starter: "def reverse_string(s):\n    # Write your code here\n    pass\n\ns = ['h','e','l','l','o']\nreverse_string(s)\nprint(s)" },
  { id: 3, title: "Fibonacci Sequence", difficulty: "Medium", category: "DP", company: "Microsoft", desc: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven n, calculate F(n).", starter: "def fib(n):\n    # Write your code here\n    pass\n\nprint(fib(4))" },
  { id: 4, title: "LRU Cache", difficulty: "Hard", category: "System Design", company: "Meta", desc: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class:\n- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.\n- int get(int key) Return the value of the key if the key exists, otherwise return -1.", starter: "class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass" }
];

export default function CodePracticePage() {
  const { data: session } = useSession();
  const [activeProblem, setActiveProblem] = useState(PROBLEMS[0]);
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

  const categories = ["All", ...Array.from(new Set(PROBLEMS.map(p => p.category)))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredProblems = PROBLEMS.filter(p => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (selectedDifficulty !== "All" && p.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleProblemChange = (p: typeof PROBLEMS[0]) => {
    setActiveProblem(p);
    setCode(p.starter);
    setOutput("");
    setAiExplanation("");
    setActiveConsoleTab('output');
  };

  const handleRunCode = async () => {
    setActiveConsoleTab('output');
    setIsRunning(true);
    setOutput("Running code...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/code/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session?.user as any)?.accessToken}`
        },
        body: JSON.stringify({ code: code, language: "python" })
      });
      const data = await res.json();
      setOutput(data.output || "No output returned.");
    } catch (err) {
      setOutput("Network Error: Could not connect to execution server.\n(Render Free Tier might be waking up, please try again in 30s)");
    }
    setIsRunning(false);
  };

  const explainCode = () => {
    setActiveConsoleTab('ai');
    setIsExplaining(true);
    // Mock AI explanation
    setTimeout(() => {
      setAiExplanation(`Based on your current code for **${activeProblem.title}**:\n\nThe approach you're taking is O(N) time complexity assuming you iterate through the elements. To optimize this further for space, consider the ${activeProblem.category} properties.\n\nAre you stuck? Try focusing on the constraint: 'assume exactly one solution'.`);
      setIsExplaining(false);
    }, 1500);
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
                background: activeProblem.id === p.id ? "rgba(108,99,255,0.1)" : "transparent",
                borderLeft: activeProblem.id === p.id ? "3px solid var(--brand-primary)" : "3px solid transparent",
                transition: "all 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.id}. {p.title}</span>
                <span className={`badge ${p.difficulty === 'Easy' ? 'badge-green' : p.difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: 10 }}>{p.difficulty}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4, color: "var(--text-secondary)" }}>{p.category}</span>
                {p.company && (
                  <span style={{ fontSize: 10, background: "rgba(108,99,255,0.15)", color: "#A78BFA", padding: "2px 6px", borderRadius: 4 }}>🏢 {p.company}</span>
                )}
              </div>
            </div>
          ))}
          {filteredProblems.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No problems match your filters.</div>
          )}
        </div>

        {/* Description Area */}
        <div style={{ flex: 1.5, borderTop: "1px solid var(--border)", padding: 20, overflowY: "auto", background: "var(--background)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{activeProblem.title}</h3>
            {contestMode && <span style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14 }}>⏳ 45:00</span>}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {activeProblem.desc}
          </p>
        </div>
      </div>

      {/* Right Pane: Editor & Console */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Monaco Editor */}
        <div className="dash-card" style={{ flex: 2, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: contestMode ? "1px solid #FF6B6B" : "1px solid var(--border)" }}>
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12 }}>
                <option>Python 3</option>
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
              language="python"
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

