import React, { useState, useEffect } from 'react';
import { Code2, ExternalLink, CheckCircle, TrendingUp, Cpu, Globe, Award, Zap, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    status: 'solved' | 'todo';
    link: string;
}

interface LeetCodeStats {
    problemsSolved: number;
    streak: number;
    rating: number;
    ranking: string;
}

const CodeLab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<LeetCodeStats>({
        problemsSolved: 0,
        streak: 0,
        rating: 0,
        ranking: 'Loading...'
    });
    const [problems] = useState<Problem[]>([
        { id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', status: 'solved', link: 'https://leetcode.com/problems/two-sum/' },
        { id: '2', title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', status: 'solved', link: 'https://leetcode.com/problems/add-two-numbers/' },
    ]);

    const fetchLeetCodeStats = async () => {
        setLoading(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.get(`${API_BASE_URL}/api/leetcode/stats/demo_user`);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching LeetCode stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeetCodeStats();
    }, []);

    return (
        <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="icon-box" style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                        <Code2 size={30} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>Code Lab</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Track your LeetCode progress and master data structures & algorithms.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={fetchLeetCodeStats} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sync LeetCode'}
                    </button>
                    <button className="btn-primary">Daily Challenge</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* Stats Cards */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.problemsSolved}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Problems Solved</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.streak} Days</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Streak</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Award size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.ranking}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Global Ranking</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
                {/* Problems List */}
                <div className="glass-panel" style={{ flex: 2, padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Recent Problems</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {problems.map((problem) => (
                            <div key={problem.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {problem.status === 'solved' ? <CheckCircle size={20} color="var(--success)" /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid var(--border-color)' }}></div>}
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{problem.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                                            <span>{problem.category}</span>
                                            <span style={{ color: problem.difficulty === 'Easy' ? 'var(--success)' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>{problem.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                                <a href={problem.link} className="icon-btn" style={{ width: '36px', height: '36px' }}><ExternalLink size={16} /></a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Sidebar */}
                <div className="glass-panel" style={{ width: '300px', padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Top Topics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Cpu size={18} color="var(--accent-1)" />
                                <span style={{ fontSize: '0.9rem' }}>Dynamic Programming</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>24%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Globe size={18} color="var(--accent-3)" />
                                <span style={{ fontSize: '0.9rem' }}>Graph Theory</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>18%</span>
                        </div>
                        {/* Add more topics as needed */}
                    </div>
                    <div style={{ marginTop: '40px', padding: '20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>Ready for a mock?</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Practice technical problems in an interview environment.</p>
                        <button className="btn-secondary" style={{ marginTop: '16px', width: '100%', fontSize: '0.85rem' }}>Start Coding Interview</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeLab;
