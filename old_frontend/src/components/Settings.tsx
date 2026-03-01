import React, { useState } from 'react';
import { User, Shield, Globe, Bell, Moon, Sun, Key, Save, Camera, Mail, Github, LogOut, Chrome } from 'lucide-react';

interface SettingsProps {
    user: any;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [language, setLanguage] = useState('English');
    const [isDarkMode, setIsDarkMode] = useState(true);

    const sections = [
        { id: 'profile', label: 'Profile', icon: <User size={20} /> },
        { id: 'security', label: 'Security', icon: <Shield size={20} /> },
        { id: 'preferences', label: 'Preferences', icon: <Globe size={20} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    ];

    return (
        <div className="settings-container animate-fade-in" style={{
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            color: '#fff',
            height: 'calc(100vh - 120px)',
            display: 'flex',
            gap: '40px'
        }}>
            {/* Sidebar List */}
            <div className="glass-panel" style={{
                width: '280px',
                borderRadius: '24px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <h2 style={{ fontSize: '1.2rem', padding: '0 15px 15px 15px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>Settings</h2>
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 15px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeSection === section.id ? 'var(--accent-1)' : 'transparent',
                            color: activeSection === section.id ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                        }}
                    >
                        {section.icon}
                        <span style={{ fontWeight: activeSection === section.id ? '600' : '400' }}>{section.label}</span>
                    </button>
                ))}

                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 15px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                    }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="glass-panel custom-scrollbar" style={{
                flex: 1,
                borderRadius: '32px',
                padding: '40px',
                overflowY: 'auto'
            }}>

                {activeSection === 'profile' && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-1), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={50} color="#fff" />
                                </div>
                                <button style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-1)', border: '4px solid #0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Tulasi Student</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Free Plan • Joined Feb 2026</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input defaultValue="Tulasi Student" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Display Name</label>
                                <input defaultValue="tulasiai_ninja" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
                                <input defaultValue="student@tulsi.ai" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }} />
                            </div>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>University</label>
                                <input defaultValue="Global Tech University" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none' }} />
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '25px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ marginBottom: '15px' }}>Linked Accounts</h4>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: user?.linkedAccounts?.includes('GitHub') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                                    padding: '10px 15px',
                                    borderRadius: '12px',
                                    border: user?.linkedAccounts?.includes('GitHub') ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid transparent'
                                }}>
                                    <Github size={18} color={user?.linkedAccounts?.includes('GitHub') ? '#4ade80' : '#fff'} />
                                    <span style={{ fontSize: '0.9rem' }}>{user?.linkedAccounts?.includes('GitHub') ? 'GitHub Linked' : 'Connect GitHub'}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: user?.linkedAccounts?.includes('Google') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                                    padding: '10px 15px',
                                    borderRadius: '12px',
                                    border: user?.linkedAccounts?.includes('Google') ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid transparent'
                                }}>
                                    <Chrome size={18} color={user?.linkedAccounts?.includes('Google') ? '#4ade80' : '#fff'} />
                                    <span style={{ fontSize: '0.9rem' }}>{user?.linkedAccounts?.includes('Google') ? 'Google Linked' : 'Connect Google'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '12px' }}>
                                    <Mail size={18} />
                                    <span style={{ fontSize: '0.9rem' }}>{user?.email || 'student@tulsi.ai'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'preferences' && (
                    <div className="animate-fade-in">
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>App Preferences</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Interface Theme</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select how TulasiAI looks on your device</div>
                                </div>
                                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                                    <button onClick={() => setIsDarkMode(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: !isDarkMode ? 'var(--accent-1)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Sun size={16} /> Light
                                    </button>
                                    <button onClick={() => setIsDarkMode(true)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: isDarkMode ? 'var(--accent-1)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Moon size={16} /> Dark
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Primary Language</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI response and UI language preference</div>
                                </div>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 15px', color: '#fff', outline: 'none' }}
                                >
                                    <option value="English">English</option>
                                    <option value="Tamil">Tamil (தமிழ்)</option>
                                    <option value="Hindi">Hindi (हिंदी)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '30px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <Key size={20} color="var(--accent-1)" /> AI Configuration
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Enhance your tutor's intelligence by providing your own API keys (stored locally).</p>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem' }}>Gemini API Key</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input type="password" placeholder="sk-..." style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff' }} />
                                <button className="btn-primary" style={{ padding: '0 20px' }}>Apply</button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                    <button style={{ padding: '12px 25px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                    <button className="btn-primary" style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
