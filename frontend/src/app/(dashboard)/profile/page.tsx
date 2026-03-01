"use client";
import React, { useState } from 'react';
import {
    User, Mail, Shield, ShieldCheck,
    Bell, Settings, LogOut, Camera,
    ChevronRight, Zap, Target, Flame,
    Globe, Lock, Layout, CreditCard,
    Bot, MoreHorizontal, Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const SettingItem = ({ icon: Icon, title, description, badge, delay }: { icon: any, title: string, description: string, badge?: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
        className="p-6 glass-panel flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer"
    >
        <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
                <Icon size={22} />
            </div>
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-black text-white">{title}</h4>
                    {badge && <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest">{badge}</span>}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </motion.div>
);

export default function ProfilePage() {
    const { user } = useAppStore();

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Profile Hero */}
            <div className="relative glass-panel p-12 overflow-hidden bg-gradient-to-br from-indigo-900/40 to-transparent flex flex-col md:flex-row items-center gap-12">
                <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 pointer-events-none">
                    <User size={280} className="text-indigo-500" />
                </div>

                <div className="relative group cursor-pointer group shrink-0">
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] bg-indigo-600 border-4 border-white/10 shadow-2xl overflow-hidden relative">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&size=512`} alt="Avatar" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={32} className="text-white" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-2xl border-4 border-gray-950 shadow-lg animate-pulse"></div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">{user?.name || 'Tulasi Student'}</h1>
                        <p className="text-indigo-400 font-bold uppercase tracking-[4px] text-xs flex items-center justify-center md:justify-start gap-2">
                            <ShieldCheck size={14} /> Elite Academic Scholar
                        </p>
                    </div>
                    <p className="text-gray-400 max-w-xl text-sm leading-relaxed">Full Stack Developer & AI Enthusiast from Chennai. Currently mastering Neural Cloud Architecture and Advanced RAG Systems on the TulasiAI Platform.</p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95">Edit Public Profile</button>
                        <button className="bg-white/5 border border-white/10 text-gray-400 hover:text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95">Share Profile</button>
                    </div>
                </div>

                <div className="w-full md:w-64 glass-panel p-6 bg-black/40 border border-white/10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20"><Flame size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Streak</p>
                            <p className="text-lg font-black text-white">{user?.streak || 0} Days</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20"><Zap size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total XP</p>
                            <p className="text-lg font-black text-white">{user?.xp || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20"><Target size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Accuracy</p>
                            <p className="text-lg font-black text-white">92.4%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 ml-2">
                        <Settings size={22} className="text-indigo-500" /> Account Configuration
                    </h3>
                    <div className="space-y-4">
                        <SettingItem icon={User} title="Personal Information" description="Update your name, bio, and student demographics." delay={0.1} />
                        <SettingItem icon={Mail} title="Email & Notifications" description="Manage your contact preferences and alert systems." delay={0.2} />
                        <SettingItem icon={Lock} title="Security & Privacy" description="Adjust password, 2FA, and data visibility settings." delay={0.3} badge="High Safety" />
                        <SettingItem icon={CreditCard} title="Billing & Subscription" description="Manage your Tulasi Pro membership and invoices." delay={0.4} />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 ml-2">
                        <Layout size={22} className="text-purple-500" /> Platform Preferences
                    </h3>
                    <div className="space-y-4">
                        <SettingItem icon={Globe} title="Language & Location" description="Set your preferred UI language and regional context." delay={0.5} />
                        <SettingItem icon={Bot} title="AI Assistant Personality" description="Customize how the neural tutor interacts with you." delay={0.6} badge="Beta" />
                        <SettingItem icon={Shield} title="Content Filtering" description="Safe search and educational resource guarding." delay={0.7} />
                        <SettingItem icon={LogOut} title="Terminate Sessions" description="Sign out from all active devices and portal sessions." delay={0.8} />
                    </div>
                </div>
            </div>

            {/* Bottom: Pro Upgrade Teaser */}
            <div className="glass-panel p-10 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center text-indigo-500 shadow-inner">
                        <Rocket size={40} className="animate-bounce-slow" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black">Level Up with Tulasi Pro</h4>
                        <p className="text-sm text-gray-400">Unlock unlimited RAG processing, senior-level mock interviews, and verifiable blockchain certificates.</p>
                    </div>
                </div>
                <button className="bg-white text-gray-950 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl">Upgrade Now</button>
            </div>
        </div>
    );
}
