"use client";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useAppStore();

    return (
        <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <Navbar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
