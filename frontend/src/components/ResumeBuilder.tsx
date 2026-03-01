import React, { useState } from 'react';
import { FileText, Download, Award, ShieldCheck, Plus, Eye, Trash2, Edit3, Sparkles } from 'lucide-react';

interface Resume {
    id: string;
    name: string;
    lastEdited: string;
    score: number;
}

const ResumeBuilder: React.FC = () => {
    const [resumes] = useState<Resume[]>([
        { id: '1', name: 'Software Engineer Role', lastEdited: '2026-02-28', score: 85 },
        { id: '2', name: 'Product Management Prompt', lastEdited: '2026-02-25', score: 92 }
    ]);

    return (
        <div style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>

            {/* Header */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="icon-box" style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-2)' }}>
                        <FileText size={30} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>Resume & Certifications</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Build ATS-friendly resumes and store your achievements securely.</p>
                    </div>
                </div>
                <button className="btn-primary" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <Plus size={20} /> New Resume
                </button>
            </div>

            <div style={{ display: 'flex', gap: '30px', flex: 1 }}>

                {/* Resumes List */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        My Resumes <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: '20px' }}>{resumes.length}</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {resumes.map((resume) => (
                            <div key={resume.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px', background: resume.score > 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)', color: resume.score > 90 ? 'var(--success)' : 'var(--accent-1)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    ATS Score: {resume.score}%
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{resume.name}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Edited {resume.lastEdited}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                    <button title="Edit" className="icon-btn" style={{ width: '40px', height: '40px' }}><Edit3 size={18} /></button>
                                    <button title="Download PDF" className="icon-btn" style={{ width: '40px', height: '40px' }}><Download size={18} /></button>
                                    <button title="Delete" className="icon-btn" style={{ width: '40px', height: '40px' }}><Trash2 size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certificate Vault Sidebar */}
                <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Award size={22} color="var(--accent-2)" /> Certificate Vault
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <Plus size={24} color="var(--text-secondary)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Upload Certificate (PDF/PNG)</span>
                            </div>

                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShieldCheck size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Python Certification</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified via Google</div>
                                </div>
                                <Eye size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.1)', marginTop: '40px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                <Sparkles size={16} color="var(--accent-3)" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>AI Resume Optimizer</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Unlock professional AI suggestions to increase your ATS score by up to 40%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
