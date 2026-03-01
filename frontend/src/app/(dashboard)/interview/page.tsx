"use client";
import React, { useState } from 'react';
import {
    Briefcase, Play, Bot, User, Mic,
    Send, ShieldCheck, Star, Award,
    ChevronRight, MoreHorizontal, Zap,
    Settings, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewPage() {
    const [isStarted, setIsStarted] = useState(false);
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [topic, setTopic] = useState('React & Frontend Engineering');

    if (!isStarted) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl w-full glass-panel p-12 text-center space-y-10 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[100px] -z-10 rounded-full"></div>

                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-[28px] flex items-center justify-center text-indigo-500 border border-indigo-500/30 mx-auto shadow-inner mb-6">
                            <Briefcase size={40} />
                        </div>
                        <h1 className="text-4xl font-black text-white leading-tight">AI Mock Interview <br /><span className="text-indigo-500">Performance Evaluator</span></h1>
                        <p className="text-gray-400 max-w-lg mx-auto">Practice high-stakes technical interviews with our neural engine. Get instant scoring, ATS-ready feedback, and concept improvement plans.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Interview Domain</label>
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
                                <Bot size={20} className="text-gray-500" />
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Complexity Level</label>
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-3">
                                <Zap size={20} className="text-gray-500" />
                                <select
                                    className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200 appearance-none"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option>Junior / Entry</option>
                                    <option>Intermediate</option>
                                    <option>Senior Engineer</option>
                                    <option>Staff / Architect</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setIsStarted(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center gap-3"
                        >
                            <Play size={20} fill="white" /> Enter Interview Room
                        </button>
                        <button className="text-xs font-bold text-gray-500 hover:text-white border border-white/5 px-8 py-5 rounded-2xl transition-all hover:bg-white/5">
                            View Previous Results
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-green-600" /> Proctoring Active
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            <Star size={14} className="text-yellow-600" /> Feedback Powered by Gemini 1.5
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            {/* Left: Video Placeholder / Proctor Area */}
            <div className="w-[380px] flex flex-col gap-6 shrink-0">
                <div className="aspect-[4/3] glass-panel bg-black/60 relative overflow-hidden flex items-center justify-center">
                    <Video size={48} className="text-white/10" />
                    <div className="absolute top-4 left-4 bg-red-500/20 text-red-500 text-[10px] font-black border border-red-500/30 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Live
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <User size={12} /> Candidate: Student
                    </div>
                </div>

                <div className="flex-1 glass-panel p-6 space-y-6">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4">Real-time Performance</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">Communication</span>
                            <span className="text-xs font-bold text-indigo-400">92%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: '92%' }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">Technical Depth</span>
                            <span className="text-xs font-bold text-purple-400">78%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: '78%' }}></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">Confidence</span>
                            <span className="text-xs font-bold text-orange-400">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: '85%' }}></div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-4">
                            <Award size={32} className="text-indigo-500 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Standing</p>
                                <p className="text-lg font-black text-white">Elite Class</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Interview Chat */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-gray-950/20">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white uppercase tracking-tighter text-sm">{topic}</h3>
                        <span className="text-[10px] font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase tracking-widest text-gray-500">{difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><Settings size={18} className="text-gray-500" /></button>
                        <button
                            onClick={() => setIsStarted(false)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-500/20"
                        >
                            End Session
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-indigo-400 shrink-0 border border-white/5">
                            <Bot size={20} />
                        </div>
                        <div className="bg-gray-900 border border-white/5 p-6 rounded-2xl rounded-tl-none space-y-4 max-w-[80%]">
                            <p className="text-sm leading-relaxed text-gray-300">"Welcome to your senior frontend engineering interview. Let's start with a core concept. Can you explain the difference between a high-order component and a render prop in React, and when you'd prefer one over the other?"</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                <Zap size={12} className="animate-pulse" /> Interviewer is listening...
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-950/40 border-t border-white/10">
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        <div className="flex-1 bg-gray-900 border border-white/5 rounded-2xl px-6 py-1 flex items-center gap-4 focus-within:border-indigo-500/50 transition-all">
                            <input type="text" placeholder="Explain your answer clearly..." className="bg-transparent border-none outline-none flex-1 py-4 text-sm text-gray-200" />
                            <button className="p-2.5 text-indigo-400 hover:scale-110 transition-transform"><Mic size={22} /></button>
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <Send size={24} />
                        </button>
                    </div>
                    <p className="text-center mt-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Press Enter to Submit or Cmd + V for Video Mode</p>
                </div>
            </div>
        </div>
    );
}
