"use client";
import React from 'react';
import {
    LayoutDashboard, Sparkles, Briefcase, Users, FileText,
    Code2, PlayCircle, Bot, Trophy, Settings as SettingsIcon,
    X, Menu, BookOpen, GraduationCap, Flame, Zap, Target
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const Sidebar = () => {
    const { isSidebarOpen, toggleSidebar, user } = useAppStore();
    const pathname = usePathname();

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
        { id: 'chat', label: 'Tutor AI', icon: <Sparkles size={20} />, href: '/chat' },
        { id: 'interview', label: 'Interviews', icon: <Briefcase size={20} />, href: '/interview' },
        { id: 'groups', label: 'Collab', icon: <Users size={20} />, href: '/groups' },
        { id: 'resume', label: 'Resume', icon: <FileText size={20} />, href: '/resume' },
        { id: 'leetcode', label: 'Code Lab', icon: <Code2 size={20} />, href: '/editor' },
        { id: 'youtube', label: 'Summarizer', icon: <PlayCircle size={20} />, href: '/youtube' },
        { id: 'notes', label: 'Lecture Notes', icon: <BookOpen size={20} />, href: '/notes' },
        { id: 'ai-hub', label: 'AI Knowledge', icon: <GraduationCap size={20} />, href: '/ai-hub' },
        { id: 'reels', label: 'Shorts', icon: <Bot size={20} />, href: '/reels' },
        { id: 'hackathons', label: 'Hackathons', icon: <Target size={20} />, href: '/hackathons' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isSidebarOpen ? 280 : 88 }}
            className={`sidebar glass-panel h-screen border-r border-white/10 ${isSidebarOpen ? 'open' : 'closed'}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
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
                            <h2 className="text-xl font-bold tracking-tight">TulasiAI</h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isSidebarOpen && (
                    <div className="logo-icon-wrapper bg-indigo-600 p-2 rounded-xl">
                        <Bot size={22} color="#fff" strokeWidth={2.5} />
                    </div>
                )}

                <button className="toggle-btn p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={toggleSidebar}>
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.id} href={item.href}>
                            <motion.div
                                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.98 }}
                                className={`nav-item flex items-center gap-4 p-3 rounded-xl transition-all mb-2 ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
                            >
                                <div className="nav-icon min-w-[24px]">{item.icon}</div>
                                {isSidebarOpen && <span className="nav-label font-medium">{item.label}</span>}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section: Profile & Streak */}
            <div className="sidebar-footer p-4 border-t border-white/10">
                {isSidebarOpen ? (
                    <div className="footer-content space-y-4">
                        <div className="streak-badge flex items-center justify-between bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                            <div className="flex items-center gap-2">
                                <Flame size={18} className="text-orange-500" />
                                <span className="font-bold text-orange-500">{user?.streak || 0} Day Streak</span>
                            </div>
                            <Zap size={16} className="text-orange-400 animate-pulse" />
                        </div>

                        <div className="xp-bar-container space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                <span>Level {user?.level || 1}</span>
                                <span>{user?.xp || 0} XP</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(user?.xp || 0) % 100}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                />
                            </div>
                        </div>

                        <div className="user-profile flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-lg bg-indigo-600 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`} alt="Avatar" />
                            </div>
                            <div className="user-info flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{user?.name || 'Student'}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-tight truncate">{user?.plan || 'Free'} Plan</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <Flame size={20} className="text-orange-500" />
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`} alt="Avatar" />
                        </div>
                    </div>
                )}
            </div>
        </motion.aside>
    );
};

export default Sidebar;
