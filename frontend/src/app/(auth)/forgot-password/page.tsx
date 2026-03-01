"use client";
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import {
    Mail, ArrowRight, Bot, Loader2,
    CheckCircle2, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClientComponentClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[450px] glass-panel p-10 relative z-10 border border-white/10 shadow-2xl"
            >
                <div className="mb-10 text-left">
                    <Link href="/login" className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white transition-colors uppercase tracking-[4px] mb-8 group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                    </Link>
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Bot size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Neural Reset</h1>
                    <p className="text-gray-400 text-sm font-medium">We'll help you reconnect to your dashboard</p>
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

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center text-green-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            If an account exists for <span className="text-white font-bold">{email}</span>, you will receive a password reset link shortly.
                        </p>
                        <button
                            onClick={() => {
                                setEmail('');
                                setSuccess(false);
                            }}
                            className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors"
                        >
                            Try another email?
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Email</label>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Send Reset Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
