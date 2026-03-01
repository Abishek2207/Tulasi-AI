"use client";
import React, { useState } from 'react';
import {
    Code2, Play, ChevronRight, Terminal,
    Settings, Share2, Save, Download,
    Zap, Trophy, AlertCircle, CheckCircle2,
    Database, Cpu, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditorPage() {
    const [activeTab, setActiveTab] = useState('problem');
    const [code, setCode] = useState('def solve():\n    # Start coding your solution here\n    print("Hello TulasiAI")\n\nsolve()');

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between glass-panel px-6 py-3">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg"><Code2 size={18} /></div>
                        <h2 className="font-bold">Code Lab</h2>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400">
                        <Database size={14} /> LeetCode #278
                        <ChevronRight size={14} /> Two Sum
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <select className="bg-white/5 border border-white/10 rounded-xl text-xs font-bold px-4 py-2 outline-none hover:bg-white/10 transition-all">
                        <option>Python 3.10</option>
                        <option>JavaScript ES6</option>
                        <option>Java 17</option>
                        <option>C++ 20</option>
                    </select>
                    <div className="h-6 w-[1px] bg-white/10"></div>
                    <button className="p-2 text-gray-400 hover:text-white transition-all"><Settings size={18} /></button>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Play size={16} fill="white" /> Run Code
                    </button>
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-green-600/20 active:scale-95">
                        <Zap size={16} fill="white" /> Submit
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Side: Problem & Output */}
                <div className="w-[450px] flex flex-col gap-6 shrink-0">
                    <div className="flex-1 glass-panel flex flex-col overflow-hidden">
                        <div className="flex p-1 bg-white/5 m-4 rounded-xl border border-white/5">
                            <button onClick={() => setActiveTab('problem')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'problem' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Problem Detail</button>
                            <button onClick={() => setActiveTab('solutions')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'solutions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Solutions</button>
                            <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>History</button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar prose prose-invert prose-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-black m-0">Two Sum</h3>
                                <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">Easy</span>
                            </div>
                            <p className="text-gray-400 mb-6">Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>
                            <h4 className="text-white font-bold mb-4">Example 1:</h4>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs space-y-2 mb-6 text-gray-300">
                                <div><span className="text-indigo-400">Input:</span> nums = [2,7,11,15], target = 9</div>
                                <div><span className="text-indigo-400">Output:</span> [0,1]</div>
                                <div><span className="text-indigo-400">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</div>
                            </div>
                            <h4 className="text-white font-bold mb-4">Constraints:</h4>
                            <ul className="text-gray-400 space-y-2">
                                <li>2 ≤ nums.length ≤ 10^4</li>
                                <li>-10^9 ≤ nums[i] ≤ 10^9</li>
                                <li>-10^9 ≤ target ≤ 10^9</li>
                            </ul>
                        </div>
                    </div>

                    <div className="h-[250px] glass-panel flex flex-col overflow-hidden bg-gray-950/40">
                        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Terminal size={14} /> Console Output
                            </h4>
                            <span className="text-[10px] font-bold text-green-500">Finished in 24ms</span>
                        </div>
                        <div className="flex-1 p-6 font-mono text-xs space-y-2 overflow-y-auto no-scrollbar">
                            <div className="text-gray-500">Initializing environment...</div>
                            <div className="text-gray-500">Compiling with Python 3.10...</div>
                            <div className="text-white font-bold">Hello TulasiAI</div>
                            <div className="text-indigo-400 border-t border-white/5 pt-2 mt-4">Program exited with code 0.</div>
                        </div>
                    </div>
                </div>

                {/* Main: IDE */}
                <div className="flex-1 glass-panel flex flex-col overflow-hidden bg-[#0a0a16]">
                    <div className="px-6 py-2 border-b border-white/5 flex items-center gap-6 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 p-2 border-b-2 border-indigo-500 shrink-0 uppercase tracking-widest">
                            <Cpu size={14} /> main.py
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 p-2 hover:text-gray-400 transition-all shrink-0 uppercase tracking-widest cursor-pointer">
                            utils.py
                        </div>
                    </div>
                    <div className="flex-1 p-0 flex">
                        <div className="w-12 bg-black/20 text-center py-6 font-mono text-[10px] text-gray-700 leading-relaxed select-none border-r border-white/5">
                            {Array.from({ length: 30 }).map((_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                        <textarea
                            className="flex-1 bg-transparent border-none outline-none p-6 font-mono text-sm text-gray-300 resize-none leading-relaxed transition-all focus:bg-white/[0.01]"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                    {/* IDE status bar */}
                    <div className="px-6 py-2 border-t border-white/5 bg-black/40 flex items-center justify-between text-[10px] font-bold text-gray-600">
                        <div className="flex items-center gap-4 uppercase tracking-tighter">
                            <span>Ln 4, Col 24</span>
                            <span>Spaces: 4</span>
                            <span>UTF-8</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-500">
                            <Sparkles size={12} /> AI Autocomplete Active
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
