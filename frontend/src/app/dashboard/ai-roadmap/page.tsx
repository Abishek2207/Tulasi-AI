"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import { API_URL } from "@/lib/api";
import {
  Map, Clock, CheckCircle2, Circle, Zap, BookOpen,
  Code2, Target, ChevronDown, ChevronRight, ArrowRight, Flame
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface StudentTask {
  id: string;
  skill: string;
  topic: string;
  type: string;
  duration_min: number;
  resource_url: string;
  completed: boolean;
}

interface StudentDay {
  day: number;
  label: string;
  focus: string;
  total_hours: number;
  tasks: StudentTask[];
  tip: string;
}

interface ProfessionalTask {
  type: string;
  description: string;
  hrs: number;
}

interface ProfessionalWeek {
  week: number;
  label: string;
  focus: string;
  topic: string;
  level: string;
  duration_hrs: number;
  salary_impact: { boost_pct: number; avg_hike: string; demand: string };
  tasks: ProfessionalTask[];
  completed: boolean;
}

type UserType = "STUDENT" | "PROFESSIONAL";

// ── Helpers ────────────────────────────────────────────────────────────────

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
}

const HOUR_OPTIONS = [
  { label: "1 hr / day", value: 1 },
  { label: "3 hrs / day", value: 3 },
  { label: "5 hrs / day", value: 5 },
];

const STUDENT_FOCUS = ["DSA", "Aptitude", "Projects", "Core CS"];
const PROFESSIONAL_SKILLS = ["AI", "Cloud", "System Design", "Leadership"];

const TYPE_ICON: Record<string, any> = {
  learn: <BookOpen size={13} />,
  practice: <Code2 size={13} />,
  review: <Target size={13} />,
};

const TYPE_COLOR: Record<string, string> = {
  learn: "#8B5CF6",
  practice: "#10B981",
  review: "#F59E0B",
};

const LEVEL_COLOR: Record<string, string> = {
  beginner: "#10B981",
  intermediate: "#F59E0B",
  advanced: "#F43F5E",
};

// ── Student Day Card ────────────────────────────────────────────────────────

