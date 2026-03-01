"use client";
import React, { useState } from 'react';
import {
    Play, Heart, MessageCircle, Share2,
    Bookmark, Music, Bot, Sparkles,
    ChevronDown, ChevronUp, Search, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReelCard = ({ title, author, description, tags, delay }: { title: string, author: string, description: string, tags: string[], delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay }}
        className="h-full w-full max-w-[450px] mx-auto glass-panel relative overflow-hidden group border-2 border-white/5"
    >
        {/* Video Placeholder */}
        <div className="absolute inset-0 z-0">
            <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=600"
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[10s] ease-linear"
                alt="Reel"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/40"></div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-20 h-20 rounded-full bg-indigo-600/40 backdrop-blur-md flex items-center justify-center border border-indigo-500/50">
                <Play size={40} fill="white" className="ml-1" />
            </div>
        </div>

        {/* UI Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 gap-6">
            <div className="flex justify-between items-end gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white/10 overflow-hidden shadow-lg shadow-indigo-600/20">
                            <img src={`https://ui-avatars.com/api/?name=${author}&background=4f46e5&color=fff`} alt="Avatar" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white hover:text-indigo-400 transition-colors cursor-pointer">{author}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={10} className="text-indigo-400" /> AI Educator</p>
                        </div>
                        <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Follow</button>
                    </div>

                    <h3 className="text-lg font-bold leading-tight line-clamp-2">{title}</h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-bold text-indigo-400 bg-indigo-600/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Right Actions Bar */}
                <div className="flex flex-col gap-6 items-center">
                    <div className="flex flex-col items-center gap-1 group/item cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 shadow-xl transition-all">
                            <Heart size={20} className="text-gray-400 group-hover/item:text-red-500 transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">12k</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 group/item cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500 shadow-xl transition-all">
                            <MessageCircle size={20} className="text-gray-400 group-hover/item:text-indigo-500 transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">450</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 group/item cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:border-indigo-500 shadow-xl transition-all">
                            <Share2 size={20} className="text-gray-400 group-hover/item:text-indigo-500 transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Share</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 group/item cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-yellow-500/20 hover:border-yellow-500 shadow-xl transition-all">
                            <Bookmark size={20} className="text-gray-400 group-hover/item:text-yellow-500 transition-colors" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Save</span>
                    </div>
                </div>
            </div>

            {/* Soundtrack */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                    <Music size={16} className="animate-spin-slow" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex gap-4 animate-scroll-text whitespace-nowrap text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span>Background Score • lo-fi beats for studying and focus • TulasiAI Original</span>
                        <span>Background Score • lo-fi beats for studying and focus • TulasiAI Original</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

export default function ReelsPage() {
    return (
        <div className="h-[calc(100vh-160px)] flex gap-12 justify-center items-center">
            {/* Main Reels Flow */}
            <div className="flex gap-12 items-center">
                <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500 transition-all">
                    <ChevronUp size={24} className="text-gray-500" />
                </button>

                <ReelCard
                    title="How Neural Networks actually see your data in high-dimensional vector space."
                    author="Dr. AI Tulasi"
                    description="Explaining vector embeddings and similarity search with visual examples."
                    tags={["DeepLearning", "RAG", "Explained"]}
                    delay={0.1}
                />

                <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500 transition-all">
                    <ChevronDown size={24} className="text-gray-500" />
                </button>
            </div>

            {/* Right Sidebar: Feed Filters */}
            <div className="hidden lg:flex flex-col gap-6 w-[300px]">
                <div className="glass-panel p-6 space-y-6">
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                        <Bot size={24} className="text-indigo-500" />
                        Smart Feed
                    </h2>
                    <div className="glass-panel px-4 py-2 flex items-center gap-2">
                        <Search size={16} className="text-gray-500" />
                        <input type="text" placeholder="Search reels..." className="bg-transparent border-none outline-none text-xs flex-1 py-1 text-gray-200" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Curated Channels</p>
                        {['System Design', 'React Masterclass', 'Python Core', 'AI Research'].map((cat, i) => (
                            <button key={i} className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-sm font-bold text-gray-400 hover:text-white flex items-center justify-between group">
                                {cat} <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                            </button>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-sm transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2">
                            <UserPlus size={18} /> Join Creators
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600/20 to-transparent">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Trending Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {['#NextJS15', '#Gemini1.5', '#PromptEng', '#CloudArch', '#SAAS'].map((tag, i) => (
                            <span key={i} className="text-[9px] font-bold text-white bg-white/5 px-2 py-1 rounded-md border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
