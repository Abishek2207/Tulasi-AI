"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PROBLEMS = [
  {
    id: 1, title: "Two Sum", difficulty: "Easy", acceptance: "50.4%",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    starterCode: "def twoSum(nums, target):\n    # Write your code here\n    pass",
  },
  {
    id: 2, title: "Reverse Linked List", difficulty: "Easy", acceptance: "73.2%",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" }],
    starterCode: "# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\ndef reverseList(head):\n    pass",
  },
  {
    id: 3, title: "Valid Parentheses", difficulty: "Easy", acceptance: "40.5%",
    description: "Given a string `s` containing just the characters `'(', ')', '{', '}', '['` and `']'`, determine if the input string is valid.",
    examples: [{ input: "s = \"()\"", output: "true" }],
    starterCode: "def isValid(s):\n    pass",
  }
];

export default function CodePracticePage() {
  const [activeProblem, setActiveProblem] = useState(PROBLEMS[0]);
  const [code, setCode] = useState(PROBLEMS[0].starterCode);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [language, setLanguage] = useState("Python 3");

  const runCode = () => {
    setRunning(true);
    setConsoleOutput(null);
    setTimeout(() => {
      setRunning(false);
      // Simulate fake mock evaluation
      if (code.includes("pass") || code.trim() === activeProblem.starterCode.trim()) {
        setConsoleOutput("Output: null\n\nTestcases pass: 0/15\nStatus: Error (Not Implemented)");
      } else {
        setConsoleOutput("Output: [0, 1]\n\nTestcases pass: 15/15\nStatus: Accepted 🎉\nRuntime: 45ms (Beats 89.2% of users)");
      }
    }, 1200);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: 16, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* Left Pane - Problem List & Description */}
      <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Header */}
        <div className="dash-card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Code Practice</h1>
          <select 
            onChange={(e) => {
              const prob = PROBLEMS.find(p => p.id === parseInt(e.target.value));
              if (prob) {
                setActiveProblem(prob);
                setCode(prob.starterCode);
                setConsoleOutput(null);
              }
            }}
            value={activeProblem.id}
            className="input-field" style={{ padding: "6px 12px", width: 180, background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}>
            {PROBLEMS.map(p => <option key={p.id} value={p.id}>{p.id}. {p.title}</option>)}
          </select>
        </div>

        {/* Problem Description */}
        <div className="dash-card" style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{activeProblem.id}. {activeProblem.title}</h2>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <span style={{ color: "#43E97B", background: "rgba(67,233,123,0.1)", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{activeProblem.difficulty}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center" }}>Acceptance: {activeProblem.acceptance}</span>
          </div>

          <div style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-secondary)", whiteSpace: "pre-wrap", marginBottom: 32 }}>
            {activeProblem.description}
          </div>

          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 12 }}>Examples:</h3>
            {activeProblem.examples.map((ex, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderLeft: "3px solid rgba(255,255,255,0.1)", padding: 16, borderRadius: "0 8px 8px 0", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "var(--text-secondary)", marginBottom: 8 }}>
                  <span style={{ color: "white", fontWeight: 700 }}>Input:</span> {ex.input}
                </div>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: "var(--text-secondary)" }}>
                  <span style={{ color: "white", fontWeight: 700 }}>Output:</span> {ex.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Editor & Console */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Editor Actions */}
        <div className="dash-card" style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1e1e", border: "1px solid #333" }}>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{ background: "#2d2d2d", color: "#ccc", border: "1px solid #333", padding: "6px 12px", borderRadius: 6, fontSize: 13, outline: "none" }}>
            <option>Python 3</option>
            <option>JavaScript</option>
            <option>Java</option>
            <option>C++</option>
          </select>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={runCode}
              disabled={running}
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none", padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "0.2s" }}>
              Run
            </button>
            <button
              onClick={runCode}
              disabled={running}
              style={{ background: "#43E97B", color: "#111", border: "none", padding: "6px 20px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}>
              Submit
            </button>
          </div>
        </div>

        {/* Text Area (Fake Editor) */}
        <div className="dash-card" style={{ flex: 1, padding: 0, overflow: "hidden", background: "#1e1e1e", border: "1px solid #333", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 16px", background: "#2d2d2d", fontSize: 12, color: "#aaa", borderBottom: "1px solid #111", fontWeight: 600 }}>main.py</div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, background: "transparent", border: "none", color: "#d4d4d4", fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 15, padding: 24, outline: "none", resize: "none", lineHeight: 1.6
            }}
          />
        </div>

        {/* Console / Output */}
        <div className="dash-card" style={{ height: "30%", minHeight: 180, padding: 0, overflow: "hidden", background: "#111", border: "1px solid #333", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px 16px", background: "#1a1a1a", fontSize: 12, color: "#888", borderBottom: "1px solid #222", fontWeight: 600 }}>
            Console Output
          </div>
          <div style={{ flex: 1, padding: 16, fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 14, color: "#ccc", overflowY: "auto", position: "relative" }}>
            {running ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#888", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>⏳</span> Judging solution...
              </motion.div>
            ) : consoleOutput ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ whiteSpace: "pre-wrap", color: consoleOutput.includes("Accepted") ? "#43E97B" : "#FF6B6B" }}>
                {consoleOutput}
              </motion.div>
            ) : (
              <div style={{ color: "#555" }}>Run your code to see output here.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
