import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    name: string;
    email: string;
    avatar: string;
    plan: string;
    streak: number;
}

interface AppState {
    user: User | null;
    isSidebarOpen: boolean;
    activeModule: string;
    setUser: (user: User | null) => void;
    toggleSidebar: () => void;
    setActiveModule: (module: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: {
                name: 'Tulasi Admin',
                email: 'admin@tulasiai.com',
                avatar: '',
                plan: 'Ultimate',
                streak: 15,
            },
            isSidebarOpen: true,
            activeModule: 'dashboard',
            setUser: (user) => set({ user }),
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setActiveModule: (module) => set({ activeModule: module }),
        }),
        {
            name: 'tulasiai-storage',
        }
    )
);
