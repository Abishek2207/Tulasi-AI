"use client";
import React from 'react';
import {
    Award, ShieldCheck, Download, Share2,
    ChevronRight, ExternalLink, QrCode, Bot,
    Clock, Globe, Target, Sparkles, Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';

const CertificateCard = ({ id, title, date, verified, delay }: { id: string, title: string, date: string, verified: boolean, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="glass-panel group overflow-hidden border-2 border-white/5 hover:border-indigo-500/30 transition-all duration-500"
    >
        <div className="aspect-video relative overflow-hidden bg-gray-950 p-6 flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <img src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="pattern" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-2xl mx-auto flex items-center justify-center text-indigo-500 shadow-inner">
                    <Award size={32} />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">This verifies that the recipient has mastered the curriculum</p>
                <div className="pt-2 flex items-center justify-center gap-2">
                    <QrCode size={40} className="text-gray-700" />
                    <div className="text-left">
                        <p className="text-[8px] font-bold text-gray-600 uppercase">Verification ID</p>
                        <p className="text-[10px] font-mono text-gray-400">{id}</p>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
                <ShieldCheck size={12} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verified</span>
            </div>
        </div>

        <div className="p-6 bg-white/[0.02] space-y-6">
            <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock size={14} /> Issued {date}</span>
                <span className="flex items-center gap-1.5"><Globe size={14} /> Public Link</span>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2">
                    <Download size={16} /> PDF
                </button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2">
                    <Share2 size={16} /> LinkedIn
                </button>
            </div>
        </div>
    </motion.div>
);

export default function CertificatesPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <ShieldCheck size={32} className="text-indigo-500" />
                        Certificate Vault
                    </h1>
                    <p className="text-gray-400">Verifiable credentials for your achievements and roadmap completions.</p>
                </div>

                <div className="bg-indigo-600/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
                    <Trophy size={24} className="text-indigo-500" />
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Earned</p>
                        <p className="text-lg font-black text-white">4 Certificates</p>
                    </div>
                </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pt-8">
                <CertificateCard
                    id="tulasi-7821-ax92"
                    title="Frontend Optimization Expert"
                    date="Feb 24, 2026"
                    verified
                    delay={0.1}
                />
                <CertificateCard
                    id="tulasi-9102-bc32"
                    title="Neural RAG System Architect"
                    date="Jan 15, 2026"
                    verified
                    delay={0.2}
                />
                <CertificateCard
                    id="tulasi-4512-kd82"
                    title="Deep Learning Foundation"
                    date="Dec 12, 2025"
                    verified
                    delay={0.3}
                />

                {/* Empty State / Locked State Placeholder */}
                <div className="glass-panel border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center p-12 opacity-40">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 mb-6">
                        <Sparkles size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-500 mb-2">Cloud Infrastructure Mastery</h4>
                    <p className="text-xs text-gray-600 max-w-xs mb-6">Complete the Roadmap to unlock this certificate and its public verification URL.</p>
                    <button className="bg-white/5 border border-white/10 text-gray-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Current Progress: 65%</button>
                </div>
            </div>

            {/* Verification Helper */}
            <div className="max-w-4xl mx-auto glass-panel p-10 mt-12 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-indigo-600/10 to-transparent">
                <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-black flex items-center gap-3">
                        <Globe size={24} className="text-indigo-500" />
                        Verify a Certificate
                    </h3>
                    <p className="text-sm text-gray-400">Employers and institutions can verify the authenticity of a TulasiAI certificate by entering the unique verification ID below.</p>
                    <div className="flex gap-4">
                        <input type="text" placeholder="e.g. tulasi-XXXX-XXXX" className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex-1 outline-none focus:border-indigo-500/50 transition-all font-mono text-xs uppercase" />
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all">Verify Now</button>
                    </div>
                </div>
                <div className="hidden lg:block">
                    <QrCode size={120} className="text-white opacity-20" />
                </div>
            </div>
        </div>
    );
}
