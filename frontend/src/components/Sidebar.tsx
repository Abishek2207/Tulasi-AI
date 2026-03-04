"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Code2,
    Map,
    Mic,
    FileText,
    Users,
    Settings,
    Trophy,
    Flame,
    StickyNote,
    Award,
    Zap,
    Rocket,
    ChevronRight,
    User,
    Sparkles,
    ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
};

type NavGroup = {
    label: string;
    items: NavItem[];
};

const navGroups: NavGroup[] = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { title: "AI Hub", href: "/ai-hub", icon: Sparkles, badge: "New", badgeColor: "bg-violet-500" },
        ],
    },
    {
        label: "Learn & Practice",
        items: [
            { title: "AI Learning", href: "/learning", icon: BookOpen },
            { title: "Coding Practice", href: "/coding", icon: Code2, badge: "150+", badgeColor: "bg-blue-500" },
            { title: "Mock Interviews", href: "/interviews", icon: Mic },
        ],
    },
    {
        label: "Career",
        items: [
            { title: "Career Roadmaps", href: "/roadmaps", icon: Map },
            { title: "Resume Builder", href: "/resume", icon: FileText },
            { title: "Hackathons", href: "/hackathons", icon: Rocket, badge: "Live", badgeColor: "bg-emerald-500" },
        ],
    },
    {
        label: "Community",
        items: [
            { title: "Social Study", href: "/social", icon: Users },
            { title: "Notes", href: "/notes", icon: StickyNote },
            { title: "Certificates", href: "/certificates", icon: Award },
        ],
    },
    {
        label: "Account",
        items: [
            { title: "Profile", href: "/profile", icon: User },
            { title: "Settings", href: "/settings", icon: Settings },
            { title: "Admin Panel", href: "/admin", icon: ShieldAlert, badge: "Manage", badgeColor: "bg-red-500" },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 border-r border-border bg-sidebar min-h-screen">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-5 shrink-0">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-base gradient-brand-text">Tulasi AI</span>
                        <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Pro Platform</span>
                    </div>
                </Link>
            </div>

            {/* Streak Banner */}
            <div className="mx-3 mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2.5 bg-orange-500/10 border border-orange-500/20">
                <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">12 Day Streak!</p>
                    <p className="text-[10px] text-muted-foreground">Keep going 🔥</p>
                </div>
                <Trophy className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
                {navGroups.map((group) => (
                    <div key={group.label} className="mb-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                            {group.label}
                        </p>
                        <nav className="grid gap-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                                            isActive ? "text-primary-foreground" : ""
                                        )} />
                                        <span className="flex-1 truncate">{item.title}</span>
                                        {item.badge && (
                                            <span className={cn(
                                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0",
                                                isActive ? "bg-white/25" : item.badgeColor
                                            )}>
                                                {item.badge}
                                            </span>
                                        )}
                                        {isActive && (
                                            <ChevronRight className="h-3 w-3 text-primary-foreground/70 shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* User Footer */}
            <div className="shrink-0 border-t border-border p-3">
                <Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent transition-colors group">
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">User</p>
                        <p className="text-[10px] text-muted-foreground truncate">user@email.com</p>
                    </div>
                    <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 font-semibold shrink-0">
                        PRO
                    </div>
                </Link>
            </div>
        </div>
    );
}
