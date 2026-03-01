"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ArrowRight, Bot, Code2, GraduationCap,
  LucideIcon, Sparkles, Zap, Users,
  ShieldCheck, Globe, Briefcase, PlayCircle
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, href, delay }: { icon: LucideIcon, title: string, description: string, href: string, delay: number }) => (
  <Link href={href}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="glass-panel p-8 group hover:border-indigo-500/30 transition-all duration-500 hover:transform hover:-translate-y-2 h-full"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
  </Link>
);

const LandingPage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/10 blur-[120px] rounded-full animate-pulse-slow delay-700"></div>
        <div className="mesh-bg opacity-30"></div>
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-gray-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Bot size={22} color="#fff" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">TulasiAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="https://github.com/Abishek2207/Tulasi-AI" target="_blank" className="hover:text-white transition-colors">OS Repo</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8"
          >
            <Sparkles size={16} className="text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px]">Elite AI Ecosystem v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent uppercase"
          >
            Engineering the <br />
            <span className="text-indigo-500">Future of Learning.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            The intelligent student ecosystem that replaces fragmented study tools with a single, production-grade neural hub. Architected for speed, secured by Supabase.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="group bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[2px] transition-all shadow-xl shadow-indigo-600/40 flex items-center gap-3 active:scale-95">
              Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="group text-xs font-black uppercase tracking-[2px] border border-white/10 px-10 py-5 rounded-2xl hover:bg-white/5 transition-all flex items-center gap-3"
            >
              <PlayCircle size={20} className="text-indigo-500 group-hover:scale-110 transition-transform" /> Explore Features
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="max-w-6xl mx-auto mt-24 relative group"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full scale-90 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="glass-panel p-2 rounded-[40px] overflow-hidden border-2 border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
              alt="Dashboard Preview"
              className="rounded-[32px] w-full shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Built for Excellence.</h2>
            <div className="h-1.5 w-24 bg-indigo-600 mx-auto rounded-full"></div>
            <p className="text-gray-400 max-w-xl mx-auto text-sm font-bold uppercase tracking-widest">Every tool you need to learn faster and achieve your career goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Sparkles}
              title="Neural Tutor AI"
              href="/chatbot"
              description="Advanced RAG-powered tutor that understands your PDFs, notes, and specific course context in any language."
              delay={0.1}
            />
            <FeatureCard
              icon={Briefcase}
              title="AI Mock Interviews"
              href="/interview"
              description="Real-time voice and text interviews with industry-grade evaluation and ATS-ready feedback loops."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="Dynamic Roadmaps"
              href="/roadmap"
              description="Personalized learning paths generated per your goal, adjusting dynamically based on your actual progress."
              delay={0.3}
            />
            <FeatureCard
              icon={Users}
              title="Collab Hub"
              href="/groups"
              description="Real-time document sharing and group study with WebSocket connectivity and integrated AI."
              delay={0.4}
            />
            <FeatureCard
              icon={Code2}
              title="Ultimate Code Lab"
              href="/editor"
              description="Integrated development environment with real-time execution and deep LeetCode analytics."
              delay={0.5}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Certificate Vault"
              href="/certificates"
              description="Earn blockchain-grade verifiable certificates upon completion of learning roadmaps."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 pt-20 pb-10 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Bot size={22} color="#fff" />
            </div>
            <span className="text-xl font-black uppercase tracking-tight">TulasiAI</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[4px] text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[2px] text-gray-600">
            © 2026 Tulasi Ecosystems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
