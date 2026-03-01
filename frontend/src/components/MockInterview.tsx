import React, { useState, useRef, useEffect } from 'react';
import { Bot, Play, CheckCircle, Mic, Send, Star } from 'lucide-react';
import axios from 'axios';
import '../Chat.css';

interface InterviewMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
}

const MockInterview: React.FC = () => {
    const [topic, setTopic] = useState('React.js');
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [isStarted, setIsStarted] = useState(false);

    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Voice Recognition State
    const [isListening, setIsListening] = useState(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };
    }

    const toggleListen = () => {
        if (isListening) recognition?.stop();
        else recognition?.start();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startInterview = async () => {
        setIsStarted(true);
        setIsLoading(true);
        const welcomeMsg: InterviewMessage = {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Welcome to your ${difficulty} level interview on ${topic}. Let's get started. Please wait for the first question...`
        };
        setMessages([welcomeMsg]);

        try {
            const response = await axios.post('http://localhost:8000/api/interview', {
                user_id: "demo_student",
                action: "start",
                topic: topic,
                difficulty: difficulty
            });

            setMessages([
                { id: (Date.now() + 1).toString(), sender: 'ai', text: response.data.response }
            ]);
        } catch (e) {
            setMessages([{ id: 'err', sender: 'ai', text: 'Failed to start interview. Ensure backend is running.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: InterviewMessage = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/interview', {
                user_id: "demo_student",
                action: "answer",
                answer: userMsg.text
            });

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: response.data.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { id: 'err2', sender: 'ai', text: 'Error connecting to backend.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isStarted) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '60px 40px', maxWidth: '800px', margin: '40px auto', textAlign: 'center', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div className="icon-box" style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(79, 70, 229, 0.15)', color: 'var(--accent-1)' }}>
                        <Star size={40} />
                    </div>
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>AI Mock Interview Evaluator</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px' }}>
                    Practice your technical interviews with an AI that evaluates your answers, provides ATS-friendly feedback, and assigns a score out of 10.
                </p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
                    <div style={{ textAlign: 'left', flex: 1, maxWidth: '300px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Topic / Domain</label>
                        <input
                            type="text"
                            className="input-field"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. React.js, Python, System Design"
                        />
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, maxWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Difficulty</label>
                        <select
                            className="input-field"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{ appearance: 'none' }}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <button className="btn-primary" onClick={startInterview} style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                    <Play size={20} /> Start Mock Interview
                </button>
            </div>
        );
    }

    return (
        <div className="chat-interface glass-panel animate-fade-in" style={{ height: 'calc(100vh - 120px)', marginTop: '0' }}>
            <div style={{ padding: '20px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={18} color="var(--success)" /> {topic} Interview
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Level: {difficulty}</span>
                </div>
                <button className="btn-secondary" onClick={() => setIsStarted(false)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    End Interview
                </button>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble-container ${msg.sender === 'user' ? 'user-container' : 'ai-container'}`}>
                        {msg.sender === 'ai' && (
                            <div className="chat-avatar ai-avatar">
                                <Bot size={18} />
                            </div>
                        )}
                        <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-bubble-container ai-container">
                        <div className="chat-avatar ai-avatar"><Bot size={18} /></div>
                        <div className="chat-bubble ai-bubble typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={submitAnswer}>
                <button
                    type="button"
                    className={`attach-btn mic-btn ${isListening ? 'listening' : ''}`}
                    title="Voice Answer"
                    onClick={toggleListen}
                    style={{ color: isListening ? '#ef4444' : 'var(--text-secondary)' }}
                >
                    <div className={isListening ? 'mic-pulse' : ''}></div>
                    <Mic size={20} />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Speak or type your answer here..."
                    className="chat-input-field"
                    disabled={isLoading}
                />
                <button type="submit" className="send-btn" disabled={!input.trim() || isLoading}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default MockInterview;
