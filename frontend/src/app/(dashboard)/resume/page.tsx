"use client";
import React, { useState } from 'react';
import {
    FileText, User, Briefcase, GraduationCap,
    Award, Code2, Globe, Mail, Phone,
    MapPin, Plus, Trash2, Edit3, Save,
    Download, Sparkles, Wand2, ShieldCheck,
    Bot, BarChart3, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumePage() {
    const [score, setScore] = useState(82);

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            {/* Left: Resume Editor */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 -z-10"><FileText size={200} /></div>

                {/* Header Toolbar */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-950/20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><FileText size={20} /></div>
                            <h2 className="font-extrabold text-xl tracking-tight">ATS Resume Architect</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white/5 hover:bg-white/10 text-gray-200 px-6 py-2.5 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 transition-all">
                            <Download size={18} /> Download PDF
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2">
                            <Save size={18} /> Save Resume
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-12 bg-white/5 p-12 rounded-[32px] border border-white/5 shadow-2xl">
                        {/* Header Info */}
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-black tracking-tight text-white border-none outline-none focus:text-indigo-400 transition-colors" contentEditable>TULASI STUDENT</h1>
                            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Mail size={14} className="text-indigo-500" /> student@tulasiai.com</span>
                                <span className="flex items-center gap-2"><Phone size={14} className="text-indigo-500" /> +91 98765 43210</span>
                                <span className="flex items-center gap-2"><MapPin size={14} className="text-indigo-500" /> Chennai, India</span>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-indigo-400 flex items-center gap-3">
                                    <Briefcase size={20} /> Professional Experience
                                </h3>
                                <button className="p-1 px-3 bg-white/5 rounded-lg text-gray-500 hover:text-white text-[10px] font-bold uppercase transition-all">+ Add Position</button>
                            </div>

                            <div className="space-y-6">
                                <div className="group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xl font-black text-white" contentEditable>Full Stack Developer Intern</h4>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Jan 2026 — Present</span>
                                    </div>
                                    <p className="text-sm font-bold text-indigo-500 mb-4" contentEditable>TULASIAI ECOSYSTEMS</p>
                                    <ul className="list-disc list-inside space-y-2 text-gray-400 text-sm leading-relaxed" contentEditable>
                                        <li>Architected a retrieval-augmented generation (RAG) system using LangChain and pgvector.</li>
                                        <li>Optimized frontend performance by 40% through Next.js 14 server components.</li>
                                        <li>Collaborated with a global team of developers to ship Level 50 XP systems.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-indigo-400 flex items-center gap-3">
                                    <GraduationCap size={20} /> Academic Background
                                </h3>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xl font-black text-white" contentEditable>Bachelor of Engineering in CS</h4>
                                    <p className="text-sm font-bold text-gray-500" contentEditable>ANNA UNIVERSITY, CHENNAI</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-white uppercase tracking-widest">GPA: 8.9 / 10.0</p>
                                    <p className="text-[10px] font-bold text-gray-600 uppercase">Class of 2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: AI Analysis & Tools */}
            <div className="w-[380px] flex flex-col gap-6 shrink-0">
                <div className="glass-panel p-8 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-indigo-600/10 to-transparent">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={100} /></div>
                    <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="351" strokeDashoffset={351 * (1 - score / 100)} className="text-indigo-500 shadow-lg" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black">{score}</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ATS Match</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white">Advanced Analysis</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">Your resume is highly optimized for "Software Engineer" roles. To reach 90+, add more quantifiable metrics.</p>
                    </div>

                    <button className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all group">
                        <Sparkles size={16} className="group-hover:scale-125 transition-transform" /> Improve Points with AI
                    </button>
                </div>

                <div className="flex-1 glass-panel p-6 space-y-6 overflow-hidden">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">AI Optimizer Suggestions</h4>
                    <div className="space-y-3 overflow-y-auto no-scrollbar max-h-[300px]">
                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-2 group cursor-pointer hover:bg-orange-500/20 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Clarity Issue</span>
                                <Wand2 size={12} className="text-orange-400" />
                            </div>
                            <p className="text-xs text-gray-300">"Architected a RAG system" is good, but try: "Engineered a RAG-based tutoring hub that reduced response latency by 54%."</p>
                        </div>
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2 group cursor-pointer hover:bg-green-500/20 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Strength Found</span>
                                <ShieldCheck size={12} className="text-green-400" />
                            </div>
                            <p className="text-xs text-gray-300">Your mention of Next.js 14 and Server Components is perfect for high-growth tech stacks.</p>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                            <Bot size={18} className="text-indigo-400" /> Real-time Feedback
                        </button>
                        <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-indigo-600/30 transition-all">
                            <Rocket size={18} /> Apply One-Click Fixes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
