import React, { useState } from 'react';
import { Youtube, Search, PlayCircle, FileText, Loader2, Sparkles, Clock, BookOpen } from 'lucide-react';

const YouTubeSummarizer: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const handleSummarize = () => {
        if (!url) return;
        setIsSummarizing(true);
        // Simulate API call
        setTimeout(() => {
            setSummary(`
        ### Key Takeaways from this Video:
        1. **React Server Components (RSC):** The video explains how RSC allows components to render on the server, reducing the bundle size sent to the client.
        2. **Streaming & Suspense:** Deep dive into how data can be streamed to the UI as it becomes available, improving the perceived performance.
        3. **Data Fetching Patterns:** Comparison between traditional Client-side fetching and the new Server-side paradigms.
        
        ### Action Items for Students:
        - Try converting a data-heavy component to a Server Component.
        - Implement Suspense boundaries for slow-loading data sections.
      `);
            setIsSummarizing(false);
        }, 2500);
    };

    return (
        <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div className="icon-box" style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                        <Youtube size={40} />
                    </div>
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>YouTube Video Summarizer</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
                    Paste any educational video URL and get an instant AI-powered summary, key points, and study notes.
                </p>

                <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Paste YouTube Link (e.g. https://youtube.com/watch?v=...)"
                            style={{ paddingLeft: '48px', height: '60px', fontSize: '1rem' }}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn-primary"
                        style={{ padding: '0 32px', height: '60px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
                        onClick={handleSummarize}
                        disabled={isSummarizing || !url}
                    >
                        {isSummarizing ? <Loader2 className="animate-spin" size={24} /> : 'Summarize Now'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flex: 1 }}>
                {/* Summary Content */}
                <div className="glass-panel" style={{ flex: 2, padding: '30px', minHeight: '400px', position: 'relative' }}>
                    {!summary && !isSummarizing && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            <PlayCircle size={60} style={{ marginBottom: '20px', opacity: 0.2 }} />
                            <p>Your AI summary will appear here after you paste a link.</p>
                        </div>
                    )}

                    {isSummarizing && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <Sparkles size={40} className="animate-pulse" style={{ marginBottom: '20px', color: 'var(--accent-1)' }} />
                            <p>TulasiAI is watching and analyzing the video...</p>
                        </div>
                    )}

                    {summary && !isSummarizing && (
                        <div className="animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Sparkles size={24} color="var(--accent-1)" /> Video Analysis
                                </h3>
                                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                    <FileText size={16} /> Export to Notes
                                </button>
                            </div>
                            <div
                                className="summary-body"
                                style={{ lineHeight: 1.8, color: '#ccd6f6' }}
                                dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br/>') }}
                            ></div>
                        </div>
                    )}
                </div>

                {/* Sidebar Help/History */}
                <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h4 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={18} color="var(--accent-4)" /> Recent Summaries
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem', cursor: 'pointer' }}>
                                Advanced GraphQL Patterns - [Summaried]
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.85rem', cursor: 'pointer' }}>
                                Microservices Architecture 101 - [Summaried]
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), transparent)' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BookOpen size={18} color="#ef4444" /> Learning Tip
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                            Combining video summaries with **Active Recall** (quiz yourself on these points) is the fastest way to master new technical subjects.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YouTubeSummarizer;
