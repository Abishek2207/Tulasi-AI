import React, { useState, useRef, useEffect } from 'react';
import { Bot, BookOpen, Compass, LayoutDashboard, Users, Trophy, PlayCircle, Settings as SettingsIcon, Menu, X, Code2, Search, Bell, Sparkles, TrendingUp, Send, Paperclip, Briefcase, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';
import './App.css';
import './Chat.css';
import MockInterview from './components/MockInterview';
import Roadmap from './components/Roadmap';
import Shorts from './components/Shorts';
import Collab from './components/Collab';
import ResumeBuilder from './components/ResumeBuilder';
import CodeLab from './components/CodeLab';
import YouTubeSummarizer from './components/YouTubeSummarizer';
import Rewards from './components/Rewards';
import Settings from './components/Settings';
import Auth from './components/Auth';
// Bypassing supabase import

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    formData.append('user_id', user?.email || 'guest_user');

    try {
      const response = await axios.post('http://localhost:8000/api/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        text: response.data.status
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Check initial session (Bypassed for local testing without Supabase account)
    setUser({
      name: 'Demo Student',
      email: 'demo@tulasiai.com',
      avatar: '',
      provider: 'email',
      linkedAccounts: ['email']
    });
    setIsAuthLoading(false);

    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   if (session) {
    //     setUser({
    //       name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
    //       email: session.user.email,
    //       avatar: session.user.user_metadata.avatar_url,
    //       provider: session.user.app_metadata.provider,
    //       linkedAccounts: [session.user.app_metadata.provider]
    //     });
    //   }
    //   setIsAuthLoading(false);
    // });

    // Listen for changes
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    //   if (session) {
    //     setUser({
    //       name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
    //       email: session.user.email,
    //       avatar: session.user.user_metadata.avatar_url,
    //       provider: session.user.app_metadata.provider,
    //       linkedAccounts: [session.user.app_metadata.provider]
    //     });
    //   } else {
    //     setUser(null);
    //   }
    //   setIsAuthLoading(false);
    // });

    // return () => subscription.unsubscribe();
  }, []);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am TulasiAI. How can I assist with your studies or interview prep today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={22} /> },
    { id: 'chat', label: 'Tutor AI', icon: <Sparkles size={22} /> },
    { id: 'interview', label: 'Interviews', icon: <Briefcase size={22} /> },
    { id: 'groups', label: 'Collab', icon: <Users size={22} /> },
    { id: 'resume', label: 'Resume', icon: <FileText size={22} /> },
    { id: 'leetcode', label: 'Code Lab', icon: <Code2 size={22} /> },
    { id: 'youtube', label: 'Summarizer', icon: <PlayCircle size={22} /> },
    { id: 'reels', label: 'Shorts', icon: <Bot size={22} /> },
    { id: 'streaks', label: 'Rewards', icon: <Trophy size={22} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={22} /> },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

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
    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setIsListening(false);
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setChatInput((prev: string) => prev + (prev ? ' ' : '') + transcript);
    };
  }

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newUserMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput };
    setMessages((prev: ChatMessage[]) => [...prev, newUserMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: newUserMsg.text,
        user_id: "demo_student"
      });

      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.data.response
      };
      setMessages((prev: ChatMessage[]) => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Error communicating with AI Backend:", error);
      setMessages((prev: ChatMessage[]) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, I couldn't reach my neural network. Make sure you run `uvicorn main:app --reload` on port 8000 in your backend folder!"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-1)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px', margin: '0 auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Initializing TulasiAI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <div className="mesh-bg"></div>

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <Bot size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <h2>TulasiAI</h2>
          </div>
          <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* The sidebar-footer with the manual Settings link is removed as per instruction */}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass-panel animate-fade-in stagger-1">
          <div className={`search-bar glass-panel ${isSearchFocused ? 'focused' : ''}`}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search concepts, leetcode problems, or roadmaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {searchQuery && isSearchFocused && (
              <div className="search-results glass-panel">
                {filteredNavItems.map(item => (
                  <div
                    key={item.id}
                    className="search-result-item"
                    onClick={() => {
                      setActiveTab(item.id);
                      setSearchQuery('');
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
                {filteredNavItems.length === 0 && (
                  <div className="search-result-item no-results">No features found</div>
                )}
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>En</button>
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <div className="profile-info" style={{ textAlign: 'right', marginRight: '12px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user?.name || 'Student User'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.email || 'Premium Plan'}</div>
            </div>
            <div className="profile-avatar">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4f46e5&color=fff&bold=true`} alt="Profile" />
            </div>
          </div>
        </header>

        <div className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'dashboard' && (
            <>
              <div className="welcome-banner glass-panel animate-fade-in stagger-2">
                <div className="banner-content">
                  <div className="banner-tag">Premium Learning Assistant</div>
                  <h1>Master any skill with TulasiAI</h1>
                  <p>Your intelligent, personalized ecosystem for learning, coding, and career preparation. Upload a curriculum or start a mock interview below.</p>
                  <div className="banner-actions">
                    <button className="btn-primary" onClick={() => setActiveTab('chat')}>
                      <Sparkles size={18} /> Start RAG Session
                    </button>
                    <button className="btn-secondary">
                      <Compass size={18} /> View Roadmap
                    </button>
                  </div>
                </div>
                <div className="banner-illustration">
                  <div className="robot-container">
                    <div className="robot-glow"></div>
                    <Bot size={150} color="#fff" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="glass-panel stat-card animate-fade-in stagger-3">
                  <div className="stat-header">
                    <h3>Focus Streak</h3>
                    <div className="icon-box" style={{ color: 'var(--warning)' }}>
                      <Trophy size={24} />
                    </div>
                  </div>
                  <div className="stat-value">
                    12 <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Days</span>
                    <span className="stat-trend"><TrendingUp size={14} style={{ marginRight: '4px', display: 'inline' }} />+2</span>
                  </div>
                </div>

                <div className="glass-panel stat-card animate-fade-in stagger-4">
                  <div className="stat-header">
                    <h3>Problems Solved</h3>
                    <div className="icon-box" style={{ color: 'var(--success)' }}>
                      <Code2 size={24} />
                    </div>
                  </div>
                  <div className="stat-value">
                    45 <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>/150</span>
                    <span className="stat-trend"><TrendingUp size={14} style={{ marginRight: '4px', display: 'inline' }} />Top 15%</span>
                  </div>
                </div>

                <div className="glass-panel stat-card animate-fade-in stagger-5">
                  <div className="stat-header">
                    <h3>Documents Indexed</h3>
                    <div className="icon-box" style={{ color: 'var(--accent-4)' }}>
                      <BookOpen size={24} />
                    </div>
                  </div>
                  <div className="stat-value">
                    28 <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>PDFs</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'chat' && (
            <div className="chat-interface glass-panel animate-fade-in stagger-2">
              <div className="chat-messages">
                {messages.map((msg: ChatMessage) => (
                  <div key={msg.id} className={`chat-bubble-container ${msg.sender === 'user' ? 'user-container' : 'ai-container'}`}>
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
                        S
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-bubble-container ai-container">
                    <div className="chat-avatar ai-avatar"><Bot size={18} /></div>
                    <div className="chat-bubble ai-bubble typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className={`attach-btn ${isUploading ? 'loading' : ''}`}
                  title="Upload PDF for RAG"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                </button>
                <button
                  type="button"
                  className={`attach-btn mic-btn ${isListening ? 'listening' : ''}`}
                  title="Voice Typing"
                  onClick={toggleListen}
                  style={{ color: isListening ? '#ef4444' : 'var(--text-secondary)' }}
                >
                  <div className={isListening ? 'mic-pulse' : ''}></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                  </svg>
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isUploading ? "Processing document..." : "Ask a question, upload a PDF, or start a mock interview..."}
                  className="chat-input-field"
                  disabled={isUploading}
                />
                <button type="submit" className="send-btn" disabled={!chatInput.trim() || isTyping || isUploading}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'interview' && <MockInterview />}
          {activeTab === 'roadmap' && <Roadmap />}
          {activeTab === 'reels' && <Shorts />}
          {activeTab === 'groups' && <Collab />}
          {activeTab === 'resume' && <ResumeBuilder />}
          {activeTab === 'leetcode' && <CodeLab />}
          {activeTab === 'youtube' && <YouTubeSummarizer />}
          {activeTab === 'streaks' && <Rewards />}
          {activeTab === 'settings' && <Settings user={user} />}

          {activeTab !== 'dashboard' && activeTab !== 'chat' && activeTab !== 'interview' && activeTab !== 'roadmap' && activeTab !== 'reels' && activeTab !== 'groups' && activeTab !== 'resume' && activeTab !== 'leetcode' && activeTab !== 'youtube' && activeTab !== 'streaks' && activeTab !== 'settings' && (
            <div className="glass-panel animate-fade-in stagger-2" style={{ padding: '80px 40px', textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <div className="robot-container" style={{ width: 100, height: 100, marginBottom: '30px' }}>
                <div className="robot-glow" style={{ opacity: 0.3 }}></div>
                <Bot size={100} color="var(--text-secondary)" strokeWidth={1} />
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {navItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '500px' }}>
                This intelligent module is currently being powered up. Upload specific content here soon to enhance your personalized learning experience!
              </p>
              <button className="btn-primary" style={{ marginTop: '30px' }} onClick={() => setActiveTab('dashboard')}>
                Return to Overview
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
