"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Paperclip, Loader2, Sparkles, User, Mic } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import './Chat.css';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

export default function ChatPage() {
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'ai', text: 'Hello! I am your TulasiAI Advanced Tutor. How can I accelerate your learning journey today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF document.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', 'demo_student');

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const response = await axios.post(`${API_BASE_URL}/api/upload-document`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: response.data.status }]);
        } catch (error) {
            console.error('Error:', error);
            alert('Upload failed.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || isTyping || isUploading) return;

        const input = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: input }]);
        setIsTyping(true);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat`, { message: input, user_id: "demo_student" });
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: response.data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: 'err', sender: 'ai', text: "Neural link interrupted. Please verify backend connectivity." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="chat-interface glass-panel animate-fade-in">
                <div className="chat-messages">
                    <AnimatePresence mode='popLayout'>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`chat-bubble-container ${msg.sender === 'user' ? 'user-container' : 'ai-container'}`}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="chat-avatar ai-avatar">
                                        <Bot size={18} />
                                    </div>
                                )}
                                <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                                    {msg.text}
                                </div>
                                {msg.sender === 'user' && (
                                    <div className="chat-avatar user-avatar">
                                        <User size={18} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="chat-bubble-container ai-container"
                        >
                            <div className="chat-avatar ai-avatar">
                                <Sparkles size={16} className="animate-spin" />
                            </div>
                            <div className="chat-bubble ai-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <motion.form
                    layout
                    className="chat-input-area"
                    onSubmit={handleSendMessage}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" style={{ display: 'none' }} />

                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        className={`attach-btn ${isUploading ? 'loading' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        className="attach-btn mic-btn"
                    >
                        <Mic size={20} />
                    </motion.button>

                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={isUploading ? "Reading document..." : "Type your command..."}
                        className="chat-input-field"
                    />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="send-btn"
                        disabled={!chatInput.trim() || isTyping || isUploading}
                    >
                        <Send size={18} />
                    </motion.button>
                </motion.form>
            </div>
        </DashboardLayout>
    );
}
