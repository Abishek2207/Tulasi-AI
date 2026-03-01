import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
        className="glass-panel p-6 flex items-center gap-5 hover:border-white/20 transition-all group lg:min-w-[200px]"
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`} style={{ backgroundColor: `${color}10`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-1">{label}</p>
            <h3 className="text-2xl font-black text-white leading-none">{value}</h3>
        </div>
    </motion.div>
);

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div className="space-y-8 pb-10">
            {/* Header / XP Section */}
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <div className="flex-1 glass-panel p-8 bg-gradient-to-br from-indigo-600/20 to-transparent relative overflow-hidden border border-white/10">
                    <div className="relative z-10">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight uppercase tracking-tighter text-white">Neural<br /><span className="text-indigo-500">Analytics.</span></h1>
                        <p className="text-gray-400 mb-10 max-w-md font-medium">You're in the top 5% of global learners this week. Maintain your neural streak to unlock level 15.</p>

                        <div className="flex flex-wrap gap-4">
                            <StatCard icon={Flame} label="Daily Streak" value="15 Days" color="#f97316" delay={0.1} />
                            <StatCard icon={Zap} label="Tulasi Points" value="12,450" color="#4f46e5" delay={0.2} />
                            <StatCard icon={Trophy} label="Global Rank" value="#142" color="#eab308" delay={0.3} />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[400px] glass-panel p-8 flex flex-col items-center justify-center text-center border border-white/10 bg-black/40">
                    <div className="relative w-44 h-44 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                            <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="502" strokeDashoffset="150" className="text-indigo-500 drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-white leading-none">70<span className="text-2xl">%</span></span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mt-1">To LVL 15</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-500/10 px-5 py-2.5 rounded-full border border-indigo-500/20 shadow-lg">
                        <Star size={16} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[2px]">Master Grade Scholar</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-8 border border-white/10 bg-black/20">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <Activity size={24} className="text-indigo-500" />
                                Growth Signal
                            </h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">XP fluctuation over last 7 cycles</p>
                        </div>
                        <select className="bg-black/50 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2 outline-none cursor-pointer hover:border-white/20 transition-all">
                            <option>Last 7 Cycles</option>
                            <option>Monthly View</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 900 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#4f46e520', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="xp" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorXp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-8 border border-white/10 bg-black/20 flex flex-col">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-8">
                        <Rocket size={24} className="text-purple-500" />
                        Capability
                    </h3>
                    <div className="flex-1 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#ffffff05" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#4b5563', fontWeight: 900 }} />
                                <Radar name="Scholar" dataKey="A" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="glass-panel p-6 border-l-4 border-indigo-500 bg-black/20 hover:bg-black/30 transition-all group">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Calendar size={14} /> Neural Challenge
                    </h4>
                    <p className="font-black text-white text-lg leading-tight mb-1 uppercase tracking-tighter">Google Solution Challenge</p>
                    <p className="text-[10px] text-indigo-400 font-black mb-8 uppercase tracking-widest">Starts in 72 hours</p>
                    <button
                        onClick={() => router.push('/hackathons')}
                        className="w-full py-3.5 bg-indigo-600/10 text-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all hover:bg-indigo-600 hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                    >
                        View Details
                    </button>
                </div>

                <div className="glass-panel p-6 border-l-4 border-orange-500 bg-black/20 hover:bg-black/30 transition-all group">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock size={14} /> Roadmap Delta
                    </h4>
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-black text-white text-lg leading-tight uppercase tracking-tighter">Full Stack Dev</p>
                        <span className="text-[10px] font-black text-orange-500">65%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                        <div className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ width: '65%' }}></div>
                    </div>
                    <button
                        onClick={() => router.push('/roadmap')}
                        className="w-full py-3.5 bg-orange-500/10 text-orange-500 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all hover:bg-orange-500 hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20"
                    >
                        Continue Journey
                    </button>
                </div>

                <div className="glass-panel p-6 border-l-4 border-emerald-500 bg-black/20 hover:bg-black/30 transition-all group">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Users size={14} /> Neural Nexus
                    </h4>
                    <p className="font-black text-white text-lg leading-tight mb-1 uppercase tracking-tighter">Frontend Wizards</p>
                    <p className="text-[10px] text-emerald-400 font-black mb-8 uppercase tracking-widest">24 Scholars Active</p>
                    <button
                        onClick={() => router.push('/groups')}
                        className="w-full py-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all hover:bg-emerald-500 hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                    >
                        Join Room
                    </button>
                </div>

                <div className="glass-panel p-6 border-l-4 border-purple-500 bg-black/20 hover:bg-black/30 transition-all group">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BookOpen size={14} /> Weekly Intel
                    </h4>
                    <p className="font-black text-white text-lg leading-tight mb-1 uppercase tracking-tighter">Advanced React Patterns</p>
                    <p className="text-[10px] text-purple-400 font-black mb-8 uppercase tracking-widest">12 Min Read Buffer</p>
                    <button
                        onClick={() => router.push('/ai-hub')}
                        className="w-full py-3.5 bg-purple-600/10 text-purple-500 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-all hover:bg-purple-600 hover:text-white group-hover:shadow-lg group-hover:shadow-purple-600/20"
                    >
                        Start Reading
                    </button>
                </div>
            </div>
        </div>
    );
}
