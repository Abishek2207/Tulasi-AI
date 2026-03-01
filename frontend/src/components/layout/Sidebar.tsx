"use client";
import React from 'react';
import {
    LayoutDashboard, Sparkles, Briefcase, Users, FileText,
    Code2, PlayCircle, BookOpen, GraduationCap, Flame, Zap, Target,
    LogOut, ChevronRight, X, Menu, Bot
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const Sidebar = () => {
    const { isSidebarOpen, toggleSidebar, user } = useAppStore();
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
        { id: 'chat', label: 'Tutor AI', icon: <Sparkles size={20} />, href: '/chatbot' },
        { id: 'interview', label: 'Interviews', icon: <Briefcase size={20} />, href: '/interview' },
        { id: 'groups', label: 'Collab Hub', icon: <Users size={20} />, href: '/groups' },
        { id: 'resume', label: 'Resume', icon: <FileText size={20} />, href: '/resume' },
        { id: 'leetcode', label: 'Code Lab', icon: <Code2 size={20} />, href: '/editor' },
        { id: 'notes', label: 'Lecture Notes', icon: <BookOpen size={20} />, href: '/notes' },
        { id: 'ai-hub', label: 'AI Knowledge', icon: <GraduationCap size={20} />, href: '/ai-hub' },
        { id: 'reels', label: 'Shorts', icon: <Bot size={20} />, href: '/reels' },
        { id: 'roadmap', label: 'Roadmap', icon: <Zap size={20} />, href: '/roadmap' },
        { id: 'hackathons', label: 'Hackathons', icon: <Target size={20} />, href: '/hackathons' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isSidebarOpen ? 280 : 88 }}
            className={`fixed left-0 top-0 h-screen glass-panel border-r border-white/10 z-50 ${isSidebarOpen ? 'w-[280px]' : 'w-[88px]'}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="flex flex-col h-full">
                <div className="sidebar-header flex items-center justify-between p-6">
                    <AnimatePresence mode='wait'>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="logo flex items-center gap-3"
                            >
                                <div className="logo-icon-wrapper bg-indigo-600 p-2 rounded-xl">
                                    <Bot size={22} color="#fff" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-white">TulasiAI</h2>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isSidebarOpen && (
                        <div className="logo-icon-wrapper bg-indigo-600 p-2 rounded-xl">
                            <Bot size={22} color="#fff" strokeWidth={2.5} />
                        </div>
                    )}

                    <button className="toggle-btn p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-500" onClick={toggleSidebar}>
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.id} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`nav-item flex items-center gap-4 p-3 rounded-xl transition-all mb-1 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 hover:text-white'}`}
                                    style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
                                >
                                    <div className="nav-icon min-w-[24px]">{item.icon}</div>
                                    {isSidebarOpen && <span className="nav-label font-bold text-sm tracking-tight">{item.label}</span>}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section: Profile & Logout */}
                <div className="sidebar-footer p-4 border-t border-white/10 bg-black/20">
                    {isSidebarOpen ? (
                        <div className="footer-content space-y-4">
                            <div className="xp-bar-container space-y-1.5 px-1">
                                <div className="flex justify-between text-[8px] text-gray-500 uppercase tracking-[2px] font-black">
                                    <span>Level {user?.level || 1}</span>
                                    <span>{user?.xp || 0} / 500 XP</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link href="/profile" className="user-profile flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors group">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 overflow-hidden border border-white/10 shrink-0">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`} alt="Avatar" />
                                    </div>
                                    <div className="user-info flex-1 min-w-0">
                                        <p className="text-sm font-black text-white truncate">{user?.name || 'Academic Scholar'}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">Pro Member</p>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 overflow-hidden border border-white/10 shadow-lg">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`} alt="Avatar" />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
