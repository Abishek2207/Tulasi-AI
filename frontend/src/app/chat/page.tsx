'use client';

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { chatApi, ChatMsg } from "@/lib/api";

export default function ChatPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.accessToken;
  
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Hello! I am your AI Tutor. How can I assist you with your studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !token) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatApi.send(userMsg, sessionId || undefined, token);
      if (res.session_id && !sessionId) {
        setSessionId(res.session_id);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Failed to connect to backend.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col p-6 text-neutral-50 font-sans">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-neutral-950 font-bold">
            AI
          </div>
          <div>
            <h2 className="font-semibold text-lg">Tulasi AI Tutor</h2>
            <p className="text-xs text-neutral-400">Powered by Gemini & Llama 3</p>
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
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-neutral-800 text-neutral-200 rounded-tl-none whitespace-pre-wrap'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-neutral-800 text-neutral-400 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
        
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex gap-2">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={token ? "Ask me anything..." : "Please log in to chat..."} 
            disabled={!token || loading}
            className="flex-grow bg-neutral-800 border-none text-neutral-100 placeholder:text-neutral-500"
          />
          <Button 
            onClick={handleSend} 
            disabled={!token || loading || !input.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 disabled:opacity-50"
          >
            {loading ? "Thinking..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
