"use client";
import React from 'react';
import { LayoutDashboard, Sparkles, Briefcase, Users, FileText, Code2, PlayCircle, Bot, Trophy, Settings as SettingsIcon, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const Sidebar = () => {
    const { isSidebarOpen, toggleSidebar } = useAppStore();
    const pathname = usePathname();

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
        { id: 'chat', label: 'Tutor AI', icon: <Sparkles size={20} />, href: '/chat' },
        { id: 'interview', label: 'Interviews', icon: <Briefcase size={20} />, href: '/interview' },
        { id: 'groups', label: 'Collab', icon: <Users size={20} />, href: '/group-study' },
        { id: 'resume', label: 'Resume', icon: <FileText size={20} />, href: '/resume' },
        { id: 'leetcode', label: 'Code Lab', icon: <Code2 size={20} />, href: '/coding' },
        { id: 'youtube', label: 'Summarizer', icon: <PlayCircle size={20} />, href: '/youtube' },
        { id: 'reels', label: 'Shorts', icon: <Bot size={20} />, href: '/reels' },
        { id: 'streaks', label: 'Rewards', icon: <Trophy size={20} />, href: '/streaks' },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} />, href: '/settings' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isSidebarOpen ? 280 : 88 }}
            className={`sidebar glass-panel ${isSidebarOpen ? 'open' : 'closed'}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="sidebar-header">
                <AnimatePresence mode='wait'>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="logo"
                        >
                            <div className="logo-icon-wrapper">
                                <Bot size={22} color="#fff" strokeWidth={2.5} />
                            </div>
                            <motion.h2>TulasiAI</motion.h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isSidebarOpen && (
                    <div className="logo-btn-placeholder" style={{ paddingLeft: '8px' }}>
                        <div className="logo-icon-wrapper" style={{ width: 36, height: 36 }}>
                            <Bot size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                    </div>
                )}

                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.id} href={item.href}>
                            <motion.div
                                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                whileTap={{ scale: 0.98 }}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="nav-label"
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>
        </motion.aside>
    );
};

export default Sidebar;
