"use client";
import React, { useState } from 'react';
import { Target, Calendar, ExternalLink, Bookmark, Clock, MapPin, Search, ChevronRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HackathonCard = ({ title, date, location, prize, tags, delay }: { title: string, date: string, location: string, prize: string, tags: string[], delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="glass-panel p-6 group hover:border-indigo-500/30 transition-all flex flex-col md:flex-row items-center gap-6"
    >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/20 group-hover:border-indigo-600/30 transition-all duration-500">
            <Calendar size={24} className="text-gray-400 group-hover:text-indigo-400" />
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {tags.map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">{tag}</span>
                ))}
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</h3>
            <div className="flex justify-center md:justify-start items-center gap-4 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Clock size={14} /> Ends {date}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} /> {location}</span>
                <span className="text-green-500 font-bold">{prize} Prize Pool</span>
            </div>
        </div>

        <div className="flex gap-3">
            <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                <Bookmark size={18} className="text-gray-400" />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
                Register <ExternalLink size={16} />
            </button>
        </div>
    </motion.div>
);

export default function HackathonsPage() {
    const [activeTab, setActiveTab] = useState('upcoming');

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Target size={32} className="text-indigo-500" />
                        Opportunity Hub
                    </h1>
                    <p className="text-gray-400">Track upcoming hackathons, internships, and global coding challenges.</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upcoming' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        My Bookmarks
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 glass-panel px-4 py-1 flex items-center gap-3">
                    <Search size={18} className="text-gray-500" />
                    <input type="text" placeholder="Filter by tech or city..." className="bg-transparent border-none outline-none flex-1 py-3 text-sm text-gray-200" />
                </div>
                <button className="glass-panel px-6 py-3 flex items-center gap-2 text-sm font-bold hover:bg-white/5 transition-all text-gray-400 hover:text-white">
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-6">
                <HackathonCard
                    title="Google Solution Challenge 2026"
                    date="April 30, 2026"
                    location="Global / Online"
                    tags={["Google", "SDGs", "Global"]}
                    prize="$50,000"
                    delay={0.1}
                />
                <HackathonCard
                    title="NASA Space Apps Challenge"
                    date="Oct 5, 2026"
                    location="Multiple Sites"
                    tags={["Space", "Data", "Open Source"]}
                    prize="Global Fame"
                    delay={0.2}
                />
                <HackathonCard
                    title="Hack India: Build for Bharat"
                    date="June 15, 2026"
                    location="New Delhi, IN"
                    tags={["Web3", "Scale", "India"]}
                    prize="₹10,00,000"
                    delay={0.3}
                />
                <HackathonCard
                    title="Hack India: Build for Bharat"
                    date="June 15, 2026"
                    location="New Delhi, IN"
                    tags={["Web3", "Scale", "India"]}
                    prize="₹10,00,000"
                    delay={0.4}
                />
            </div>

            {/* Pagination Placeholder */}
            <div className="flex justify-center pt-8">
                <button className="flex items-center gap-2 glass-panel px-8 py-3 text-sm font-bold hover:bg-white/5 transition-all group text-gray-400 hover:text-white">
                    Load More Opportunities <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
