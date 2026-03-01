import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    xp: number;
    level: number;
    streak: number;
    role: 'student' | 'admin';
    plan: 'free' | 'pro' | 'elite';
}

interface AppState {
    user: User | null;
    token: string | null;
    isSidebarCollapsed: boolean;
    isSidebarOpen: boolean; // Alias for legacy components
    language: 'en' | 'ta' | 'hi' | 'te';
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void; // Alias for legacy components
    setLanguage: (lang: 'en' | 'ta' | 'hi' | 'te') => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: {
                id: '1',
                name: 'Abishek',
                email: 'abishek@tulasiai.com',
                xp: 2450,
                level: 12,
                streak: 15,
                role: 'student',
                plan: 'pro'
            }, // Mock initial user for demo
            token: null,
            isSidebarCollapsed: false,
            isSidebarOpen: true,
            language: 'en',
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed, isSidebarOpen: !collapsed }),
            toggleSidebar: () => set((state) => ({
                isSidebarCollapsed: !state.isSidebarCollapsed,
                isSidebarOpen: !state.isSidebarOpen
            })),
            setLanguage: (lang) => set({ language: lang }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'tulasi-storage',
        }
    )
);