function StudentDayCard({ day, index }: { day: StudentDay; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allDone = day.tasks.every(t => completedTasks.has(t.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      style={{
        background: allDone ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${allDone ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 18, overflow: "hidden",
        transition: "border-color 0.3s, background 0.3s",
      }}
    >
      {/* Day Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "18px 22px", display: "flex", alignItems: "center",
          gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: allDone ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 900, fontSize: 15, color: allDone ? "#10B981" : "#A78BFA", flexShrink: 0,
        }}>
          {allDone ? <CheckCircle2 size={18} color="#10B981" /> : day.day}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "white" }}>{day.label}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600, marginTop: 2 }}>
            {day.focus} · {day.total_hours}h · {day.tasks.length} tasks
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)" }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* Tasks */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              {day.tasks.map(task => {
                const done = completedTasks.has(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
                      background: done ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                      borderRadius: 12, cursor: "pointer",
                      border: `1px solid ${done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ marginTop: 2, flexShrink: 0, color: done ? "#10B981" : "rgba(255,255,255,0.3)" }}>
                      {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ color: TYPE_COLOR[task.type] || "#8B5CF6" }}>{TYPE_ICON[task.type] || <Target size={13} />}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: TYPE_COLOR[task.type] || "#8B5CF6", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {task.type}
                        </span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>~{task.duration_min} min</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: done ? 600 : 700, color: done ? "rgba(255,255,255,0.4)" : "white", textDecoration: done ? "line-through" : "none" }}>
                        {task.topic}
                      </div>
                    </div>
                    <a
                      href={task.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ flexShrink: 0, color: "rgba(255,255,255,0.25)", marginTop: 2 }}
                    >
                      <ArrowRight size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
            {day.tip && (
              <div style={{ margin: "0 22px 16px", padding: "10px 14px", background: "rgba(139,92,246,0.06)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.12)" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>💡 {day.tip}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Professional Week Card ──────────────────────────────────────────────────

function ProfWeekCard({ week, index }: { week: ProfessionalWeek; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18, overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#10B981", flexShrink: 0 }}>
          W{week.week}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "white" }}>{week.topic}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: LEVEL_COLOR[week.level] + "20", color: LEVEL_COLOR[week.level] }}>
              {week.level.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{week.duration_hrs}h total</span>
            {week.salary_impact && (
              <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>+{week.salary_impact.boost_pct}% salary potential</span>
            )}
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.3)" }}>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              {week.tasks.map((task, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ color: TYPE_COLOR[task.type] || "#8B5CF6", marginTop: 1, flexShrink: 0 }}>{TYPE_ICON[task.type] || <Target size={13} />}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{task.description}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 2 }}>{task.hrs}h estimated</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function AIRoadmapPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const userType: UserType = (user?.user_type as UserType) || "STUDENT";
  const mentorName = user?.profile?.ai_mentor_name || "Jarvis";

  const [hours, setHours] = useState(3);
  const [customHours, setCustomHours] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [focus, setFocus] = useState(userType === "STUDENT" ? "DSA" : "AI");

  const [roadmap, setRoadmap] = useState<StudentDay[] | ProfessionalWeek[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  const effectiveHours = isCustom ? (parseInt(customHours) || 2) : hours;

  const generate = async () => {
    setLoading(true);
    const token = getToken();
    try {
      if (userType === "STUDENT") {
        const res = await fetch(`${API_URL}/api/roadmap/career/student`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ hours_per_day: effectiveHours, days: 7, focus, target_company: "FAANG" }),
        });
        const d = await res.json();
        if (d.roadmap) { setRoadmap(d.roadmap); setMeta(d); setGenerated(true); }
      } else {
        const res = await fetch(`${API_URL}/api/roadmap/career/professional`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: user?.profile?.current_role || "Developer", experience_years: user?.profile?.experience_years || 2, target_skill: focus, days: 5 }),
        });
        const d = await res.json();
        if (d.roadmap) { setRoadmap(d.roadmap); setMeta(d); setGenerated(true); }
      }
    } catch {}
    finally { setLoading(false); }
  };

  const focusOptions = userType === "STUDENT" ? STUDENT_FOCUS : PROFESSIONAL_SKILLS;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 80 }}>
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <motion.div
            animate={{ boxShadow: ["0 8px 20px rgba(139,92,246,0.3)", "0 8px 40px rgba(139,92,246,0.6)", "0 8px 20px rgba(139,92,246,0.3)"] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Map size={20} color="white" />
          </motion.div>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: 2 }}>
            AI Career Roadmap Engine
          </div>
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, fontFamily: "var(--font-outfit)", letterSpacing: "-2px", marginBottom: 8, lineHeight: 1.1 }}>
          Your{" "}
          <span style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Personalized
          </span>
          {" "}Roadmap
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
          Hi! I'm <strong style={{ color: "#A78BFA" }}>{mentorName}</strong>. Let me build your custom {userType === "STUDENT" ? "placement" : "career growth"} plan.
        </p>
      </motion.div>

      {/* Configuration Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 32, padding: "28px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22 }}
      >
        {/* Focus selector */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            {userType === "STUDENT" ? "📚 Focus Area" : "🚀 Target Skill"}
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {focusOptions.map(f => (
              <button
                key={f}
                onClick={() => setFocus(f)}
                style={{
                  padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: focus === f ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "rgba(255,255,255,0.05)",
                  color: focus === f ? "white" : "rgba(255,255,255,0.5)",
                  boxShadow: focus === f ? "0 4px 14px rgba(139,92,246,0.35)" : "none",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Hours selector (student only) */}
        {userType === "STUDENT" && (
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              ⏱ Daily Study Time
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {HOUR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setHours(opt.value); setIsCustom(false); }}
                  style={{
                    padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                    border: "none", cursor: "pointer", transition: "all 0.2s",
                    background: (!isCustom && hours === opt.value) ? "linear-gradient(135deg, #F59E0B, #F43F5E)" : "rgba(255,255,255,0.05)",
                    color: (!isCustom && hours === opt.value) ? "white" : "rgba(255,255,255,0.5)",
                    boxShadow: (!isCustom && hours === opt.value) ? "0 4px 14px rgba(245,158,11,0.35)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setIsCustom(true)}
                style={{
                  padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: isCustom ? "linear-gradient(135deg, #F59E0B, #F43F5E)" : "rgba(255,255,255,0.05)",
                  color: isCustom ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                Custom
              </button>
              {isCustom && (
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={customHours}
                  onChange={e => setCustomHours(e.target.value)}
                  placeholder="hrs/day"
                  style={{
                    width: 90, padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, outline: "none"
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generate}
          disabled={loading}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            color: "white", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: loading ? "none" : "0 8px 24px rgba(139,92,246,0.4)",
            transition: "all 0.3s",
          }}
        >
          {loading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7 }}
                style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
              Generating your roadmap...
            </>
          ) : (
            <>
              <Zap size={18} />
              {generated ? "Regenerate" : "Generate"} My {userType === "STUDENT" ? "7-Day Placement" : "Career Growth"} Roadmap
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Meta stats */}
      {generated && meta && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
          {userType === "STUDENT" ? (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#8B5CF6" }}>{meta.days || 7}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Days</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#F59E0B" }}>{meta.hours_per_day || effectiveHours}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Hrs/Day</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#10B981" }}>{meta.focus || focus}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Focus</div>
              </div>
            </>
          ) : (
            <>
              {meta.salary_impact && (
                <>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#10B981" }}>{meta.salary_impact.avg_hike}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Avg Hike</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#8B5CF6" }}>+{meta.salary_impact.boost_pct}%</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase" }}>Salary Boost</div>
                  </div>
                </>
              )}
              {meta.next_skill_prediction && (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "14px", textAlign: "center", gridColumn: "span 2" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#F59E0B" }}>Next: {meta.next_skill_prediction.skill}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: 4 }}>{meta.next_skill_prediction.reason}</div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Roadmap List */}
      {generated && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {userType === "STUDENT" ? `📅 ${roadmap.length}-Day Plan` : `📅 ${roadmap.length}-Week Plan`}
          </div>
          {userType === "STUDENT"
            ? (roadmap as StudentDay[]).map((day, i) => <StudentDayCard key={day.day} day={day} index={i} />)
            : (roadmap as ProfessionalWeek[]).map((week, i) => <ProfWeekCard key={week.week} week={week} index={i} />)
          }
        </div>
      )}

      {!generated && !loading && (
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
          <Map size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          Hit "Generate" to get your personalized {userType === "STUDENT" ? "7-day placement" : "career growth"} roadmap.
        </motion.div>
      )}
    </div>
  );
}
