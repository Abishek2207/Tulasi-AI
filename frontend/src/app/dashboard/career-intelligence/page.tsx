"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Target, Clock, TrendingUp, ChevronRight,
  CheckCircle2, Circle, Zap, BookOpen, Code2, Star,
  ArrowRight, RefreshCw, Brain, Rocket, Calendar
} from "lucide-react";

interface Milestone {
  title: string;
  description: string;
  duration: string;
  focus_skills: string[];
  status: "pending" | "in_progress" | "completed";
}

interface Project {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface RoadmapData {
  overview: string;
  estimated_months_to_goal: number;
  readiness_score: number;
  milestones: Milestone[];
  recommended_projects: Project[];
  daily_habits: string[];
}

interface Roadmap {
  roadmap_data: RoadmapData;
  estimated_months_to_goal: number;
  readiness_score: number;
  updated_at: string;
}

const DIFFICULTY_COLORS = {
  Beginner: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  Intermediate: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  Advanced: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400",
};

export default function CareerIntelligencePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

  const authHeaders = () => {
    const token = (session as any)?.backendToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, roadmapRes] = await Promise.all([
        fetch(`${backendUrl}/api/v1/career-intelligence/profile`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/v1/career-intelligence/roadmap`, { headers: authHeaders() }),
      ]);

      if (profileRes.ok) setProfile(await profileRes.json());
      else if (profileRes.status === 404) {
        router.push("/dashboard/career-intelligence/onboarding");
        return;
      }

      if (roadmapRes.ok) setRoadmap(await roadmapRes.json());
    } catch (e) {
      setError("Failed to connect to the backend. Make sure it's running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/v1/career-intelligence/generate`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap({ roadmap_data: data.data, estimated_months_to_goal: data.data.estimated_months_to_goal, readiness_score: data.data.readiness_score, updated_at: new Date().toISOString() });
      } else {
        setError("Failed to generate roadmap. Please try again.");
      }
    } catch (e) {
      setError("Generation failed. Check your backend connection.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your intelligence profile…</p>
        </div>
      </div>
    );
  }

  const rd = roadmap?.roadmap_data;
  const readiness = rd?.readiness_score ?? roadmap?.readiness_score ?? 0;
  const months = rd?.estimated_months_to_goal ?? roadmap?.estimated_months_to_goal ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-xs font-medium text-violet-400 uppercase tracking-widest">Career Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Your AI Career Roadmap
            </h1>
            {profile && (
              <p className="mt-1 text-slate-400 text-sm">
                Personalized for <span className="text-violet-400 font-medium">{profile.full_name}</span>
                {profile.target_role && <> · Target: <span className="text-white font-medium">{profile.target_role}</span></>}
              </p>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg shadow-violet-500/20 group"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            {generating ? "Generating…" : roadmap ? "Regenerate" : "Generate My Roadmap"}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {!roadmap && !generating && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Rocket className="w-10 h-10 text-violet-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Ready to launch your career?</h2>
              <p className="text-slate-400 max-w-md text-sm">
                Click <strong className="text-violet-400">Generate My Roadmap</strong> above and our AI will create a personalized, step-by-step career path just for you.
              </p>
            </div>
          </div>
        )}

        {rd && (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Readiness Score */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" /> Readiness Score
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{readiness}</span>
                  <span className="text-slate-500 mb-1">/100</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000"
                    style={{ width: `${readiness}%` }}
                  />
                </div>
              </div>

              {/* Timeline */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> Time to Goal
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{months}</span>
                  <span className="text-slate-500 mb-1">months</span>
                </div>
                <p className="text-xs text-slate-500">Estimated based on your profile & pace</p>
              </div>

              {/* Milestones */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5" /> Milestones
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{rd.milestones?.length ?? 0}</span>
                  <span className="text-slate-500 mb-1">total</span>
                </div>
                <p className="text-xs text-slate-500">Clear checkpoints to track progress</p>
              </div>
            </div>

            {/* Overview */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/20 to-indigo-900/20 border border-violet-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">AI Overview</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{rd.overview}</p>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" /> Learning Milestones
              </h2>
              <div className="space-y-3">
                {rd.milestones?.map((m, i) => (
                  <div key={i} className="group flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.05] transition-all duration-300">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400">
                        {i + 1}
                      </div>
                      {i < (rd.milestones?.length ?? 0) - 1 && (
                        <div className="w-px h-full min-h-[2rem] bg-violet-500/20" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold text-white">{m.title}</h3>
                        <span className="text-xs text-slate-400 bg-white/[0.05] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {m.duration}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{m.description}</p>
                      {m.focus_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {m.focus_skills.map((s, si) => (
                            <span key={si} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Projects */}
              {rd.recommended_projects?.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-emerald-400" /> Recommended Projects
                  </h2>
                  <div className="space-y-3">
                    {rd.recommended_projects.map((p, i) => (
                      <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.Beginner} border`}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border bg-gradient-to-r ${DIFFICULTY_COLORS[p.difficulty] || DIFFICULTY_COLORS.Beginner}`}>
                            {p.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Habits */}
              {rd.daily_habits?.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> Daily Habits
                  </h2>
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    {rd.daily_habits.map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-amber-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                        </div>
                        <p className="text-slate-300 text-sm">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-slate-600">
              Last updated {new Date(roadmap?.updated_at ?? Date.now()).toLocaleDateString()} · Powered by Tulasi AI
            </p>
          </>
        )}
      </div>
    </div>
  );
}
