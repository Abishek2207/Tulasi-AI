"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import {
  BookOpen, CheckCircle2, Clock, Calendar, Zap, Play, Check, ChevronRight, AlertCircle, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  title: string;
  description: string;
  task_type: string;
  estimated_minutes: number;
  status: string;
}

export default function DailyLearningPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [completingTask, setCompletingTask] = useState<number | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

  const authHeaders = (): Record<string, string> => {
    const token = (session as any)?.backendToken;
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  };

  useEffect(() => {
    if (session) {
      fetchTodayTasks();
    }
  }, [session]);

  const fetchTodayTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/v1/daily-learning/today`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setDailyData(data);
      } else {
        if (res.status === 404) {
          setError("Career Intelligence Profile not found. Please complete your Career Intelligence setup first.");
        } else {
          setError("Failed to fetch daily learning tasks.");
        }
      }
    } catch (e) {
      setError("Failed to connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: number, estimatedMinutes: number) => {
    setCompletingTask(taskId);
    try {
      const payload = {
        difficulty_rating: 3,
        notes: "Completed from dashboard",
        time_spent_minutes: estimatedMinutes,
        was_adapted: false
      };
      const res = await fetch(`${backendUrl}/api/v1/daily-learning/task/${taskId}/complete`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Optimistically update
        setDailyData((prev: any) => ({
          ...prev,
          tasks: prev.tasks.map((t: Task) => t.id === taskId ? { ...t, status: "completed" } : t)
        }));
      } else {
        alert("Failed to complete task.");
      }
    } catch (e) {
      alert("Error completing task.");
    } finally {
      setCompletingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading today's learning plan…</p>
        </div>
      </div>
    );
  }

  const tasks: Task[] = dailyData?.tasks || [];
  const completedTasks = tasks.filter(t => t.status === "completed");
  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimated_minutes, 0);
  const completedMinutes = completedTasks.reduce((sum, t) => sum + t.estimated_minutes, 0);
  const progressPercent = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">Daily Learning</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Today's Action Plan
            </h1>
            <p className="mt-1 text-slate-400 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {dailyData?.date ? new Date(dailyData.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
            </p>
          </div>
          {dailyData && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-400">Daily Goal</div>
                <div className="font-bold text-emerald-400">{dailyData.daily_time_minutes} mins</div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
            {error.includes("Career Intelligence") && (
              <button 
                onClick={() => router.push("/dashboard/career-intelligence")}
                className="ml-auto text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                Go to Setup
              </button>
            )}
          </div>
        )}

        {!error && dailyData && (
          <>
            {/* Progress Section */}
            <div className="bg-[#13131c] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">Daily Progress</h3>
                </div>
                <span className="text-sm font-medium text-emerald-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                />
              </div>
              <p className="mt-3 text-xs text-slate-400 text-right">
                {completedMinutes} / {totalMinutes} minutes completed
              </p>
            </div>

            {/* Adaptation Prompt */}
            {dailyData.adaptation_prompt && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-300 text-sm font-medium mb-1">Missed Tasks Found</h4>
                  <p className="text-xs text-amber-200/80">{dailyData.adaptation_prompt}</p>
                </div>
              </div>
            )}

            {/* Tasks List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
              
              {tasks.length === 0 ? (
                <div className="text-center py-12 border border-white/5 rounded-2xl bg-[#13131c]">
                  <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-slate-300 font-medium">No tasks for today</h3>
                  <p className="text-slate-500 text-sm mt-1">Take a break or generate new tasks from your Career Intelligence roadmap.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <AnimatePresence>
                    {tasks.map((task) => {
                      const isCompleted = task.status === "completed";
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-5 rounded-2xl border transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-emerald-900/10 border-emerald-500/20' 
                              : 'bg-[#13131c] border-white/10 hover:border-emerald-500/30'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                                  {task.task_type}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {task.estimated_minutes} mins
                                </span>
                              </div>
                              <h3 className={`font-semibold text-lg ${isCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                                {task.title}
                              </h3>
                              <p className="text-sm text-slate-400 line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                            
                            <div className="shrink-0 w-full sm:w-auto flex justify-end">
                              {isCompleted ? (
                                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl font-medium text-sm">
                                  <Check className="w-4 h-4" />
                                  Completed
                                </div>
                              ) : (
                                <button
                                  onClick={() => completeTask(task.id, task.estimated_minutes)}
                                  disabled={completingTask === task.id}
                                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {completingTask === task.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                  Start & Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
