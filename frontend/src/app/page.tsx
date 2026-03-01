"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bot, Code2, GraduationCap, LucideIcon, Sparkles, Zap, Users, ShieldCheck, Globe, Briefcase } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: LucideIcon, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="glass-panel p-8 group hover:border-indigo-500/30 transition-all duration-500 hover:transform hover:-translate-y-2"
  >
    <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-white tracking-tight">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

const LandingPage = () => {
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
            <span className="text-xl font-bold tracking-tight">TulasiAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#comparison" className="hover:text-white transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="bg-white text-gray-950 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95">Get Started</Link>
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
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">v2.0 is now live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent"
          >
            Master Any Skill <br />
            <span className="text-indigo-500">Accelerated by AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The intelligent student ecosystem that replaces fragmented study tools with a single, production-grade neural hub. Built for the modern learner.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="group bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/40 flex items-center gap-3 active:scale-95">
              Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="text-sm font-bold border border-white/10 px-10 py-5 rounded-2xl hover:bg-white/5 transition-all">
              Watch the Demo
            </a>
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="max-w-6xl mx-auto mt-24 relative"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] -z-10 rounded-full scale-90"></div>
          <div className="glass-panel p-2 rounded-[32px] overflow-hidden border-2 border-white/10">
            <img
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
              alt="Dashboard"
              className="rounded-[24px] w-full shadow-2xl opacity-80"
            />
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-6">Built for Excellence.</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every tool you need to learn faster, retain longer, and achieve your career goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Sparkles}
              title="Neural Tutor AI"
              description="Advanced RAG-powered tutor that understands your PDFs, notes, and specific course context in any language."
              delay={0.1}
            />
            <FeatureCard
              icon={Briefcase}
              title="AI Mock Interviews"
              description="Real-time voice and text interviews with industry-grade evaluation and ATS-ready feedback loops."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="Dynamic Roadmaps"
              description="Personalized learning paths generated per your goal, adjusting dynamically based on your actual progress."
              delay={0.3}
            />
            <FeatureCard
              icon={Users}
              title="Collab Study Hub"
              description="Real-time document sharing and group study with WebSocket connectivity and integrated AI."
              delay={0.4}
            />
            <FeatureCard
              icon={Code2}
              title="Ultimate Code Lab"
              description="Integrated development environment with real-time execution and deep LeetCode analytics."
              delay={0.5}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Certificate Vault"
              description="Earn blockchain-grade verifiable certificates upon completion of learning roadmaps."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Bot size={22} />
            </div>
            <span className="text-xl font-bold">TulasiAI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 TulasiAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
