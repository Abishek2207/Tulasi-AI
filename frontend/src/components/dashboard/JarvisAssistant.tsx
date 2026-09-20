"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Send, Activity, Focus, Target } from "lucide-react";
import { jarvisApi, streakApi } from "@/lib/api";
// import { useAuth } from "@/hooks/useAuth";

export default function JarvisAssistant() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [nudge, setNudge] = useState("Initializing systems...");
  const [suggestion, setSuggestion] = useState("Loading context...");
  const [summary, setSummary] = useState("");
  const [command, setCommand] = useState("");
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchContext = async () => {
      try {
        const [nudgeRes, suggRes, sumRes] = await Promise.all([
          jarvisApi.getDailyNudge(token),
          jarvisApi.getFocusSuggestion(token),
          jarvisApi.getAccountabilitySummary(token)
        ]);

        setNudge(nudgeRes.nudge);
        setSuggestion(suggRes.suggestion);
        setSummary(sumRes.summary);
      } catch (err) {
        console.error("Jarvis load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [token]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !token) return;

    try {
      setCommandResult("Processing intent...");
      const res = await jarvisApi.parseCommand(command, token);
      
      if (res.intent === "FREEZE_STREAK") {
        try {
          const freezeRes = await streakApi.freeze(token);
          setCommandResult(freezeRes.message || "Streak frozen successfully.");
        } catch (err: any) {
          setCommandResult(err?.response?.data?.detail || "Failed to freeze streak.");
        }
      } else if (res.intent === "START_FOCUS") {
        setCommandResult("Redirecting to Focus mode...");
        setTimeout(() => {
          window.location.href = "/dashboard/focus";
        }, 1000);
      } else if (res.intent === "SHOW_STATS") {
        setCommandResult(summary);
      } else {
        setCommandResult("I'm not sure how to handle that. Try 'Start focus' or 'Freeze streak'.");
      }
    } catch (err) {
      setCommandResult("Error parsing command.");
    }
    
    setCommand("");
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/20 rounded mb-4"></div>
        <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-white/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-indigo-500/30 rounded-xl p-6 mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
        <Terminal size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Jarvis</h2>
            <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">Accountability Protocol Active</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-lg border border-white/5">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Target size={14} className="text-blue-400" /> Daily Directive
              </h4>
              <p className="text-white text-sm leading-relaxed font-medium">"{nudge}"</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg border border-white/5">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Activity size={14} className="text-red-400" /> Status Summary
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="bg-black/30 p-4 rounded-lg border border-white/5">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Focus size={14} className="text-green-400" /> Focus Suggestion
              </h4>
              <p className="text-white font-medium">{suggestion}</p>
            </div>

            <div className="bg-black/40 rounded-lg border border-indigo-500/20 overflow-hidden">
              <form onSubmit={handleCommand} className="flex items-center">
                <input 
                  type="text" 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Tell Jarvis what to do... (e.g. 'Freeze my streak')"
                  className="bg-transparent border-none outline-none text-sm text-white px-4 py-3 flex-1 placeholder:text-gray-600"
                />
                <button type="submit" className="p-3 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors">
                  <Send size={18} />
                </button>
              </form>
              {commandResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-4 py-2 bg-indigo-500/10 border-t border-indigo-500/10 text-xs text-indigo-200"
                >
                  <span className="font-mono opacity-60 mr-2">&gt;</span> {commandResult}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
