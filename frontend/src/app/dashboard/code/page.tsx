"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { codeApi, CodeProblem } from "@/lib/api";
import { 
  Play, Send, Code, Terminal, ChevronRight, 
  Search, CheckCircle2, AlertCircle, Clock, Zap
} from "lucide-react";
import toast from "react-hot-toast";

const LANGUAGES = [
  { name: "Python 3", id: "python", starter: "def solution():\n    # Write your code here\n    pass\n\nprint(solution())" },
  { name: "JavaScript", id: "javascript", starter: "function solution() {\n  // Write your code here\n  return;\n}\n\nconsole.log(solution());" },
  { name: "C", id: "c", starter: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf(\"Hello World\\n\");\n    return 0;\n}" },
  { name: "C++", id: "cpp", starter: "#include <iostream>\n\nint main() {\n    // Write your code here\n    std::cout << \"Hello World\" << std::endl;\n    return 0;\n}" },
  { name: "Java", id: "java", starter: "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println(\"Hello World\");\n    }\n}" }
];

type Verdict = "idle" | "running" | "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "timeout";

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  accepted:      { label: "✅ Accepted",            color: "#10B981", bg: "rgba(16,185,129,0.1)",  icon: "✅" },
  wrong_answer:  { label: "❌ Wrong Answer",         color: "#F43F5E", bg: "rgba(244,63,94,0.1)",   icon: "❌" },
  runtime_error: { label: "⚠️ Runtime Error",        color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: "⚠️" },
  compile_error: { label: "🔴 Compilation Error",    color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: "🔴" },
  timeout:       { label: "⏱️ Time Limit Exceeded",  color: "#8B5CF6", bg: "rgba(139,92,246,0.1)",  icon: "⏱️" },
};

