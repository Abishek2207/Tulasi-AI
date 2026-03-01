"use client";
import React, { useState } from 'react';
import {
    Users, Plus, MessageSquare, ShieldCheck,
    Share2, Info, Search, Send, Mic,
    Video, Hash, Bookmark, Trash2, Settings,
    Bot, Paperclip, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GroupItem = ({ name, members, isActive, delay }: { name: string, members: number, isActive: boolean, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
        className={`p-4 rounded-2xl cursor-pointer transition-all border group mb-2 flex items-center gap-4 ${isActive ? 'bg-indigo-600/10 border-indigo-500/30' : 'hover:bg-white/5 border-transparent'}`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-gray-700 transition-colors'}`}>
            <Users size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-indigo-400' : 'text-gray-200 group-hover:text-white'}`}>{name}</h4>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> {members} Active</p>
        </div>
        {isActive && <div className="p-1 px-2 bg-indigo-600 text-white rounded text-[8px] font-black uppercase tracking-widest">Live</div>}
    </motion.div>
);

const ChatMessage = ({ sender, text, time, isMe }: { sender: string, text: string, time: string, isMe?: boolean }) => (
    <div className={`flex w-full mb-6 gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isMe && (
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-white/5 shrink-0 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${sender}&background=4f46e5&color=fff`} alt="Av" />
            </div>
        )}
        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sender}</span>
                <span className="text-[8px] font-bold text-gray-700">{time}</span>
            </div>
            <div className={`p-4 px-5 rounded-[20px] text-sm leading-relaxed border ${isMe ? 'bg-indigo-600 text-white border-indigo-500/50 rounded-tr-none' : 'bg-gray-900 text-gray-300 border-white/5 rounded-tl-none shadow-xl'}`}>
                {text}
            </div>
        </div>
    </div>
);

export default function GroupsPage() {
    const [activeGroup, setActiveGroup] = useState('1');

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            {/* Sidebar list */}
            <div className="w-[320px] flex flex-col gap-6 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-3">
                        <Users size={24} className="text-indigo-500" />
                        Groups Hub
                    </h2>
                    <button className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-white">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="glass-panel px-4 py-2 flex items-center gap-2">
                    <Search size={18} className="text-gray-500" />
                    <input type="text" placeholder="Search my groups..." className="bg-transparent border-none outline-none text-xs flex-1 py-2 text-gray-200" />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <GroupItem name="Frontend Engineering 2026" members={142} isActive={activeGroup === '1'} delay={0.1} />
                    <GroupItem name="Deep Learning Research" members={86} isActive={activeGroup === '2'} delay={0.2} />
                    <GroupItem name="LeetCode 75 Mock Prep" members={24} isActive={activeGroup === '3'} delay={0.3} />
                    <GroupItem name="Stanford CS224N Collab" members={12} isActive={activeGroup === '4'} delay={0.4} />
                    <GroupItem name="Open Source Contributors" members={256} isActive={activeGroup === '5'} delay={0.5} />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden bg-gray-950/20 relative">
                {/* Chat Header */}
                <div className="p-6 h-20 border-b border-white/10 flex items-center justify-between bg-gray-950/40 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl flex items-center justify-center text-white">
                            <Users size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg">Frontend Engineering 2026</h3>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 142 Active Members</p>
                                <span className="h-3 w-[1px] bg-white/10"></span>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} /> Verified Academic Group</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-indigo-400">
                            <Video size={20} />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-500">
                            <Search size={20} />
                        </button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-500">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="text-center mb-10 relative">
                        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5 -z-10"></div>
                        <span className="bg-gray-950 px-6 py-1.5 rounded-full text-[9px] font-black text-gray-600 uppercase tracking-[4px] border border-white/5">Real-time Session Started</span>
                    </div>

                    <ChatMessage sender="System" text="Welcome back! Hope you had a productive study session. Check the pinned docs for the new Next.js patterns." time="09:00 AM" />
                    <ChatMessage sender="Anitha" text="Anyone wants to collaborate on the E-commerce Dashboard project? I'm using Framer Motion for transitions." time="10:15 AM" />
                    <ChatMessage sender="Admin" text="I've uploaded the new AI Knowledge Hub guide for the group modules." time="10:18 AM" isMe />
                    <ChatMessage sender="Rahul" text="Thanks! Looking into it now. The streak system is amazing btw." time="10:20 AM" />
                </div>

                {/* Input Controls */}
                <div className="p-6 bg-gray-950/40 border-t border-white/10">
                    <div className="max-w-4xl mx-auto flex items-end gap-4">
                        <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-indigo-400 transition-all border border-white/5">
                            <Paperclip size={20} />
                        </button>

                        <div className="flex-1 bg-gray-900 border border-white/5 rounded-[24px] focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all px-6 py-1 flex items-center gap-4">
                            <textarea
                                className="bg-transparent border-none outline-none flex-1 py-4 text-sm text-gray-200 resize-none max-h-32 no-scrollbar"
                                placeholder="Message Frontend Engineering 2026..."
                                rows={1}
                            />
                            <button className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"><Mic size={20} /></button>
                            <button className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors"><Bot size={20} /></button>
                        </div>

                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-5 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Group Info Sidebar */}
            <div className="hidden xl:flex w-[280px] flex-col gap-6 shrink-0">
                <div className="glass-panel p-6 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Pinned Announcements</h4>
                        <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-white font-bold text-xs"><Hash size={12} className="text-indigo-400" /> group-rules.pdf</div>
                            <p className="text-[10px] text-gray-500 leading-relaxed">Please follow the academic guidelines and maintain professional conduct in discussions.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Online Members</h4>
                        {[1, 2, 3, 4, 5].map((u) => (
                            <div key={u} className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs font-bold border border-white/5">
                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-950"></div>
                                    U{u}
                                </div>
                                <span className="text-xs font-bold text-gray-400">User {u}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 space-y-3">
                        <button className="w-full flex items-center justify-between text-[10px] font-bold text-gray-500 hover:text-white transition-all group">
                            LEAVE GROUP <Trash2 size={12} className="group-hover:text-red-500" />
                        </button>
                        <button className="w-full flex items-center justify-between text-[10px] font-bold text-gray-500 hover:text-white transition-all group">
                            NOTIFICATIONS <Settings size={12} className="group-hover:text-indigo-400" />
                        </button>
                    </div>
                </div>

                <div className="glass-panel p-6 bg-gradient-to-br from-indigo-600/20 to-transparent">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Shared Documents</h4>
                    <button className="w-full py-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Upload New</button>
                </div>
            </div>
        </div>
    );
}
