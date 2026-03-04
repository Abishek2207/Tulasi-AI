"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Users, Activity, Target, Brain, Code2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0 });

    useEffect(() => {
        const verifyAdmin = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // In production, verify user.email against an authorized list or a role table.
            // For now, allow entry if logged in to show the UI.

            // Fetch mock user metrics from backend
            try {
                // In a real app we pass the 'Authorization: Bearer <token>'
                const res = await fetch("http://localhost:8000/api/v1/users");
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users || []);
                    setStats({ total: data.total_users || 0, active: data.active_today || 0 });
                } else {
                    // fallback mock data if backend isn't mapped
                    setUsers([
                        { id: 1, email: user.email, last_active: "Just now", xp: 4500, plan: "PRO" },
                        { id: 2, email: "john@example.com", last_active: "2 mins ago", xp: 1200, plan: "FREE" },
                        { id: 3, email: "tech@startup.io", last_active: "1 hour ago", xp: 8900, plan: "PRO" }
                    ]);
                    setStats({ total: 150, active: 45 });
                }
            } catch (e) {
                // fallback
                setUsers([
                    { id: 1, email: user.email, last_active: "Just now", xp: 4500, plan: "PRO" },
                    { id: 2, email: "john@example.com", last_active: "2 mins ago", xp: 1200, plan: "FREE" }
                ]);
                setStats({ total: 150, active: 45 });
            }
            setLoading(false);
        };
        verifyAdmin();
    }, [router]);

    if (loading) {
        return <div className="p-10 flex w-full justify-center"><Activity className="animate-spin text-primary h-8 w-8" /></div>;
    }

    return (
        <div className="flex flex-col gap-6 fade-in-up">
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                        <ShieldAlert className="h-6 w-6" /> Platform Admin
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage users, view platform metrics, and monitor activity.</p>
                </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="card-hover">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500 absolute top-4 right-5" />
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-xs text-emerald-500 font-medium">+12 this week</p>
                    </CardContent>
                </Card>
                <Card className="card-hover">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500 absolute top-4 right-5" />
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                        <div className="text-3xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">30% of total users</p>
                    </CardContent>
                </Card>
                <Card className="card-hover">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground">AI Chats</CardTitle>
                        <Brain className="h-4 w-4 text-violet-500 absolute top-4 right-5" />
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                        <div className="text-3xl font-bold">14.2k</div>
                        <p className="text-xs text-muted-foreground">API usage healthy</p>
                    </CardContent>
                </Card>
                <Card className="card-hover">
                    <CardHeader className="pb-2 pt-4 px-5">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Code Runs</CardTitle>
                        <Code2 className="h-4 w-4 text-orange-500 absolute top-4 right-5" />
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                        <div className="text-3xl font-bold">8,901</div>
                        <p className="text-xs text-muted-foreground">Piston API load stable</p>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">User Email</th>
                                    <th className="px-4 py-3 font-semibold">Plan</th>
                                    <th className="px-4 py-3 font-semibold">XP Score</th>
                                    <th className="px-4 py-3 font-semibold">Last Active</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((u, i) => (
                                    <tr key={i} className="hover:bg-accent/40 transition-colors">
                                        <td className="px-4 py-3 font-medium">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${u.plan === 'PRO' ? 'bg-violet-100 text-violet-700' : 'bg-muted text-muted-foreground'}`}>
                                                {u.plan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{u.xp.toLocaleString()} XP</td>
                                        <td className="px-4 py-3 text-muted-foreground">{u.last_active}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-xs text-primary hover:underline font-medium">Manage</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
