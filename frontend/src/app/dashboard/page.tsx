"use client";
import DashboardLayout from "@/components/DashboardLayout";
import { Sparkles, Compass, Bot, Trophy, TrendingUp, Code2, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="dashboard-wrapper"
            >
                <motion.div variants={itemVariants} className="welcome-banner glass-panel">
                    <div className="banner-content">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="banner-tag"
                        >
                            Advanced AI Ecosystem
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Experience TulasiAI <br /> <span style={{ color: 'var(--accent-4)' }}>Next Generation</span>
                        </motion.h1>
                        <p>Unlock premium AI capabilities with the new TulasiAI 14 engine. Your unified hub for intelligence and growth.</p>
                        <div className="banner-actions">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                onClick={() => router.push('/chat')}
                            >
                                <Sparkles size={18} /> Deep Learning Session
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-secondary"
                                onClick={() => router.push('/roadmap')}
                            >
                                <Compass size={18} /> Global Roadmap
                            </motion.button>
                        </div>
                    </div>
                    <div className="banner-illustration">
                        <div className="robot-container">
                            <div className="robot-glow"></div>
                            <Bot size={150} color="#fff" strokeWidth={1.5} />
                        </div>
                    </div>
                </motion.div>

                <div className="dashboard-grid">
                    {[
                        { title: 'Cognitive Streak', value: '15', label: 'Days', icon: <Trophy size={24} />, color: 'var(--warning)', trend: '+3' },
                        { title: 'Neural Challenges', value: '124', label: '/500', icon: <Code2 size={24} />, color: 'var(--success)', trend: 'Elite' },
                        { title: 'Knowledge Vector', value: '42', label: 'Nodes', icon: <BookOpen size={24} />, color: 'var(--accent-4)', trend: '' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="glass-panel stat-card"
                        >
                            <div className="stat-header">
                                <h3>{stat.title}</h3>
                                <div className="icon-box" style={{ color: stat.color }}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="stat-value">
                                {stat.value} <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{stat.label}</span>
                                {stat.trend && (
                                    <span className="stat-trend">
                                        <TrendingUp size={14} style={{ marginRight: '4px', display: 'inline' }} />
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
