"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Flame, Code2, Brain, Award, Star, TrendingUp, BookOpen, Clock, Zap } from "lucide-react";

const skills = [
    { name: "Python", level: 85 },
    { name: "System Design", level: 72 },
    { name: "DSA", level: 68 },
    { name: "ML/AI", level: 60 },
    { name: "React", level: 78 },
    { name: "SQL", level: 55 },
];

const badges = [
    { name: "Streak Master", emoji: "🔥", desc: "30-day streak" },
    { name: "Code Ninja", emoji: "⚡", desc: "100 problems solved" },
    { name: "AI Pioneer", emoji: "🤖", desc: "RAG expert" },
    { name: "Interview Pro", emoji: "🎯", desc: "Avg score 8+/10" },
    { name: "Cert Champion", emoji: "🏆", desc: "5 certificates" },
    { name: "Team Player", emoji: "👥", desc: "50 group sessions" },
];

const activity = [
    { action: "Solved", detail: "Binary Search Tree (Medium)", time: "2h ago", icon: Code2, color: "text-blue-500 bg-blue-500/10" },
    { action: "Completed", detail: "Mock Interview — System Design", time: "Yesterday", icon: Brain, color: "text-violet-500 bg-violet-500/10" },
    { action: "Uploaded", detail: "AWS Certificate", time: "2 days ago", icon: Award, color: "text-emerald-500 bg-emerald-500/10" },
    { action: "Completed", detail: "LangChain RAG Module", time: "3 days ago", icon: BookOpen, color: "text-orange-500 bg-orange-500/10" },
];

export default function ProfilePage() {
    return (
        <div className="flex flex-col gap-6 fade-in-up">
            {/* Header Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-border">
                <div className="h-28 gradient-brand opacity-80" />
                <div className="px-6 pb-5">
                    <div className="flex items-end gap-4 -mt-12">
                        <div className="w-20 h-20 rounded-2xl gradient-brand border-4 border-card flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            U
                        </div>
                        <div className="flex-1 pb-1">
                            <h1 className="text-xl font-bold">User Name</h1>
                            <p className="text-sm text-muted-foreground">user@email.com · Joined March 2025</p>
                        </div>
                        <div className="flex items-center gap-2 pb-1">
                            <div className="px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold">PRO</div>
                            <button className="px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-accent transition-colors flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-yellow-500" /> Level 14</span>
                            <span>3,540 / 4,000 XP to Level 15</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="gradient-brand h-2.5 rounded-full" style={{ width: "88.5%" }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Day Streak", value: "12", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Problems Solved", value: "34", icon: Code2, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Study Hours", value: "120h", icon: Clock, color: "text-violet-500", bg: "bg-violet-500/10" },
                    { label: "Certificates", value: "5", icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((s) => (
                    <Card key={s.label} className="card-hover">
                        <CardContent className="flex items-center gap-3 pt-5 pb-4 px-4">
                            <div className={`p-2.5 rounded-xl ${s.bg}`}>
                                <s.icon className={`h-5 w-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                {/* Skills */}
                <Card className="col-span-3">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" /> Skill Proficiency
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {skills.map((s) => (
                            <div key={s.name}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium">{s.name}</span>
                                    <span className="text-muted-foreground">{s.level}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className="gradient-brand h-2 rounded-full" style={{ width: `${s.level}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Badges */}
                <Card className="col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" /> Badges
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {badges.map((b) => (
                                <div key={b.name} className="flex flex-col items-center text-center p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors card-hover cursor-pointer">
                                    <span className="text-2xl mb-1">{b.emoji}</span>
                                    <p className="text-xs font-semibold">{b.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {activity.map((a, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                                <div className={`p-2 rounded-xl shrink-0 ${a.color.split(" ")[1]}`}>
                                    <a.icon className={`h-4 w-4 ${a.color.split(" ")[0]}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{a.action} <span className="text-muted-foreground font-normal">{a.detail}</span></p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
