"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { executionApi } from "@/lib/api";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, ArrowRight, Activity, TrendingUp, FolderGit2, ShieldCheck, Target, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function CareerOS() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div className="p-8 text-red-500">Access Denied. Please sign in.</div>;
  }

  return (
    <div className="relative min-h-screen bg-black/95 text-white overflow-hidden pb-32">
      <BackgroundBeams />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        
        <header className="mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Career Execution Engine
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg">
              Deterministic skill mapping, verified project evidence, and algorithmic career readiness. Phase 3 initialized.
            </p>
          </motion.div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-800 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: Target },
            { id: "roadmap", label: "Roadmap & Tasks", icon: Activity },
            { id: "projects", label: "Verified Projects", icon: FolderGit2 },
            { id: "readiness", label: "Career Readiness", icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? "border-emerald-500 text-emerald-400" 
                  : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "roadmap" && <RoadmapTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "readiness" && <ReadinessTab />}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 1. OVERVIEW TAB
// ────────────────────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
          <Target className="w-5 h-5" /> Target Role
        </h3>
        <p className="text-gray-400 text-sm mb-4">Set a role to generate your execution roadmap and view readiness.</p>
        <ReadinessTab condensed />
      </div>
      <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl lg:col-span-2">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Active Tasks
        </h3>
        <RoadmapTab condensed />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 2. ROADMAP & TASKS TAB
// ────────────────────────────────────────────────────────
function RoadmapTab({ condensed = false }: { condensed?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const rm = await executionApi.getRoadmap();
      setData(rm);
      const t = await executionApi.getTasks();
      setTasks(t);
    } catch (err: any) {
      if (err.status !== 404) {
        toast.error("Failed to load roadmap");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const completeTask = async (taskId: number) => {
    try {
      await executionApi.updateTask(taskId, "completed");
      toast.success("Task completed!");
      fetchRoadmap(); // refresh
    } catch (err) {
      toast.error("Failed to complete task");
    }
  };

  const generate = async () => {
    try {
      setLoading(true);
      // Hardcoded role_id = 1 for demo/integration (usually selected by user)
      await executionApi.generateRoadmap(1);
      toast.success("Roadmap generated!");
      fetchRoadmap();
    } catch (err) {
      toast.error("Failed to generate roadmap");
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  if (!data) {
    return (
      <div className="p-8 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
        <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No active roadmap</h3>
        <p className="text-gray-400 mb-6">Your personalized roadmap hasn't been generated yet.</p>
        <button onClick={generate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl transition-colors">
          Generate Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Daily Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-emerald-400">Today's Actions</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No actions available for this milestone yet.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">{t.title}</h4>
                  <p className="text-sm text-gray-400">{t.description}</p>
                </div>
                {t.status === "completed" ? (
                  <span className="text-emerald-500 flex items-center gap-1 text-sm font-medium"><CheckCircle2 className="w-4 h-4"/> Completed</span>
                ) : (
                  <button onClick={() => completeTask(t.id)} className="px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 rounded-lg text-sm transition-colors">
                    Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones */}
      {!condensed && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Roadmap Milestones</h2>
          <div className="space-y-4">
            {data.milestones.map((m: any, idx: number) => (
              <div key={m.id} className={`p-5 rounded-2xl border ${m.status === 'active' ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-gray-800 bg-gray-900/30'} flex gap-4 items-start`}>
                <div className={`mt-1 ${m.status === 'completed' ? 'text-emerald-500' : m.status === 'active' ? 'text-cyan-400' : 'text-gray-600'}`}>
                  {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5"/> : <Circle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-white">Milestone {idx + 1}: {m.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{m.description}</p>
                  <span className={`inline-block mt-3 px-2.5 py-1 text-xs rounded-md ${m.status === 'active' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'}`}>
                    {m.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 3. PROJECTS TAB
// ────────────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await executionApi.getProjects();
      setProjects(res);
    } catch (err) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProjectRequest = async () => {
    try {
      await executionApi.createProject({
        title: "Microservices Architecture in Go",
        description: "Built a distributed system using gRPC and Redis.",
        project_url: "https://github.com/user/demo",
        skill_ids: [1] // Assume skill ID 1 exists
      });
      toast.success("Project added!");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to create project");
    }
  }

  const completeProject = async (id: number) => {
    try {
      await executionApi.completeProject(id);
      toast.success("Evidence Verified! Skill proficiency updated.");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to complete project");
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Verified Evidence</h2>
        <button onClick={createProjectRequest} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-colors">
          + Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
          <FolderGit2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Add a project to start building verified evidence.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
              <h3 className="font-semibold text-lg text-white mb-2">{p.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.description}</p>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                <span className={`text-xs px-2.5 py-1 rounded-md ${p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {p.status === 'completed' ? 'VERIFIED EVIDENCE' : 'IN PROGRESS'}
                </span>
                {p.status !== 'completed' && (
                  <button onClick={() => completeProject(p.id)} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 4. READINESS TAB
// ────────────────────────────────────────────────────────
function ReadinessTab({ condensed = false }: { condensed?: boolean }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        setLoading(true);
        // Hardcoded role 1 for demo purposes
        const res = await executionApi.getCareerReadiness(1);
        setData(res);
      } catch (err: any) {
        if (err.status !== 404) {
          toast.error("Failed to load readiness");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReadiness();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  if (!data || !data.role_name) {
    return (
      <div className="p-6 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/30">
        <AlertTriangle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Not enough verified data to calculate readiness yet.</p>
      </div>
    );
  }

  const scorePct = Math.round(data.score * 100);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">Target Role</h3>
            <p className="text-2xl font-bold text-white">{data.role_name}</p>
          </div>
          <div className="text-right">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Readiness Score</h3>
            <p className={`text-4xl font-bold ${scorePct >= 80 ? 'text-emerald-400' : scorePct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {scorePct}%
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${scorePct}%` }} 
            className={`h-full rounded-full ${scorePct >= 80 ? 'bg-emerald-500' : scorePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">Calculated via deterministic skill mapping</p>
      </div>

      {!condensed && data.details && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Skill Breakdown</h4>
          <div className="space-y-3">
            {data.details.map((d: any, idx: number) => {
              const cap = Math.min(d.current, d.required);
              const isMissing = d.current < d.required;
              return (
                <div key={idx} className="p-4 rounded-xl border border-gray-800 bg-gray-900/40">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">{d.skill}</span>
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">Weight: {d.importance}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Current: {(d.current * 100).toFixed(0)}%</span>
                    <span className="text-gray-400">Required: {(d.required * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${isMissing ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(cap / d.required) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
