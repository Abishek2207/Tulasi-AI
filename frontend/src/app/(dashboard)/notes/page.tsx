"use client";
import React, { useState } from 'react';
import {
    BookOpen, Search, Plus, Save, Sparkles,
    Share2, Download, Trash2, Pin, Tag,
    ChevronRight, MoreVertical, Edit3, Wand2, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NoteListItem = ({ title, date, isActive, delay }: { title: string, date: string, isActive: boolean, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay }}
        className={`p-4 rounded-xl cursor-pointer transition-all border group ${isActive ? 'bg-indigo-600/10 border-indigo-500/30' : 'hover:bg-white/5 border-transparent'}`}
    >
        <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-indigo-400' : 'text-gray-200 group-hover:text-white'}`}>{title}</h4>
            <Pin size={12} className={isActive ? 'text-indigo-400' : 'text-gray-600'} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <span>{date}</span>
            <span className="flex items-center gap-1"><Tag size={10} /> Lecture</span>
        </div>
    </motion.div>
);

export default function NotesPage() {
    const [activeNote, setActiveNote] = useState('1');
    const [noteContent, setNoteContent] = useState('# Artificial Intelligence\n\n- Concept of RAG\n- Retrieval-Augmented Generation\n- Knowledge retrieval from vectors...');

    return (
        <div className="h-[calc(100vh-160px)] flex gap-8">
            {/* Sidebar list */}
            <div className="w-[300px] flex flex-col gap-6 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <BookOpen size={20} className="text-indigo-500" />
                        My Notes
                    </h2>
                    <button className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-white">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="glass-panel px-4 py-2 flex items-center gap-2">
                    <Search size={16} className="text-gray-500" />
                    <input type="text" placeholder="Search notes..." className="bg-transparent border-none outline-none text-xs flex-1 py-1 text-gray-200" />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    <NoteListItem title="Understanding RAG Architecture" date="Mar 01, 2026" isActive={activeNote === '1'} delay={0.1} />
                    <NoteListItem title="LeetCode 75 Roadmap Notes" date="Feb 28, 2026" isActive={activeNote === '2'} delay={0.2} />
                    <NoteListItem title="React 19 System Design" date="Feb 25, 2026" isActive={activeNote === '3'} delay={0.3} />
                    <NoteListItem title="AI Ethics & Bias Notes" date="Feb 22, 2026" isActive={activeNote === '4'} delay={0.4} />
                    <NoteListItem title="Python Scripting Basics" date="Feb 20, 2026" isActive={activeNote === '5'} delay={0.5} />
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
                {/* Editor Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gray-950/20">
                    <div className="flex items-center gap-6">
                        <div className="text-xs font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-md border border-white/5 uppercase tracking-widest">Saved to cloud</div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><Edit3 size={18} /></button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"><Share2 size={18} /></button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white/5 hover:bg-white/10 text-gray-200 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 transition-all">
                            <Download size={16} /> Export PDF
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>

                {/* AI Tools Bar */}
                <div className="px-6 py-3 border-b border-white/10 flex items-center gap-6 overflow-x-auto no-scrollbar">
                    <button className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest group">
                        <Sparkles size={14} className="group-hover:scale-125 transition-transform" /> AI Summarize
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest group">
                        <Wand2 size={14} className="group-hover:scale-125 transition-transform" /> Generate Flashcards
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-bold text-orange-400 hover:text-orange-300 uppercase tracking-widest group">
                        <Target size={14} className="group-hover:scale-125 transition-transform" /> Start Quiz
                    </button>
                </div>

                {/* Main Content Pane */}
                <div className="flex-1 flex overflow-hidden">
                    <textarea
                        className="flex-1 bg-transparent border-none outline-none p-8 font-mono text-gray-300 resize-none leading-relaxed transition-all focus:bg-white/[0.01]"
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Start typing your brilliance..."
                    />

                    {/* Right Panel: AI Summary / Hints */}
                    <div className="w-[300px] border-l border-white/10 p-6 space-y-8 bg-gray-950/40">
                        <div>
                            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">AI Quick Summary</h5>
                            <div className="text-xs text-gray-400 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">
                                "This lecture explores RAG architecture as a bridge between LLMs and vector-stored knowledge, allowing for dynamic, accurate information retrieval."
                            </div>
                        </div>

                        <div>
                            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Key Terms Identified</h5>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight">RAG</span>
                                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight">Vectors</span>
                                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight">LLM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
