"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Paperclip, Mic, Globe, Cpu, Languages, Download, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageBubble = ({ message, role, delay }: { message: string, role: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className={`flex w-full mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
        <div className={`flex gap-4 max-w-[80%] ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-indigo-400'}`}>
                {role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`p-5 rounded-2xl text-sm leading-relaxed shadow-xl border ${role === 'user' ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-50' : 'bg-gray-900 border-white/5 text-gray-300'}`}>
                <div dangerouslySetInnerHTML={{ __html: message }} />
                <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest border-t border-white/5 pt-2">
                    <span>{role === 'user' ? 'You' : 'Tulasi Assistant'}</span>
                    <span>12:45 PM</span>
                </div>
            </div>
        </div>
    </motion.div>
);

export default function ChatPage() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am Tulasi, your neural study assistant. How can I help you accelerate your learning today?' }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', text: input }]);
        setInput('');
        // AI Logic would go here
    };

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col glass-panel overflow-hidden">
            {/* Chat Top Bar */}
            <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between bg-gray-950/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-white">Neural Tutor v2.0</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Low Latency • Groq Powered</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all border border-white/5">
                        <Languages size={16} /> Tamil
                    </button>
                    <button className="p-2.5 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all border border-white/5">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar scroll-smooth bg-gray-950/20">
                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg.text} role={msg.role} delay={0.1} />
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gray-950/40 border-t border-white/10 relative">
                <div className="max-w-4xl mx-auto flex items-end gap-4">
                    <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-indigo-400 transition-all border border-white/5">
                        <Paperclip size={20} />
                    </button>

                    <div className="flex-1 bg-gray-900 border border-white/5 rounded-[24px] focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all px-6 py-1 flex items-center gap-4">
                        <textarea
                            className="bg-transparent border-none outline-none flex-1 py-4 text-sm text-gray-200 resize-none max-h-32 no-scrollbar"
                            placeholder="Ask anything or upload a lecture PDF..."
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        />
                        <button className="p-2 text-gray-500 hover:text-indigo-400 transition-colors"><Mic size={20} /></button>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`p-5 rounded-2xl transition-all shadow-xl active:scale-95 ${input.trim() ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                    >
                        <Send size={20} />
                    </button>
                </div>

                <div className="text-center mt-4 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        <Cpu size={12} /> Context Optimized
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        <Globe size={12} /> Bilingual Search
                    </div>
                </div>
            </div>
        </div>
    );
}
