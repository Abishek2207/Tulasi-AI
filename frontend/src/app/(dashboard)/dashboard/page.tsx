"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
    Zap, Trophy, Target, Clock, MessageSquare,
    TrendingUp, Rocket, Flame, Star, Activity,
    Calendar, Users, BookOpen
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const data = [
    { name: 'Mon', xp: 400 },
    { name: 'Tue', xp: 1200 },
    { name: 'Wed', xp: 900 },
    { name: 'Thu', xp: 1800 },
    { name: 'Fri', xp: 1400 },
    { name: 'Sat', xp: 2100 },
    { name: 'Sun', xp: 2400 },
];

const radarData = [
    { subject: 'Coding', A: 120, fullMark: 150 },
    { subject: 'Concept', A: 98, fullMark: 150 },
    { subject: 'Groups', A: 86, fullMark: 150 },
    { subject: 'Interview', A: 99, fullMark: 150 },
    { subject: 'Roadmap', A: 85, fullMark: 150 },
    { subject: 'Notes', A: 65, fullMark: 150 },
];

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any, label: string, value: string, color: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-panel p-6 flex items-center gap-5 hover:border-white/20 transition-all group"
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`} style={{ backgroundColor: `${color}10`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-black text-white">{value}</h3>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header / XP Section */}
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-1 glass-panel p-8 bg-gradient-to-br from-indigo-600/20 to-transparent relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-2 leading-tight">Welcome back, <br /><span className="text-indigo-500">Tulasi Student!</span></h1>
                        <p className="text-gray-400 mb-8 max-w-md">You're in the top 5% of learners this week. Keep the momentum going to reach Level 15.</p>

                        <div className="flex flex-wrap gap-4">
                            <StatCard icon={Flame} label="Daily Streak" value="15 Days" color="#f97316" delay={0.1} />
                            <StatCard icon={Zap} label="Tulasi Points" value="12,450" color="#4f46e5" delay={0.2} />
                            <StatCard icon={Trophy} label="Rank" value="#142" color="#eab308" delay={0.3} />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[400px] glass-panel p-6 flex flex-col items-center justify-center text-center">
                    <div className="relative w-40 h-40 mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="132" className="text-indigo-500" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black">70%</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">To Next Level</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                        <Star size={16} className="text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-400 tracking-wider">LEVEL 14 ARCHMAGE</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Activity size={20} className="text-indigo-500" />
                                Growth Analytics
                            </h3>
                            <p className="text-xs text-gray-500">Your XP accumulation over the last 7 days</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-1.5 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 w-full">
                        <Rocket size={20} className="text-purple-500" />
                        Skill Radar
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#ffffff10" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <Radar name="Tulasi" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass-panel p-6 border-l-4 border-indigo-500">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <Calendar size={16} /> Upcoming Hackathon
                    </h4>
                    <p className="font-bold text-white mb-1">Google Solution Challenge</p>
                    <p className="text-xs text-indigo-400 font-bold mb-4 uppercase">Starts in 3 days</p>
                    <button className="w-full py-2 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">View Details</button>
                </div>

                <div className="glass-panel p-6 border-l-4 border-orange-500">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <Clock size={16} /> Roadmap Progress
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-white">Full Stack Dev</p>
                        <span className="text-xs font-bold text-orange-500">65%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-orange-500" style={{ width: '65%' }}></div>
                    </div>
                    <button className="w-full py-2 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-500 hover:text-white transition-all">Continue Journey</button>
                </div>

                <div className="glass-panel p-6 border-l-4 border-green-500">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <Users size={16} /> Collab Session
                    </h4>
                    <p className="font-bold text-white mb-1">Frontend Wizards</p>
                    <p className="text-xs text-green-400 font-bold mb-4 uppercase">12 members online</p>
                    <button className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500 hover:text-white transition-all">Join Room</button>
                </div>

                <div className="glass-panel p-6 border-l-4 border-purple-500">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <BookOpen size={16} /> Daily Resource
                    </h4>
                    <p className="font-bold text-white mb-1">Advanced React Patterns</p>
                    <p className="text-xs text-purple-400 font-bold mb-4 uppercase">8 min read</p>
                    <button className="w-full py-2 bg-purple-600/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-600 hover:text-white transition-all">Start Reading</button>
                </div>
            </div>
        </div>
    );
}
