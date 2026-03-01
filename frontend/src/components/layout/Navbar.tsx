"use client";
import React, { useState } from 'react';
import { Search, Bell, Menu, User, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import LanguageToggle from '@/components/ui/LanguageToggle';

const Navbar = () => {
    const [isFocused, setIsFocused] = useState(false);
    const { user } = useAppStore();

    return (
        <nav className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-gray-950/20 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center gap-8 flex-1">
                <button className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-all">
                    <Menu size={20} />
                </button>

                <div className={`search-container flex items-center gap-3 bg-white/5 border transition-all duration-300 rounded-2xl px-4 py-2 w-full max-w-md ${isFocused ? 'border-indigo-500/50 ring-4 ring-indigo-500/10' : 'border-white/5'}`}>
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search AI modules, roadmaps, or notes..."
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="bg-transparent border-none outline-none text-sm flex-1 text-gray-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <LanguageToggle />

                <div className="h-8 w-[1px] bg-white/10"></div>

                <button className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <Bell size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-gray-950"></span>
                </button>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 pr-4 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg overflow-hidden border border-white/10">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`} alt="Av" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">{user?.name || 'Student'}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={10} className="text-indigo-400" /> {user?.xp || 0} XP</p>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
