"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Brain, Code2, Users, Map as MapIcon, Trophy, Target,
    Flame, BookOpen, Zap, TrendingUp, Clock, Star, ArrowRight, CheckCircle2, Activity
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const quickActions = [
    { label: "Start Coding", href: "/coding", icon: Code2, color: "bg-blue-500 hover:bg-blue-600" },
    { label: "AI Chat", href: "/learning", icon: Brain, color: "bg-violet-500 hover:bg-violet-600" },
    { label: "Mock Interview", href: "/interviews", icon: Users, color: "bg-emerald-500 hover:bg-emerald-600" },
    { label: "Roadmaps", href: "/roadmaps", icon: MapIcon, color: "bg-orange-500 hover:bg-orange-600" },
];

const goals = [
    { label: "Complete Graph Algorithms", sub: "Data Structures Roadmap", done: true },
    { label: "Mock Interview — System Design", sub: "Scheduled: Tomorrow 10 AM", done: false },
    { label: "Upload ML Certificate", sub: "Certificate Vault", done: false },
    { label: "Group Study: React Hooks", sub: "Social Learning Room", done: false },
];

const leaderboard = [
    { name: "Aditya K.", xp: 4820, rank: 1, emoji: "🥇" },
    { name: "Priya M.", xp: 4310, rank: 2, emoji: "🥈" },
    { name: "Rahul S.", xp: 3990, rank: 3, emoji: "🥉" },
    { name: "You", xp: 3540, rank: 4, emoji: "⭐" },
];

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [streakData, setStreakData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/streak`, {
                    headers: {
                        "Authorization": `Bearer ${session?.access_token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStreakData(data);
                } else {
                    // Fallback stub if backend not running
                    setStreakData({
                        current_streak: 12, checked_in_today: false, weekly_heatmap: [
                            { day: "M", active: false }, { day: "T", active: true }, { day: "W", active: false },
                            { day: "T", active: true }, { day: "F", active: false }, { day: "S", active: true }, { day: "S", active: false }
                        ]
                    });
                }
            } catch (e) {
                setStreakData({
                    current_streak: 12, checked_in_today: false, weekly_heatmap: [
                        { day: "M", active: false }, { day: "T", active: true }, { day: "W", active: false },
                        { day: "T", active: true }, { day: "F", active: false }, { day: "S", active: true }, { day: "S", active: false }
                    ]
                });
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    const performCheckin = async () => {
        if (!streakData || streakData.checked_in_today) return;

        // Optimistic UI update
        setStreakData({ ...streakData, current_streak: streakData.current_streak + 1, checked_in_today: true });

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/streak/checkin`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session?.access_token}`
                }
            });
        } catch (e) {
            console.error("Checkin failed", e);
        }
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><Activity className="animate-spin text-primary h-8 w-8" /></div>;
    }

    const statCards = [
        {
            title: "Daily Streak",
            value: `${streakData?.current_streak || 0} Days`,
            sub: streakData?.checked_in_today ? "Checked in today! 🔥" : "Check in to keep it up!",
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
        },
        {
            title: "Problems Solved",
            value: "34",
            sub: "+4 from yesterday",
            icon: Code2,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Study Hours",
            value: "120h",
            sub: "Top 10% of learners",
            icon: Brain,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
        },
        {
            title: "Roadmap Progress",
            value: "45%",
            sub: "AI Engineer Track",
            icon: MapIcon,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
    ];

    return (
        <div className="flex flex-col gap-6 fade-in-up">
            {/* Header */}
            <div className="rounded-2xl page-header-bg border border-border px-6 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Good afternoon, <span className="gradient-brand-text">{user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "User"}</span> 👋
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                        {streakData?.checked_in_today ? (
                            <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> You're on a {streakData?.current_streak}-day streak! Great job today.</>
                        ) : (
                            <>You're on a {streakData?.current_streak}-day streak. <button onClick={performCheckin} className="text-orange-500 hover:underline font-semibold ml-1">Check in now!</button></>
                        )}
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-card/60 border border-border px-4 py-2 rounded-xl">
                    <Clock className="h-4 w-4" />
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((s, i) => (
                    <Card key={i} className={`card-hover border ${s.border}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${s.bg}`}>
                                <s.icon className={`h-4 w-4 ${s.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-4">
                            <div className="text-2xl font-bold">{s.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {quickActions.map((a, i) => (
                        <Link key={i} href={a.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium text-sm transition-all ${a.color} shadow-sm hover:shadow-md hover:-translate-y-0.5`}>
                            <a.icon className="h-4 w-4" />
                            {a.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Activity + Goals + Leaderboard Row */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Weekly Activity */}
                <Card className="col-span-4">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Weekly Activity
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">This week</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2 h-28 mt-2">
                            {streakData?.weekly_heatmap?.map((v: any, i: number) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                    <div
                                        className={`w-full rounded-md transition-all hover:opacity-100 ${v.active ? 'gradient-brand opacity-80' : 'bg-muted opacity-50'}`}
                                        style={{ height: v.active ? '100%' : '15%' }}
                                        title={v.active ? 'Active' : 'Missing'}
                                    />
                                    <span className="text-[10px] text-muted-foreground">{v.day.charAt(0)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                                <span>Consistency is key</span>
                            </div>
                            <Link href="/profile" className="text-xs text-primary hover:underline flex items-center gap-1">
                                Full Analytics <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Goals */}
                <Card className="col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Today's Goals
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                        {goals.map((g, i) => (
                            <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-accent/50 transition-colors">
                                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${g.done ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                                <div>
                                    <p className={`text-sm font-medium leading-none ${g.done ? "line-through text-muted-foreground" : ""}`}>
                                        {g.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{g.sub}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard + Learning Spotlight Row */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Leaderboard */}
                <Card className="col-span-3">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Leaderboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {leaderboard.map((u) => (
                            <div key={u.rank} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${u.name === "You" ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/50"}`}>
                                <span className="text-lg w-6 text-center">{u.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{u.name}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    {u.xp.toLocaleString()} XP
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Learning Spotlight */}
                <Card className="col-span-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" />
                            Continue Learning
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { title: "System Design Fundamentals", progress: 68, tag: "AI Engineer", tagColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
                            { title: "Dynamic Programming Patterns", progress: 42, tag: "DSA", tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
                            { title: "LangChain for Production", progress: 25, tag: "AI/ML", tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
                        ].map((item, i) => (
                            <div key={i} className="p-3 rounded-xl border border-border hover:bg-accent/40 transition-colors card-hover cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.tagColor}`}>{item.tag}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                    <div className="gradient-brand h-1.5 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">{item.progress}% complete</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
