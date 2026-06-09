"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, BriefcaseBusiness, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "@/store/slices/uiSlice";

const BOTTOM_NAV_ITEMS = [
  { icon: LayoutDashboard, name: "Home", href: "/dashboard/student" },
  { icon: Target, name: "Interview", href: "/dashboard/ai-interview" },
  { icon: BriefcaseBusiness, name: "Jobs", href: "/dashboard/job-internship-match" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const dispatch = useDispatch();

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      background: "rgba(10, 10, 15, 0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      paddingBottom: "env(safe-area-inset-bottom)",
      zIndex: 49
    }} className="lg:hidden">
      
      {BOTTOM_NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <motion.div whileTap={{ scale: 0.9 }}>
                <item.icon size={22} color={active ? "#06B6D4" : "rgba(255,255,255,0.4)"} />
              </motion.div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#06B6D4" : "rgba(255,255,255,0.4)" }}>
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}

      <button onClick={() => dispatch(toggleSidebar())} style={{ background: "transparent", border: "none", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Menu size={22} color="rgba(255,255,255,0.4)" />
        </motion.div>
        <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>More</span>
      </button>

      {/* Global CSS to hide BottomNav on large screens */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          .lg\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}