export default function CodePracticePage() {
  const [problems, setProblems] = useState<CodeProblem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeProblem, setActiveProblem] = useState<CodeProblem | null>(null);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>("idle");
  const [verdictData, setVerdictData] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [execTime, setExecTime] = useState<number | null>(null);

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
    } catch {
      toast.error("Failed to fetch problems.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProblems(); }, [filter, search]);

  useEffect(() => {
    if (activeProblem) {
      setCode(language.starter);
      setVerdict("idle");
      setVerdictData(null);
      setConsoleOutput(null);
      setCustomInput((activeProblem as any).sample_input || "");
    }
  }, [language.id, activeProblem?.id]);

  const selectProblem = (p: CodeProblem) => {
    setActiveProblem(p);
    setVerdict("idle");
    setVerdictData(null);
    setConsoleOutput(null);
    setCode(language.starter);
    setCustomInput((p as any).sample_input || "");
  };

  // RUN — uses custom stdin, shows raw output
  const runCode = async () => {
    if (!token) { toast.error("Login required"); return; }
    setRunning(true);
    setVerdict("running");
    setConsoleOutput(null);
    try {
      const resp = await codeApi.run(code, language.id, token, customInput);
      setExecTime(resp.execution_time_ms ?? null);
      const out = resp.stdout || resp.stderr || "(no output)";
      setConsoleOutput(out);
      if (resp.status === "success") {
        setVerdict("idle");
        toast.success(`Ran in ${resp.execution_time_ms ?? "?"}ms`);
      } else if (resp.status === "compile_error") {
        setVerdict("compile_error");
      } else if (resp.status === "timeout") {
        setVerdict("timeout");
      } else {
        setVerdict("runtime_error");
        toast.error("Runtime error detected.");
      }
    } catch (e: any) {
      setConsoleOutput(`[ERROR]\n${e.message}`);
      setVerdict("runtime_error");
    } finally {
      setRunning(false);
    }
  };

  // SUBMIT — validates against predefined expected output
  const submitCode = async () => {
    if (!activeProblem || !token) { toast.error("Login required"); return; }
    setSubmitting(true);
    setVerdict("running");
    setVerdictData(null);
    setConsoleOutput(null);
    try {
      const res = await codeApi.submit(code, language.id, (activeProblem as any).id, token);
      setVerdictData(res);
      setExecTime(res.execution_time_ms);
      if (res.status === "accepted") {
        setConsoleOutput(`🎉 All ${res.total_test_cases || ""} test cases passed!\nExecution time: ${res.execution_time_ms}ms`);
      } else {
        const passedInfo = res.total_test_cases ? `Passed ${res.test_cases_passed}/${res.total_test_cases} test cases.\n\n` : "";
        const inputInfo = res.failed_input ? `--- Failed Input ---\n${res.failed_input}\n\n` : "";
        setConsoleOutput(
          `${passedInfo}${inputInfo}--- Expected Output ---\n${res.expected || "(N/A)"}\n\n--- Your Output ---\n${res.stdout || "(no output)"}${res.stderr ? `\n\n--- Error output ---\n${res.stderr}` : ""}`
        );
      }

      const v = res.status as Verdict;
      setVerdict(v);

      if (res.status === "accepted") {
        toast.success(res.newly_solved ? `✅ Accepted! +${res.xp_earned} XP` : "✅ Accepted! (Already solved)");
        if (res.newly_solved) {
          setActiveProblem({ ...activeProblem, solved: true } as any);
          fetchProblems();
        }
      } else if (res.status === "wrong_answer") {
        toast.error(`❌ Wrong Answer (Passed ${res.test_cases_passed}/${res.total_test_cases})`);
      } else if (res.status === "compile_error") {
        toast.error("🔴 Compilation Failed — fix syntax errors.");
      } else if (res.status === "timeout") {
        toast.error(`⏱️ Time Limit Exceeded (Passed ${res.test_cases_passed}/${res.total_test_cases})`);
      } else {
        toast.error(`⚠️ ${res.verdict}`);
      }
    } catch (e: any) {
      setVerdict("runtime_error");
      toast.error(e.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const vc = VERDICT_CONFIG[verdict] ?? null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 100px)", gap: 16, maxWidth: 1600, margin: "0 auto" }}>
      
      {/* Problem Sidebar */}
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="glass-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Code size={16} className="text-brand" />
            <h3 style={{ fontSize: 12, fontWeight: 900, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 1.5 }}>Challenge Vault</h3>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#666" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter problems..."
              className="input-field" style={{ padding: "7px 10px 7px 30px", fontSize: 12, width: "100%", height: 34 }} />
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }} className="hide-scrollbar">
            {["All", ...categories].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: "1px solid",
                background: filter === cat ? "var(--brand-primary)" : "rgba(255,255,255,0.05)",
                borderColor: filter === cat ? "var(--brand-primary)" : "rgba(255,255,255,0.1)",
                color: filter === cat ? "white" : "var(--text-secondary)", cursor: "pointer"
              }}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="glass-card hide-scrollbar" style={{ flex: 1, padding: "6px 0", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "#666", fontSize: 13 }}>Loading problems...</div>
          ) : (
            problems.map(p => (
              <button key={(p as any).id} onClick={() => selectProblem(p)} style={{
                width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, border: "none",
                background: activeProblem?.id === p.id ? "rgba(255,255,255,0.05)" : "transparent",
                color: activeProblem?.id === p.id ? "white" : "var(--text-muted)",
                textAlign: "left", cursor: "pointer",
                borderLeft: activeProblem?.id === p.id ? "3px solid var(--brand-primary)" : "3px solid transparent",
                transition: "all 0.15s"
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.03)", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900,
                  color: (p as any).solved ? "#43E97B" : 
                    (p as any).difficulty === "Hard" ? "#F43F5E" : 
                    (p as any).difficulty === "Medium" ? "#F59E0B" : "#10B981" }}>
                  {(p as any).solved ? <CheckCircle2 size={13} /> : (p as any).difficulty?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(p as any).title}</div>
                  <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>{(p as any).category}</div>
                </div>
                <ChevronRight size={12} style={{ opacity: 0.3, flexShrink: 0 }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor + Console */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        
        {/* Top Header */}
        <div className="glass-card" style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <select value={language.id} onChange={e => setLanguage(LANGUAGES.find(l => l.id === e.target.value) || LANGUAGES[0])}
              className="input-field" style={{ padding: "5px 10px", width: 130, background: "rgba(0,0,0,0.2)", border: "none", fontSize: 12, fontWeight: 600 }}>
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            {(activeProblem as any)?.solved && (
              <div style={{ fontSize: 11, fontWeight: 800, color: "#43E97B", display: "flex", alignItems: "center", gap: 5, background: "rgba(67,233,123,0.1)", padding: "3px 10px", borderRadius: 20 }}>
                <CheckCircle2 size={11} /> SOLVED
              </div>
            )}
            {execTime !== null && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> {execTime}ms
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={runCode} disabled={running || submitting}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white",
                padding: "7px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6 }}>
              {running ? <div className="spinner-small" /> : <Play size={13} />} Run
            </button>
            <button onClick={submitCode} disabled={running || submitting || !activeProblem} className="btn-primary"
              style={{ padding: "7px 20px", borderRadius: 10, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              {submitting ? <div className="spinner-small" /> : <Send size={13} />} Submit
            </button>
          </div>
        </div>

        {/* Verdict Banner */}
        <AnimatePresence>
          {vc && verdict !== "idle" && verdict !== "running" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: "10px 20px", borderRadius: 12, background: vc.bg, border: `1px solid ${vc.color}40`,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{vc.icon}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: vc.color }}>{vc.label}</span>
                {verdictData?.test_cases_passed !== undefined && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>
                    {verdictData.test_cases_passed}/{verdictData.total_test_cases} test cases
                  </span>
                )}
                {verdictData?.newly_solved && (
                  <span style={{ fontSize: 12, color: "#F59E0B", display: "flex", alignItems: "center", gap: 4 }}>
                    <Zap size={12} /> +{verdictData.xp_earned} XP earned!
                  </span>
                )}
              </div>
              {execTime !== null && (
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{execTime}ms</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div style={{ flex: 1, display: "flex", gap: 12, minHeight: 0 }}>
          
          {/* Editor + Console Column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            
            {/* Code Editor */}
            <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "#0c0c0d" }}>
              <div style={{ padding: "7px 14px", background: "#161618", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 1 }}>EDITOR</span>
                <span style={{ fontSize: 10, color: "#444" }}>
                  main.{language.id === "python" ? "py" : language.id === "javascript" ? "js" : language.id === "cpp" ? "cpp" : language.id === "c" ? "c" : "java"}
                </span>
              </div>
              <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
                placeholder="Write your solution here..."
                style={{ flex: 1, background: "transparent", border: "none", color: "#d4d4d4",
                  fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 13.5, padding: "20px",
                  outline: "none", resize: "none", lineHeight: 1.65, tabSize: 2 }} />
            </div>

            {/* Custom Input + Console */}
            <div style={{ display: "flex", gap: 12, height: 200 }}>
              {/* stdin input */}
              <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "#080809" }}>
                <div style={{ padding: "6px 14px", background: "#111", borderBottom: "1px solid #222" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 1 }}>CUSTOM INPUT (stdin)</span>
                </div>
                <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                  placeholder="Optional: Enter test input here..."
                  style={{ flex: 1, background: "transparent", border: "none", color: "#aaa",
                    fontFamily: "monospace", fontSize: 12.5, padding: "12px 16px",
                    outline: "none", resize: "none", lineHeight: 1.6 }} />
              </div>

              {/* console output */}
              <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", background: "#050505" }}>
                <div style={{ padding: "6px 14px", background: "#111", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 8 }}>
                  <Terminal size={11} className="text-secondary" />
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#555", letterSpacing: 1 }}>OUTPUT</span>
                </div>
                <div style={{ flex: 1, padding: "12px 16px", overflowY: "auto", lineHeight: 1.6 }}>
                  {!consoleOutput && <span style={{ color: "#555", fontFamily: "monospace", fontSize: 12.5 }}>Run your code to see output...</span>}
                  {consoleOutput && verdict === "idle" && (
                    <pre style={{ color: "#c8c8c8", fontFamily: "monospace", fontSize: 12.5, margin: 0, whiteSpace: "pre-wrap" }}>{consoleOutput}</pre>
                  )}
                  {consoleOutput && verdict !== "idle" && verdict !== "running" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {verdictData?.failed_input && (
                        <div style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: "#8B78FA", letterSpacing: 1, marginBottom: 6 }}>FAILED INPUT</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12.5, color: "#ccc", whiteSpace: "pre-wrap" }}>{verdictData.failed_input}</pre>
                        </div>
                      )}
                      {verdictData?.expected && (
                        <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: "#10B981", letterSpacing: 1, marginBottom: 6 }}>EXPECTED OUTPUT</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12.5, color: "#ccc", whiteSpace: "pre-wrap" }}>{verdictData.expected}</pre>
                        </div>
                      )}
                      {verdictData?.stdout !== undefined && (
                        <div style={{ background: verdict === "accepted" ? "rgba(16,185,129,0.07)" : "rgba(244,63,94,0.07)", border: `1px solid ${verdict === "accepted" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"}`, borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: verdict === "accepted" ? "#10B981" : "#F43F5E", letterSpacing: 1, marginBottom: 6 }}>YOUR OUTPUT</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12.5, color: "#ccc", whiteSpace: "pre-wrap" }}>{verdictData.stdout || "(no output)"}</pre>
                        </div>
                      )}
                      {verdictData?.stderr && (
                        <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: "#F59E0B", letterSpacing: 1, marginBottom: 6 }}>STDERR</div>
                          <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12, color: "#aaa", whiteSpace: "pre-wrap" }}>{verdictData.stderr}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="glass-card hide-scrollbar" style={{ width: 380, padding: 28, overflowY: "auto" }}>
            {activeProblem ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, fontFamily: "var(--font-outfit)" }}>
                  {(activeProblem as any).title}
                </h2>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, padding: "3px 10px", borderRadius: 20,
                    background: (activeProblem as any).difficulty === "Hard" ? "rgba(244,63,94,0.1)" :
                                (activeProblem as any).difficulty === "Medium" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                    color: (activeProblem as any).difficulty === "Hard" ? "#F43F5E" :
                           (activeProblem as any).difficulty === "Medium" ? "#F59E0B" : "#10B981" }}>
                    {(activeProblem as any).difficulty}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 900, background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", padding: "3px 10px", borderRadius: 20 }}>
                    {(activeProblem as any).category}
                  </span>
                </div>

                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
                  {(activeProblem as any).description}
                </div>

                {/* Test Cases Panel */}
                {((activeProblem as any).test_cases?.length > 0 || (activeProblem as any).sample_input) && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                      Test Cases ({(activeProblem as any).test_cases?.length || 1})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {((activeProblem as any).test_cases || [
                        { input: (activeProblem as any).sample_input, expected: (activeProblem as any).sample_output }
                      ]).map((tc: { input: string; expected: string }, idx: number) => (
                        <div key={idx} style={{ background: "rgba(0,0,0,0.25)", padding: 12, borderRadius: 10, fontFamily: "monospace", fontSize: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ color: "#666", marginBottom: 4, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>CASE {idx + 1}</div>
                          <div style={{ color: "var(--brand-primary)", marginBottom: 2, fontSize: 10, fontWeight: 700 }}>Input:</div>
                          <div style={{ color: "#ccc", marginBottom: 8, whiteSpace: "pre-wrap" }}>{tc.input}</div>
                          <div style={{ color: "#43E97B", marginBottom: 2, fontSize: 10, fontWeight: 700 }}>Expected:</div>
                          <div style={{ color: "#ccc" }}>{tc.expected}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activeProblem as any).companies?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: 11, fontWeight: 900, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Asked by</h4>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(activeProblem as any).companies?.map((c: string) => (
                        <span key={c} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.06)" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 14, border: "1px solid rgba(124,58,237,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, color: "var(--brand-primary)" }}>
                    <AlertCircle size={14} />
                    <span style={{ fontSize: 12, fontWeight: 800 }}>Hint</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    {(activeProblem as any).hint || "Analyze the problem structure and consider edge cases."}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#444" }}>
                <Code size={44} style={{ opacity: 0.1, marginBottom: 16 }} />
                <p style={{ fontSize: 14 }}>Select a problem to start.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
