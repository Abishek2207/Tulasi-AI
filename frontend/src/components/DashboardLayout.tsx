"use client";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import PageTransition from "@/components/PageTransition";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import "./App.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isSidebarOpen } = useAppStore();

    return (
        <div className="app-container">
            <div className="mesh-bg"></div>
            <Sidebar />
            <motion.main
                animate={{ marginLeft: isSidebarOpen ? 280 : 88 }}
                className="main-content"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <TopHeader user={user} />
                <div className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '24px' }}>
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </motion.main>
        </div>
    );
}
