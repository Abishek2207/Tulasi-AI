import React, { useState } from 'react';
import { Github, Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
// Supabase bypassed for offline access

interface AuthProps {
    // onLogin is handled globally via App.tsx bypassing
}

const Auth: React.FC<AuthProps> = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Mock authentication to bypass Supabase setup
            setTimeout(() => {
                alert('Mock Login Successful! Welcome to TulasiAI.');
                // Simulate a successful login state change by reloading to dashboard,
                // or just refreshing the page as the App.tsx might default to logged in 
                // if we bypass it there. We will definitely bypass it in App.tsx next.
                window.location.reload();
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            // setIsLoading(false);
        }
    };

    const socialLogin = async (provider: 'google' | 'github') => {
        setIsLoading(true);
        setError(null);
        // Mock social login
        setTimeout(() => {
            alert(`Mock ${provider} Login Successful!`);
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="auth-container animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color)',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '40px',
                borderRadius: '32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, var(--accent-1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    opacity: 0.2,
                    zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(to right, #fff, var(--accent-1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {isLogin ? 'Continue your learning journey' : 'Start your success story with TulasiAI'}
                        </p>
                    </header>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                        <button onClick={() => socialLogin('google')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '12px' }}>
                            <Chrome size={20} /> Continue with Google
                        </button>
                        <button onClick={() => socialLogin('github')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '12px' }}>
                            <Github size={20} /> Continue with GitHub
                        </button>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-wrapper">
                            <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="input-field"
                                style={{ paddingLeft: '50px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-wrapper">
                            <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                placeholder="Password"
                                className="input-field"
                                style={{ paddingLeft: '50px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }} disabled={isLoading}>
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                            {!isLoading && <ArrowRight size={18} style={{ marginLeft: '10px' }} />}
                        </button>
                    </form>

                    <footer style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ color: 'var(--accent-4)', fontWeight: '600', cursor: 'pointer' }}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Auth;
