"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProfessionalOnboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: "", experience: "", company: "", industry: "",
    freeTime: "", targetRole: "", salaryGoal: "", healthLevel: "Good"
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Simulate sending data to LangGraph backend
    router.push("/professional/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#05070D] flex items-center justify-center p-6 text-white font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-black mb-2">Professional Mode Initialization</h1>
        <p className="text-white/60 mb-8">Reduce your AI-era career risk and plan your next move.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Current Role</label>
              <input name="role" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#10B981]" placeholder="e.g. Manual QA" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Years of Experience</label>
              <input name="experience" type="number" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#10B981]" placeholder="e.g. 4" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Target Role</label>
              <input name="targetRole" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#10B981]" placeholder="e.g. Automation Engineer" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Industry</label>
              <input name="industry" required onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#10B981]" placeholder="e.g. Fintech" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#10B981] text-black font-black py-4 rounded-xl hover:bg-[#0EA5E9] transition-colors mt-4">
            Initialize Career Intelligence
          </button>
        </form>
      </motion.div>
    </div>
  );
}
