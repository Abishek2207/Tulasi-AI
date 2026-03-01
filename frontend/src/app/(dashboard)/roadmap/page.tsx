"use client";
import React from 'react';
import {
    Map, Target, ArrowRight, CheckCircle2,
    Circle, Clock, Lock, Sparkles,
    ChevronRight, Zap, Trophy, Download,
    Bot, Rocket, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const RoadmapStep = ({ title, description, status, index }: { title: string, description: string, status: 'completed' | 'current' | 'locked', index: number }) => (
    <div className="relative pl-12 pb-12 group last:pb-0">
        {/* Connection Line */}
        <div className="absolute left-[20px] top-[24px] bottom-0 w-[2px] bg-white/5 group-last:hidden">
            <div className={`w-full h-full origin-top transition-transform duration-1000 ${status === 'completed' ? 'scale-y-100 bg-indigo-500' : 'scale-y-0'}`}></div>
        </div>

        {/* Step Indicator */}
        <div className="absolute left-0 top-0 mt-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${status === 'completed' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' :
                status === 'current' ? 'bg-gray-900 border-indigo-500 text-indigo-500 animate-pulse' :
                    'bg-gray-950 border-white/10 text-gray-600'
                }`}>
                {status === 'completed' ? <CheckCircle2 size={20} /> :
                    status === 'current' ? <Zap size={20} /> :
                        <Lock size={16} />}
            </div>
            <div className="absolute -top-1 -right-1 bg-gray-950 text-[8px] font-black w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                {index}
            </div>
        </div>

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className={`glass-panel p-6 border transition-all ${status === 'locked' ? 'opacity-50 grayscale' : 'hover:border-white/20'}`}
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 max-w-lg">{description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                        <Clock size={12} /> 12h Estimated
                    </span>
                    <button disabled={status === 'locked'} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${status === 'locked' ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                        }`}>
                        {status === 'completed' ? 'Review Content' : status === 'current' ? 'Start Module' : 'Locked'}
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
);

export default function RoadmapPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Roadmap Header */}
            <div className="glass-panel p-10 bg-gradient-to-br from-indigo-600/10 to-transparent flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12">
                    <Target size={240} className="text-indigo-500" />
                </div>

                <div className="flex-1 space-y-6 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                        <Sparkles size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Roadmap</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black leading-tight text-white uppercase tracking-tighter">Full Stack <br /><span className="text-indigo-500">Cloud Architecture</span></h1>
                    <p className="text-gray-400 max-w-xl">This AI-generated path is optimized for your goal of becoming a Senior Engineer at Google. It dynamically adjusts based on your performance in interviews and coding labs.</p>

                    <div className="flex flex-wrap gap-6 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-500 border border-white/10">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</p>
                                <p className="text-lg font-black text-white">65% DONE</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-orange-500 border border-white/10">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Next Step</p>
                                <p className="text-lg font-black text-white">Module 5</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-green-500 border border-white/10">
                                <Download size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Reward</p>
                                <button className="text-xs font-bold text-gray-400 hover:text-white transition-colors">Certificate</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-72 space-y-4">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3">
                        <Rocket size={20} /> Continue Journey
                    </button>
                    <button className="w-full border border-white/10 text-gray-400 hover:text-white py-4 rounded-2xl font-bold text-sm transition-all hover:bg-white/5">
                        Switch Learning Path
                    </button>
                </div>
            </div>

            {/* Steps Container */}
            <div className="max-w-5xl mx-auto py-12 px-6">
                <RoadmapStep
                    index={1}
                    title="Frontend Mastery & Optimization"
                    description="Deep dive into Next.js 14, React Server Components, and advanced rendering patterns for performance."
                    status="completed"
                />
                <RoadmapStep
                    index={2}
                    title="Scalable Serverless Backends"
                    description="Building distributed systems with FastAPI, Redis, and event-driven architecture using AWS Lambda."
                    status="completed"
                />
                <RoadmapStep
                    index={3}
                    title="The Neural Layer: RAG & LLMs"
                    description="Integrating advanced cognitive abilities into your apps using LangChain, VectorDBs, and Gemini 1.5."
                    status="completed"
                />
                <RoadmapStep
                    index={4}
                    title="Real-time Systems with WebSockets"
                    description="Implementing high-concurrency group study hubs and live collaboration tools with Socket.io."
                    status="current"
                />
                <RoadmapStep
                    index={5}
                    title="DevOps & Kubernetes Orchestration"
                    description="Mastering Docker, CI/CD pipelines, and high-availability deployments on Kubernetes clusters."
                    status="locked"
                />
                <RoadmapStep
                    index={6}
                    title="Final Capstone: Enterprise SaaS"
                    description="Build a production-grade, globally distributed education platform with full monitoring and analytics."
                    status="locked"
                />
            </div>

            {/* Certificate Teaser */}
            <div className="max-w-5xl mx-auto glass-panel p-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                        <Award size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold">Earn your Verify Token</h4>
                        <p className="text-sm text-gray-400">Upon completion, you'll receive a verifiable NFT-grade certificate of mastery.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                    Preview Certificate <ChevronRight size={18} />
                </div>
            </div>
        </div>
    );
}
