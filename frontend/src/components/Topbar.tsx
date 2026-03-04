"use client";

import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Topbar() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, text: "New coding challenge available", time: "2m ago", unread: true },
        { id: 2, text: "Your streak is at 12 days! 🔥", time: "1h ago", unread: true },
        { id: 3, text: "Mock interview score: 8.5/10", time: "3h ago", unread: false },
    ];

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6">
            {/* Search */}
            <div className="flex flex-1 items-center gap-4 max-w-lg">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search courses, problems, topics… (⌘K)"
                        className="w-full rounded-xl border border-border bg-background/60 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        readOnly
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl relative"
                        onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                    >
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-card" />
                    </Button>
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden fade-in-up">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <p className="font-semibold text-sm">Notifications</p>
                                <button className="text-xs text-primary hover:underline">Mark all read</button>
                            </div>
                            <div className="divide-y divide-border max-h-72 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n.id} className={cn("px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer", n.unread && "bg-primary/5")}>
                                        <p className="text-sm font-medium text-foreground">{n.text}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <ModeToggle />

                {/* User Menu */}
                <div className="relative ml-1">
                    <button
                        onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            U
                        </div>
                        <div className="hidden md:flex flex-col items-start text-left">
                            <span className="text-sm font-semibold leading-none">User</span>
                            <span className="text-[10px] text-muted-foreground">Pro Member</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showUserMenu && "rotate-180")} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-12 w-52 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden fade-in-up">
                            <div className="px-4 py-3 border-b border-border">
                                <p className="font-semibold text-sm">User</p>
                                <p className="text-xs text-muted-foreground">user@email.com</p>
                            </div>
                            <div className="p-1.5">
                                <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors" onClick={() => setShowUserMenu(false)}>
                                    <User className="h-4 w-4 text-muted-foreground" /> My Profile
                                </Link>
                                <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors" onClick={() => setShowUserMenu(false)}>
                                    <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                                </Link>
                                <div className="border-t border-border mt-1 pt-1">
                                    <button className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors">
                                        <LogOut className="h-4 w-4" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
