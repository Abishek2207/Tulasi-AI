"use client";
import React, { useState } from 'react';
import { Bot, Youtube, Sparkles, BookOpen, ExternalLink, Play, Search, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const HubCard = ({ title, category, description, icon: Icon, delay }: { title: string, category: string, description: string, icon: any, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="glass-panel p-6 group hover:border-indigo-500/30 transition-all cursor-pointer"
    >
        <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">{category}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-2">{description}</p>
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all">
            Learn More <ExternalLink size={14} />
        </div>
    </motion.div>
);

export default function AIHubPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <div className="glass-panel p-10 bg-gradient-to-br from-indigo-600/10 to-transparent flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                        <Bot size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Library v2.4</span>
                    </div>
                    <h1 className="text-4xl font-black leading-tight">Neural Knowledge <br /><span className="text-indigo-500">Hub & Academy</span></h1>
                    <p className="text-gray-400 max-w-xl">Master the core concepts of Artificial Intelligence from LLMs to RAG and Autonomous Agents with our multilingual interactive hub.</p>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl w-full max-w-md">
                        <Search size={20} className="text-gray-500 ml-2" />
                        <input
                            type="text"
                            placeholder="Explain RAG in simple terms..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="bg-indigo-600 px-4 py-2 rounded-xl font-bold text-xs">Search</button>
                    </div>
                </div>
                <div className="hidden lg:block relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full"></div>
                    <GraduationCap size={180} className="text-indigo-500/50 relative z-10" />
                </div>
            </div>

            {/* Hub Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <HubCard
                    title="Introduction to LLMs"
                    category="Basics"
                    description="How Large Language Models work, tokenization, and transformer architecture explained simply."
                    icon={Bot}
                    delay={0.1}
                />
                <HubCard
                    title="Understanding RAG"
                    category="Architecture"
                    description="How Retrieval-Augmented Generation bridges the gap between static LLMs and dynamic real-world data."
                    icon={DatabaseIcon}
                    delay={0.2}
                />
                <HubCard
                    title="LangChain & Frameworks"
                    category="Tools"
                    description="Build autonomous agents and complex neural workflows using the world's most popular AI framework."
                    icon={Sparkles}
                    delay={0.3}
                />
                <HubCard
                    title="Vector Databases"
                    category="Infrastructure"
                    description="High-dimensional storage and retrieval using PostgreSQL pgvector and Pinecone."
                    icon={CpuIcon}
                    delay={0.4}
                />
                <HubCard
                    title="The Age of Agents"
                    category="Advanced"
                    description="How AI agents plan, reason, and execute tasks on your behalf in a loop."
                    icon={ZapIcon}
                    delay={0.5}
                />
                <HubCard
                    title="Prompt Engineering"
                    category="Strategy"
                    description="Master the art of crafting system prompts and few-shot learning strategies."
                    icon={MessageSquareIcon}
                    delay={0.6}
                />
            </div>

            {/* Video Section */}
            <div className="space-y-6 pt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Youtube size={24} className="text-red-500" />
                        Featured Masterclasses
                    </h2>
                    <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">View All Hub Videos</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel mb-4">
                                <img src={`https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" alt="Video" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <Play size={20} fill="white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold">12:45</div>
                            </div>
                            <h4 className="font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">Building RAG apps from scratch</h4>
                            <p className="text-xs text-gray-500">1.2M views • 2 weeks ago</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Dummy Icons since they were imported but not provided in the snippet
const DatabaseIcon = ({ size, className }: any) => <Bot size={size} className={className} />;
const CpuIcon = ({ size, className }: any) => <Bot size={size} className={className} />;
const ZapIcon = ({ size, className }: any) => <Bot size={size} className={className} />;
const MessageSquareIcon = ({ size, className }: any) => <Bot size={size} className={className} />;
