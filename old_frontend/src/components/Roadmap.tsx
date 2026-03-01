import React, { useState } from 'react';
import { Compass, BookOpen, Clock, CheckCircle2, Circle, ArrowRight, Play, Loader2 } from 'lucide-react';

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    duration: string;
    status: 'completed' | 'current' | 'upcoming';
    resources: string[];
}

const Roadmap: React.FC = () => {
    const [goal, setGoal] = useState('Full Stack Developer');
    const [level, setLevel] = useState('Beginner');
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);

    const generateRoadmap = async () => {
        setIsGenerating(true);
        // Simulate API Call for generation
        setTimeout(() => {
            setRoadmap([
                {
                    id: '1',
                    title: 'Internet Fundamentals',
                    description: 'Understand how the internet works, HTTP/HTTPS, DNS, and hosting.',
                    duration: '1 Week',
                    status: 'completed',
                    resources: ['MDN Web Docs: How the Web Works', 'Crash Course Computer Science: The Internet']
                },
                {
                    id: '2',
                    title: 'HTML & Advanced CSS',
                    description: 'Master semantic HTML, Flexbox, CSS Grid, and responsive design principles.',
                    duration: '3 Weeks',
                    status: 'current',
                    resources: ['CSS Tricks: A Complete Guide to Flexbox', 'Frontend Mentor Challenges']
                },
                {
                    id: '3',
                    title: 'JavaScript Deep Dive',
                    description: 'Learn ES6+, Closures, Promises, Async/Await, and DOM manipulation.',
                    duration: '4 Weeks',
                    status: 'upcoming',
                    resources: ['Eloquent JavaScript', 'JavaScript30 by Wes Bos']
                },
                {
                    id: '4',
                    title: 'React.js & State Management',
                    description: 'Build SPAs using functional components, Hooks, and Redux/Zustand.',
                    duration: '4 Weeks',
                    status: 'upcoming',
                    resources: ['React Official Documentation', 'UI.dev React Course']
                },
                {
                    id: '5',
                    title: 'Backend with Node & Express',
                    description: 'Create RESTful APIs, understand middleware, and handle authentication.',
                    duration: '3 Weeks',
                    status: 'upcoming',
                    resources: ['Node.js Design Patterns', 'Maximilian Schwarzmüller Node Course']
                }
            ]);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div style={{ flex: 1, padding: '20px 40px', overflowY: 'auto' }}>
            <div className="glass-panel animate-fade-in" style={{ padding: '40px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div className="icon-box" style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-4)' }}>
                        <Compass size={30} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>AI Career Pathways</h2>
                        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0', fontSize: '1.1rem' }}>Generate a personalized, step-by-step learning roadmap tailored to your specific career goals.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>Target Role / Goal</label>
                        <input
                            type="text"
                            className="input-field"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="e.g. Data Scientist, Cloud Architect"
                            style={{ background: 'rgba(255,255,255,0.03)' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>Current Level</label>
                        <select
                            className="input-field"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.03)', appearance: 'none' }}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={generateRoadmap}
                        disabled={isGenerating}
                        style={{ padding: '14px 32px', height: '52px', background: 'linear-gradient(135deg, var(--accent-4), #3b82f6)' }}
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <><Play size={20} /> Generate</>}
                    </button>
                </div>
            </div>

            {roadmap && (
                <div className="animate-fade-in stagger-2" style={{ position: 'relative', paddingLeft: '30px', maxWidth: '900px', margin: '0 auto' }}>
                    {/* Vertical Line */}
                    <div style={{ position: 'absolute', left: '45px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(180deg, var(--accent-1) 0%, var(--border-color) 100%)', zIndex: 0 }}></div>

                    {roadmap.map((step, index) => (
                        <div key={step.id} style={{ display: 'flex', gap: '30px', marginBottom: '40px', position: 'relative', zIndex: 1, opacity: 0, animation: `slideUpFade 0.5s ease forwards ${index * 0.15}s` }}>

                            {/* Timeline Indicator */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30px', flexShrink: 0 }}>
                                {step.status === 'completed' && <CheckCircle2 size={32} color="var(--success)" fill="rgba(16, 185, 129, 0.2)" />}
                                {step.status === 'current' && <Circle size={32} color="var(--accent-4)" fill="var(--bg-card)" strokeWidth={3} className="animate-pulse" />}
                                {step.status === 'upcoming' && <Circle size={32} color="var(--text-secondary)" fill="var(--bg-main)" />}
                            </div>

                            {/* Step Card */}
                            <div className="glass-panel" style={{ flex: 1, padding: '24px', borderLeft: step.status === 'current' ? '4px solid var(--accent-4)' : '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: step.status === 'upcoming' ? 'var(--text-secondary)' : '#fff', margin: 0 }}>
                                        <span style={{ color: 'var(--accent-4)', marginRight: '8px' }}>{(index + 1).toString().padStart(2, '0')}.</span>
                                        {step.title}
                                    </h3>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '12px' }}>
                                        <Clock size={14} /> {step.duration}
                                    </span>
                                </div>

                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>{step.description}</p>

                                <div>
                                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <BookOpen size={16} /> Recommended Resources
                                    </h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {step.resources.map((res, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#cbd5e1' }}>
                                                <ArrowRight size={14} color="var(--accent-4)" /> {res}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {step.status === 'current' && (
                                    <button className="btn-secondary" style={{ marginTop: '24px', width: '100%', borderColor: 'rgba(6, 182, 212, 0.3)', color: 'var(--accent-4)' }}>
                                        Start Learning Module
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
};

export default Roadmap;
