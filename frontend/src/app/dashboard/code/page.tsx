"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Editor from "@monaco-editor/react";

const PROBLEMS = [
  { id: 1, title: "Two Sum", difficulty: "Easy", desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.", starter: "def two_sum(nums, target):\n    # Write your code here\n    pass\n\nprint(two_sum([2, 7, 11, 15], 9))" },
  { id: 2, title: "Reverse String", difficulty: "Easy", desc: "Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.", starter: "def reverse_string(s):\n    # Write your code here\n    pass\n\ns = ['h','e','l','l','o']\nreverse_string(s)\nprint(s)" },
  { id: 3, title: "Fibonacci Sequence", difficulty: "Medium", desc: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven n, calculate F(n).", starter: "def fib(n):\n    # Write your code here\n    pass\n\nprint(fib(4))" }
];

export default function CodePracticePage() {
  const { data: session } = useSession();
  const [activeProblem, setActiveProblem] = useState(PROBLEMS[0]);
  const [code, setCode] = useState(activeProblem.starter);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // When problem changes, load its starter code
  const handleProblemChange = (p: typeof PROBLEMS[0]) => {
    setActiveProblem(p);
    setCode(p.starter);
    setOutput("");
  };

  const handleRunCode = async () => {
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
      setOutput(data.output);
    } catch (err) {
      setOutput("Network Error: Could not connect to execution server.");
    }
    setIsRunning(false);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: 16 }}>
      
      {/* Left Pane: Problems */}
      <div className="dash-card" style={{ width: "35%", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Coding Challenges</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          {PROBLEMS.map(p => (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.id}. {p.title}</span>
                <span className={`badge ${p.difficulty === 'Easy' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: 10 }}>{p.difficulty}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Description Area */}
        <div style={{ flex: 1.5, borderTop: "1px solid var(--border)", padding: 20, overflowY: "auto", background: "var(--background)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{activeProblem.title}</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {activeProblem.desc}
          </p>
        </div>
      </div>

      {/* Right Pane: Editor & Console */}
      <div style={{ width: "65%", display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* Monaco Editor */}
        <div className="dash-card" style={{ flex: 2, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "white", padding: "4px 12px", borderRadius: 6, fontSize: 12 }}>
                <option>Python 3</option>
              </select>
            </div>
            <button 
              onClick={handleRunCode}
              disabled={isRunning}
              className="btn btn-primary" 
              style={{ padding: "6px 16px", fontSize: 13, borderRadius: 6, opacity: isRunning ? 0.7 : 1 }}
            >
              {isRunning ? "Running..." : "▶ Run Code"}
            </button>
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

        {/* Execution Console */}
        <div className="dash-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Console Output</span>
          </div>
          <div style={{ flex: 1, padding: 16, overflowY: "auto", background: "#0a0a0a" }}>
            <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 13, color: output.includes("Error") ? "#ff6b6b" : "#43E97B", whiteSpace: "pre-wrap" }}>
              {output || "Run your code to see the output here."}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
