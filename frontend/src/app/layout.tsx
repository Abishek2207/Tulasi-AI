import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Add robust PWA metadata 
export const metadata: Metadata = {
  title: { default: "Tulasi AI — AI Career & Learning Platform", template: "%s | Tulasi AI" },
  description: "AI-powered mock interviews, learning roadmaps, resume builder, and career acceleration tools for engineers and students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tulasi AI",
  },
  keywords: ["AI interview prep", "career roadmaps", "mock interview", "student platform", "tech prep", "resume analyzer", "coding practice"],
  openGraph: {
    title: "Tulasi AI — AI Career & Learning Platform",
    description: "AI-powered mock interviews, resume analysis, coding practice, and career roadmaps.",
    type: "website",
    siteName: "Tulasi AI",
  },
  twitter: { card: "summary_large_image", title: "Tulasi AI", description: "AI Career & Learning Platform" },
};

import { DebugPanel } from "@/components/ui/DebugPanel";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { XPNotificationSystem } from "@/components/XPNotification";
import { OnboardingTour } from "@/components/OnboardingTour";
import { CommandPalette } from "@/components/CommandPalette";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${mono.variable}`}>
        <Providers>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(18, 18, 24, 0.95)",
                color: "var(--text-primary)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "var(--font-inter)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              },
            }}
          />
          {children}
          <ReviewModal />
          <DebugPanel />
          <XPNotificationSystem />
          <OnboardingTour />
          <CommandPalette />
          
          {/* PWA Service Worker Registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) { console.log('PWA ServiceWorker registered'); },
                      function(err) { console.log('PWA ServiceWorker registration failed: ', err); }
                    );
                  });
                }
              `,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
