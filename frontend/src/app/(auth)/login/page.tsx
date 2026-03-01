"use client";
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Mail, Lock, Eye, EyeOff, Github,
    Chrome, ArrowRight, Bot, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        setLoading(true);
        const { error: authError } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[450px] glass-panel p-10 relative z-10 border border-white/10 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Bot size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm font-medium">Continue your neural learning journey</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <div className="space-y-4 mb-8">
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading}
                        className="w-full bg-white text-gray-950 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all border border-transparent shadow-xl"
                    >
                        <Chrome size={18} /> Continue with Google
                    </button>
                    <button
                        onClick={() => handleOAuthLogin('github')}
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all border border-white/5 shadow-xl"
                    >
                        <Github size={18} /> Continue with GitHub
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[4px]">
                        <span className="bg-gray-900 px-4 text-gray-500">OR</span>
                    </div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                            <Link href="/forgot-password" className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-indigo-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-10 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Register Now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
