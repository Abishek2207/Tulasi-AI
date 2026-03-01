import React, { useState } from 'react';
import { Users, MessageSquare, Plus, Search, Video, FileText, Layout, UserPlus } from 'lucide-react';

interface StudyGroup {
    id: string;
    name: string;
    topic: string;
    members: number;
    lastActive: string;
    isPrivate: boolean;
    avatar: string;
}

const groupsData: StudyGroup[] = [
    {
        id: '1',
        name: 'Frontend Wizards',
        topic: 'React & Tailwind',
        members: 12,
        lastActive: '2m ago',
        isPrivate: false,
        avatar: 'https://ui-avatars.com/api/?name=FW&background=4f46e5&color=fff'
    },
    {
        id: '2',
        name: 'Algorithm Masters',
        topic: 'LeetCode Mediums',
        members: 8,
        lastActive: '15m ago',
        isPrivate: true,
        avatar: 'https://ui-avatars.com/api/?name=AM&background=ec4899&color=fff'
    },
    {
        id: '3',
        name: 'AI Ethicists',
        topic: 'NLP & Ethics',
        members: 5,
        lastActive: '1h ago',
        isPrivate: false,
        avatar: 'https://ui-avatars.com/api/?name=AE&background=8b5cf6&color=fff'
    }
];

const Collab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="collab-container animate-fade-in" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>

            {/* Header Section */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="icon-box" style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(79, 70, 229, 0.15)', color: 'var(--accent-1)' }}>
                        <Users size={30} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>Group Study Collab</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Study together, share notes, and solve problems in real-time with your peers.</p>
                    </div>
                </div>
                <button className="btn-primary" style={{ padding: '12px 24px' }}>
                    <Plus size={20} /> Create New Group
                </button>
            </div>

            <div style={{ display: 'flex', gap: '30px', flex: 1 }}>

                {/* Left: Active Groups List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Search size={20} color="var(--text-secondary)" />
                        <input
                            type="text"
                            placeholder="Search for study groups or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {groupsData.map((group) => (
                            <div key={group.id} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <img src={group.avatar} alt={group.name} style={{ width: '50px', height: '50px', borderRadius: '12px' }} />
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{group.name}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--accent-4)' }}>{group.topic}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{group.members} active members</div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Join</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Feature Preview / Info */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Collaboration Tools</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Real-time Chat</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Discuss with integrated AI help.</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Video size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Video Sessions</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>HD 1-on-1 and group calls.</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Shared Documents</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Collaborative PDF annotation.</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Whiteboard</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Visual mapping of concepts.</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), transparent)', border: '1px solid rgba(79,70,229,0.2)' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Pro Tip:</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>Invite friends to earns **Tulasi Credits** which can be used to unlock premium features and AI tokens.</p>
                            <button className="btn-secondary" style={{ marginTop: '16px', width: '100%', gap: '8px' }}>
                                <UserPlus size={16} /> Invite Friends
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default Collab;
