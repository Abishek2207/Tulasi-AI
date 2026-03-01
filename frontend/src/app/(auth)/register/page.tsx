"use client";
import React from 'react';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Github, Chrome, Cpu, Sparkles, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gray-950">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-[540px] w-full glass-panel p-10 md:p-14 space-y-10 relative border-2 border-white/5 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.8)]"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 pointer-events-none">
                    <Zap size={120} className="text-indigo-500" />
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <UserPlus size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Join Us</h1>
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest pl-1">Initialize your Neural Learning Core</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
                            <User size={18} className="text-gray-500" />
                            <input type="text" placeholder="John Doe" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Major / Domain</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
                            <Cpu size={18} className="text-gray-500" />
                            <input type="text" placeholder="CS Eng" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Academic Email</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
                            <Mail size={18} className="text-gray-500" />
                            <input type="email" placeholder="student@tulasiai.com" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Create Password</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
                            <Lock size={18} className="text-gray-500" />
                            <input type="password" placeholder="Min 8 Characters" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-1">
                        <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white"><ShieldCheck size={14} /></div>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">I agree to the <span className="text-indigo-400">Neural Conduct & Terms</span></p>
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-3">
                        <Sparkles size={18} /> Initialize Profile
                    </button>
                </div>

                <div className="flex items-center gap-4 py-1">
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-[4px]">OR</span>
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white group">
                        <Chrome size={18} /> Google
                    </button>
                    <button className="bg-white/5 border border-white/10 hover:bg-white/10 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white group">
                        <Github size={18} /> Github
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Already Registered? <Link href="/(auth)/login" className="text-indigo-500 hover:text-indigo-400 transition-colors inline-flex items-center gap-1">Login Identity <ChevronRight size={14} /></Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
