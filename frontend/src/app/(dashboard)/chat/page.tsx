"use client";
import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Upload, Volume2 } from "lucide-react";

export default function ChatPage() {
    const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("question", input);
            formData.append("session_id", "session_123");
            formData.append("user_id", "user_id_here");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/message`, {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the backend. Please check if the server is running." }]);
        } finally {
            setLoading(false);
        }
    };

    const startVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (e: any) => {
            setInput(e.results[0][0].transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (e: any) => {
            console.error("Speech recognition error:", e);
            setIsListening(false);
        };

        recognitionRef.current.start();
        setIsListening(true);
    };

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950 text-white rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            {/* Header */}
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center font-bold">
                    T
                </div>
                <div>
                    <h1 className="font-bold text-lg">Tulasi AI Assistant</h1>
                    <p className="text-xs text-green-400">● Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === "user"
                                ? "bg-cyan-600 shadow-lg shadow-cyan-900/20"
                                : "bg-gray-800 border border-gray-700 shadow-lg shadow-black/20"
                            }`}>
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                {msg.content}
                            </pre>
                            {msg.role === "assistant" && (
                                <button
                                    onClick={() => speakText(msg.content)}
                                    className="mt-2 text-gray-400 hover:text-cyan-400 transition-colors"
                                >
                                    <Volume2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-4 rounded-2xl">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex gap-2 items-center max-w-4xl mx-auto">
                    <button
                        onClick={startVoice}
                        className={`p-3 rounded-full transition-all ${isListening ? "bg-red-500 animate-pulse" : "bg-gray-700 hover:bg-gray-600"}`}
                        title="Voice Input"
                    >
                        <Mic size={20} />
                    </button>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask anything... (Tamil, Hindi, English supported)"
                        className="flex-1 bg-gray-800 rounded-full px-4 py-3 text-sm outline-none border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
                    />
                    <button
                        onClick={sendMessage}
                        className="p-3 bg-cyan-600 rounded-full hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/40"
                        disabled={!input.trim() || loading}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
