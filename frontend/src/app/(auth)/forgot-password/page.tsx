"use client";
import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ShieldQuestion, Sparkles, ChevronRight, Send, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gray-950">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-[480px] w-full glass-panel p-10 md:p-14 space-y-10 relative border-2 border-white/5 shadow-[0_32px_120px_-10px_rgba(0,0,0,0.8)]"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 pointer-events-none">
                    <ShieldQuestion size={120} className="text-indigo-500" />
                </div>

                <div className="space-y-4 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                            <ShieldQuestion size={24} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Recover</h1>
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest pl-1">Restore your access to the Neural Ecosystem</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Registered Email</label>
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-all">
                            <Mail size={18} className="text-gray-500" />
                            <input type="email" placeholder="student@tulasiai.com" className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200" />
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex items-center justify-center gap-3">
                        <Send size={18} /> Send Recovery Link
                    </button>

                    <Link href="/(auth)/login" className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Authentication
                    </Link>
                </div>

                <div className="text-center pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-[4px] leading-relaxed">
                        Security Notice: If you don't receive an email within 5 minutes, please check your spam folder or contact neural-support.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
