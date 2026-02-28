import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Pause, Music2, User, Send, X, Instagram, CheckCircle2 } from 'lucide-react';

interface Reel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
    likes: string;
    comments: string;
    topic: string;
}

const reelsData: Reel[] = [
    {
        id: '1',
        videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
        author: '@hackathon_hustle',
        description: '3 Tips to win your first Hackathon! 🏆 Focus on MVP and Pitch. #hackathon #coding #tips',
        likes: '156k',
        comments: '1.4k',
        topic: 'Hackathons'
    },
    {
        id: '2',
        videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
        author: '@interview_ace',
        description: 'Crack the Google Coding Interview! How to explain your thought process. 🎯 #faang #interview #dsa',
        likes: '230k',
        comments: '3.2k',
        topic: 'Interviews'
    },
    {
        id: '3',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        author: '@skill_up_daily',
        description: 'Must-know Docker commands for 2024. 🐳 Level up your DevOps skills! #devops #docker #skills',
        likes: '92k',
        comments: '850',
        topic: 'Skills'
    }
];

const Shorts: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<'All' | 'Hackathons' | 'Interviews' | 'Skills'>('All');
    const filteredReels = selectedTopic === 'All' ? reelsData : reelsData.filter(r => r.topic === selectedTopic);

    const [activeReel, setActiveReel] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    const topics: ('All' | 'Hackathons' | 'Interviews' | 'Skills')[] = ['All', 'Hackathons', 'Interviews', 'Skills'];

    // Social Features State
    const [showChat, setShowChat] = useState(false);
    const [isLinked, setIsLinked] = useState(false);
    const [igHandle, setIgHandle] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [reelComments, setReelComments] = useState<{ [key: string]: string[] }>({
        '1': ['Great focus!', 'What playlist are you listening to?', 'Let\'s study together!'],
        '2': ['Simple and clear.', 'Need more on Nginx vs HAProxy.'],
        '3': ['Transformer models next please!', 'Amazing visuals.']
    });

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = () => {
        setActiveReel((prev: number) => (prev + 1) % filteredReels.length);
        setIsPlaying(true);
        setShowChat(false);
    };

    const handlePrev = () => {
        setActiveReel((prev: number) => (prev - 1 + filteredReels.length) % filteredReels.length);
        setIsPlaying(true);
        setShowChat(false);
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }, [activeReel]);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY > 0) handleNext();
        else if (e.deltaY < 0) handlePrev();
    };

    const postComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        const reelId = reelsData[activeReel].id;
        setReelComments(prev => ({
            ...prev,
            [reelId]: [...(prev[reelId] || []), commentInput]
        }));
        setCommentInput('');
    };

    const linkAccount = () => {
        if (igHandle.trim()) {
            setIsLinked(true);
        }
    };

    return (
        <div className="shorts-container animate-fade-in" onWheel={handleWheel} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden',
            cursor: 'ns-resize',
            position: 'relative'
        }}>

            {/* Topic Filter Chips */}
            <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
                {topics.map(t => (
                    <button
                        key={t}
                        onClick={() => { setSelectedTopic(t); setActiveReel(0); }}
                        className="glass-panel"
                        style={{
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            background: selectedTopic === t ? 'var(--accent-1)' : 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            border: '1px solid ' + (selectedTopic === t ? 'var(--accent-1)' : 'rgba(255,255,255,0.1)'),
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Account Linking Status (Top Left) */}
            <div className="glass-panel" style={{ position: 'absolute', top: '20px', left: '20px', padding: '12px 20px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isLinked ? (
                    <>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Instagram size={16} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{igHandle}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={10} /> Linked
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Instagram ID"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', color: '#fff', outline: 'none' }}
                            value={igHandle}
                            onChange={(e) => setIgHandle(e.target.value)}
                        />
                        <button onClick={linkAccount} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Link Account</button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                <div className="reels-player glass-panel" style={{
                    width: '380px',
                    height: 'calc(100vh - 140px)',
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: '#000',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    <video
                        ref={videoRef}
                        src={filteredReels[activeReel]?.videoUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        loop
                        onClick={togglePlay}
                        autoPlay
                        muted={isMuted}
                        playsInline
                    />

                    {/* Overlay Info */}
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        padding: '30px 20px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                        color: '#fff',
                        pointerEvents: 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', pointerEvents: 'auto' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={18} />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{filteredReels[activeReel]?.author}</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.8, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Study Expert</span>
                        </div>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', lineHeight: 1.4, pointerEvents: 'auto' }}>{filteredReels[activeReel]?.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                            <Music2 size={12} /> Focus Lo-fi - Study Beats
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div style={{
                        position: 'absolute',
                        right: '15px',
                        bottom: '120px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        alignItems: 'center'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <button className="reel-action-btn">
                                <Heart size={22} />
                            </button>
                            <span style={{ fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>{filteredReels[activeReel]?.likes}</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); setShowChat(!showChat); }} className={`reel-action-btn ${showChat ? 'active' : ''}`}>
                                <MessageCircle size={22} />
                            </button>
                            <span style={{ fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>{filteredReels[activeReel]?.comments}</span>
                        </div>
                        <button className="reel-action-btn">
                            <Share2 size={22} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="reel-action-btn"
                        >
                            {isMuted ? <Music2 size={22} style={{ opacity: 0.5 }} /> : <Music2 size={22} />}
                        </button>
                    </div>

                    {!isPlaying && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                            <Pause size={64} color="#fff" style={{ opacity: 0.5 }} />
                        </div>
                    )}

                    {/* Internal Navigation Controls */}
                    <div style={{ position: 'absolute', right: '15px', top: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="icon-btn" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="icon-btn" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                        </button>
                    </div>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="glass-panel animate-slide-in-right" style={{
                        width: '320px',
                        height: 'calc(100vh - 140px)',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '24px',
                        padding: '20px',
                        background: 'rgba(15, 23, 42, 0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Reel Discussion</h3>
                            <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px' }} className="custom-scrollbar">
                            {reelComments[reelsData[activeReel].id]?.map((c, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={12} />
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
                                        {c}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={postComment} style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <input
                                placeholder="Add a comment..."
                                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px 16px', fontSize: '0.85rem', color: '#fff', outline: 'none' }}
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                            />
                            <button type="submit" className="icon-btn" style={{ width: '40px', height: '40px' }}><Send size={18} /></button>
                        </form>
                    </div>
                )}
            </div>

            <style>{`
                .reel-action-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .reel-action-btn:hover {
                    background: rgba(255,255,255,0.2);
                    transform: scale(1.05);
                }
                .reel-action-btn.active {
                    background: var(--accent-1);
                    color: #fff;
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out;
                }
                @keyframes slideInRight {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Shorts;
