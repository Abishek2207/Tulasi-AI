import React from 'react';
import { Trophy, Star, Flame, Target, Gift, Zap, Award, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';

const Rewards: React.FC = () => {
    const missions = [
        { id: 1, title: 'Morning Focus', description: 'Study for 45 mins before 10 AM', xp: '+150 XP', progress: 100, completed: true },
        { id: 2, title: 'LeetCode Master', description: 'Solve 2 Medium problems', xp: '+300 XP', progress: 50, completed: false },
        { id: 3, title: 'AI Guru', description: 'Interact with Tutor AI for 20 mins', xp: '+200 XP', progress: 80, completed: false },
    ];

    const badges = [
        { id: 1, name: 'First Steps', icon: <Star size={24} />, color: '#fbbf24', earned: true },
        { id: 2, name: 'Consistency King', icon: <Flame size={24} />, color: '#ef4444', earned: true },
        { id: 3, name: 'Problem Solver', icon: <Target size={24} />, color: '#3b82f6', earned: true },
        { id: 4, name: 'Early Bird', icon: <Zap size={24} />, color: '#8b5cf6', earned: false },
        { id: 5, name: 'Roadmap Pro', icon: <Award size={24} />, color: '#10b981', earned: false },
    ];

    return (
        <div className="rewards-container animate-fade-in" style={{
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            color: '#fff'
        }}>
            {/* Header Section */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', background: 'linear-gradient(to right, #fff, var(--accent-1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Your Achievements
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Keep the streak alive and unlock premium perks!</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Global Rank</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-2)' }}>#1,245</div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* Left Column: Streaks & XP */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Hero Streak Card */}
                    <div className="glass-panel" style={{
                        padding: '40px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                        borderRadius: '32px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '40px'
                    }}>
                        <div className="streak-fire" style={{
                            width: '120px',
                            height: '120px',
                            background: 'var(--warning)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            <Flame size={60} color="#fff" fill="#fff" />
                        </div>
                        <div style={{ zIndex: 2 }}>
                            <div style={{ fontSize: '4rem', fontWeight: '900', lineHeight: 1 }}>12</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--warning)' }}>Day Streak</div>
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                <TrendingUp size={18} /> +2 days from yesterday
                            </div>
                        </div>

                        {/* Decorative XP Bar */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', background: 'rgba(255,255,255,0.1)' }}>
                            <div style={{ width: '75%', height: '100%', background: 'linear-gradient(to right, var(--accent-1), var(--accent-2))' }}></div>
                        </div>
                    </div>

                    {/* Missions Section */}
                    <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Target size={24} color="var(--accent-1)" /> Daily Missions
                            </h2>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Resets in 4h 12m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {missions.map(mission => (
                                <div key={mission.id} style={{
                                    padding: '20px',
                                    borderRadius: '20px',
                                    background: 'rgba(255,255,255,0.03)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        {mission.completed ?
                                            <CheckCircle2 size={24} color="var(--success)" /> :
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-color)' }}></div>
                                        }
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{mission.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{mission.description}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--accent-2)', marginBottom: '8px' }}>{mission.xp}</div>
                                        <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                            <div style={{ width: `${mission.progress}%`, height: '100%', background: 'var(--accent-1)', borderRadius: '2px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Badges & Levels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Level Progress */}
                    <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Current Level</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-1)' }}>Lvl 24</div>
                        <div style={{ margin: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                <span>1,250 XP</span>
                                <span>2,000 XP</span>
                            </div>
                            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                                <div style={{ width: '62%', height: '100%', background: 'linear-gradient(to right, var(--accent-1), var(--accent-2))', borderRadius: '5px', boxShadow: '0 0 15px var(--accent-1)' }}></div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>750 XP until Level 25</p>
                    </div>

                    {/* Badge Collection */}
                    <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Trophy size={24} color="var(--warning)" /> Badge Vault
                            </h2>
                            <ChevronRight size={20} color="var(--text-secondary)" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '20px' }}>
                            {badges.map(badge => (
                                <div key={badge.id} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    opacity: badge.earned ? 1 : 0.3,
                                    filter: badge.earned ? 'none' : 'grayscale(1)'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '16px',
                                        background: `${badge.color}15`,
                                        border: `1px solid ${badge.color}30`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: badge.color
                                    }}>
                                        {badge.icon}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', textAlign: 'center', fontWeight: '500' }}>{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rewards Shop Promo */}
                    <div className="glass-panel" style={{
                        padding: '25px',
                        borderRadius: '24px',
                        background: 'linear-gradient(rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Gift size={28} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold' }}>Rewards Shop</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(16, 185, 129, 0.8)' }}>Redeem XP for premium themes</div>
                        </div>
                        <ChevronRight size={20} color="var(--success)" />
                    </div>
                </div>
            </div>

            <style>{`
                .rewards-container {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .glass-panel {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .glass-panel:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .streak-fire {
                    animation: pulse 2s infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
                }
            `}</style>
        </div>
    );
};

export default Rewards;
