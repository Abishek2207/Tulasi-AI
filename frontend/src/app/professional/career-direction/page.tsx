"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { professionalApi } from "@/lib/api";
import { ArrowLeft, Loader2, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Direction {
  target: string;
  reason: string;
  salaryBoost: string;
  difficulty: string;
}

export default function CareerDirectionPlanner() {
  const { data: session } = useSession();
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchDirections();
    }
  }, [session]);

  const fetchDirections = async () => {
    try {
      setLoading(true);
      const user = session?.user;
      const payload = {
        current_role: (user as any)?.target_role || "Software Engineer",
        target_role: (user as any)?.target_role || "Senior Software Engineer",
        experience_years: 3,
        current_skills: (user as any)?.skills ? (user as any).skills.split(",") : ["JavaScript", "Python"]
      };
      const res = await professionalApi.getCareerDirections(payload, session!.user!.accessToken as string);
      setDirections(res.directions || []);
    } catch (err) {
      toast.error("Failed to load career directions");
      // Fallback
      setDirections([
        { target: "AI Backend Engineer", reason: "Leverages your current backend skills with high market demand.", salaryBoost: "+25%", difficulty: "Medium" },
        { target: "Cloud Architect", reason: "A natural progression for senior backend engineers focusing on scalable infrastructure.", salaryBoost: "+40%", difficulty: "Hard" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070D] p-8 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black">Career Direction Planner</h1>
        </div>
        <p className="text-white/60 mb-10 text-lg">AI-generated paths to escape role stagnation and increase your salary potential based on live market data.</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
            <p className="text-white/60 font-medium animate-pulse">Analyzing real-time market data...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {directions.map((d, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.07] transition-all cursor-default">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-[#0EA5E9]">{d.target}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/70 border border-white/10">{d.difficulty} Path</span>
                  </div>
                  <p className="text-white/70 max-w-xl text-sm leading-relaxed">{d.reason}</p>
                </div>
                <div className="text-center bg-gradient-to-br from-[#0EA5E9]/20 to-blue-600/20 px-8 py-5 rounded-2xl border border-[#0EA5E9]/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] flex-shrink-0">
                  <div className="flex items-center justify-center gap-2 text-sm text-[#0EA5E9] font-bold uppercase tracking-wider mb-1">
                    <TrendingUp className="w-4 h-4" /> Estimated Impact
                  </div>
                  <div className="text-3xl font-black text-white drop-shadow-md">{d.salaryBoost}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
