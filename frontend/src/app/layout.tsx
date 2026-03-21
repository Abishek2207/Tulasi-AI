import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Tulasi AI — AI Interview & Career Platform", template: "%s | Tulasi AI" },
  description: "AI-powered mock interviews, resume analysis, and career roadmaps",
  keywords: ["AI interview", "career roadmaps", "mock interview", "student platform", "tech prep", "resume analyzer"],
  openGraph: {
    title: "Tulasi AI — AI Interview & Career Platform",
    description: "AI-powered mock interviews, resume analysis, and career roadmaps.",
    type: "website",
    siteName: "Tulasi AI",
  },
  twitter: { card: "summary_large_image", title: "Tulasi AI", description: "AI Interview & Career Platform" },
};

import { ConnectionStatus } from "@/components/ConnectionStatus";
import { DebugPanel } from "@/components/DebugPanel";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${mono.variable}`}>
        {/* Google Analytics Snippet */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TULASIAI123"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TULASIAI123', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <Providers>
          <ConnectionStatus />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }
            }} 
          />
          {children}
          <DebugPanel />
        </Providers>
      </body>
    </html>
  );
}

