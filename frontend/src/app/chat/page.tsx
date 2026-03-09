'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Tutor. How can I assist you with your studies today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    // Mock AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: 'This is a mock response from the Tulasi AI Model Router.' }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col p-6 text-neutral-50 font-sans">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-neutral-950 font-bold">
            AI
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Tutor</h2>
            <p className="text-xs text-neutral-400">Powered by LLaMa 3 & Gemini</p>
          </div>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-neutral-800 text-neutral-200 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..." 
            className="flex-grow bg-neutral-800 border-none text-neutral-100 placeholder:text-neutral-500"
          />
          <Button onClick={handleSend} className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
