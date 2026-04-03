import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { DebugPanel } from "@/components/DebugPanel";
import { XPNotificationSystem } from "@/components/XPNotification";
import { OnboardingTour } from "@/components/OnboardingTour";
import { CommandPalette } from "@/components/CommandPalette";
import { KeepAlive } from "@/components/KeepAlive";
import { BackendWarmup } from "@/components/BackendWarmup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://tulasiai.vercel.app"),
  title: {
    default: "TulasiAI | Personalized Career Intelligence Engine",
    template: "%s | TulasiAI",
  },
  description: "Bridge the gap from theory to global offers. TulasiAI provides personalized mock interviews, neural skill mapping, and daily AI missions for engineers.",
  manifest: "/manifest.json",
  keywords: [
    "AI career coach", "mock interview AI", "personalized roadmaps", "skill radar chart", 
    "engineering career platform", "ATS resume builder", "technical interview prep",
    "personalized learning AI", "career readiness score", "TulasiAI", "Tulasiai"
  ],
  openGraph: {
    title: "TulasiAI | Personalized Career Intelligence Engine",
    description: "The autonomous career engine: Neural skill mapping, AI mock interviews, and personalized missions.",
    type: "website",
    siteName: "TulasiAI",
    url: "https://tulasiai.vercel.app",
    images: [{
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "TulasiAI Interface Preview"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TulasiAI | Personalized Career Intelligence",
    description: "Personalized AI engineering missions and career intelligence mapped to your skills.",
    creator: "@_.abi22._",
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo-transparent.png",
    apple: "/images/logo.png",
  },
};

export const viewport = {
  themeColor: "#05070D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${mono.variable}`}>
      <head>
        <meta name="theme-color" content="#05070D" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "TulasiAI",
              "alternateName": ["tulasiai", "tulasi ai", "Tulasi AI"],
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "url": "https://tulasiai.vercel.app",
              "image": "https://tulasiai.vercel.app/opengraph-image.png",
              "description": "Personalized AI engineering missions and career intelligence mapped to your skills.",
              "producer": {
                "@type": "Person",
                "name": "Abishek R"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-PLACEHOLDER" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PLACEHOLDER');
        ` }} />
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
          <DebugPanel />
          <XPNotificationSystem />
          <OnboardingTour />
          <CommandPalette />
          <KeepAlive />
          <PWAInstallPrompt />
          <ServiceWorkerRegistrar />
          <BackendWarmup />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
