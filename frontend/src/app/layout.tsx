import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { BackendBanner } from "@/components/BackendBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Tulasi AI — Free AI Learning Platform for Students", template: "%s | Tulasi AI" },
  description: "Tulasi AI is a completely FREE AI-powered learning platform for students. Chat with AI, practice coding, prepare for interviews, and track your progress.",
  keywords: ["AI learning", "free education", "coding practice", "mock interview", "student platform", "AI chatbot", "programming"],
  openGraph: {
    title: "Tulasi AI — Free AI Learning Platform for Students",
    description: "Free AI-powered SaaS platform for students. Learn, practice, and grow.",
    type: "website",
    siteName: "Tulasi AI",
  },
  twitter: { card: "summary_large_image", title: "Tulasi AI", description: "Free AI Learning Platform" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${mono.variable}`}>
        <Providers>
          {children}
          {/* Keep-alive banner: pings /api/health every 4min & alerts when backend is down */}
          <BackendBanner />
        </Providers>
      </body>
    </html>
  );
}

