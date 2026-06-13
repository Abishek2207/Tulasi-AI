import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { XPNotificationSystem } from "@/components/XPNotification";
import { CommandPalette } from "@/components/CommandPalette";
import { KeepAlive } from "@/components/KeepAlive";
import { BackendWarmup } from "@/components/BackendWarmup";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tulasiai.in"),
  title: {
    default: "TulasiAI | AI Career Intelligence Platform for Students & Professionals",
    template: "%s | TulasiAI",
  },
  description: "TulasiAI helps students, freshers, working professionals, and career switchers learn skills, prepare for interviews, build projects, discover opportunities, and grow with AI-powered career intelligence. Built by Abishek R, Founder & CEO of TulasiAI.",
  manifest: "/manifest.json",
  keywords: [
    "TulasiAI", "AI career platform", "career intelligence", "student career platform", "professional upskilling", "AI learning mentor", "DSA practice", "interview preparation", "project guidance", "job preparation", "internship preparation", "career roadmap", "AI upskilling platform",  "TulasiAI", "Tulasiai",
    "Abishek R Founder of TulasiAI", "TulasiAI CEO Abishek R", 
    "Founder & CEO of TulasiAI", "Tulasi AI Labs Founder", "Abishek R"
  ],
  openGraph: {
    title: "TulasiAI | AI Career Intelligence Platform for Students & Professionals",
    description: "AI-powered career infrastructure for students, freshers, professionals, and career switchers. Founded by Abishek R.",
    type: "website",
    siteName: "TulasiAI",
    url: "https://www.tulasiai.in",
    images: [{
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "TulasiAI Interface Preview"
    }],
  },
  other: {
    "og:founder": "Abishek R",
    "og:ceo": "Abishek R",
  },
  twitter: {
    card: "summary_large_image",
    title: "TulasiAI | AI Career Intelligence Platform for Students & Professionals",
    description: "AI-powered career infrastructure for students, freshers, professionals, and career switchers. By TulasiAI CEO Abishek R.",
    creator: "@_.abi22._",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  authors: [{ name: "Abishek R", url: "https://www.linkedin.com/in/abishek-r" }],
  creator: "Abishek R",
  publisher: "Abishek R",
  alternates: {
    canonical: "https://www.tulasiai.in",
  },
  category: "technology",
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
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": "https://www.tulasiai.in/#founder",
                "name": "Abishek R",
                "jobTitle": "Founder & CEO",
                "worksFor": {
                  "@id": "https://www.tulasiai.in/#organization"
                },
                "url": "https://www.linkedin.com/in/abishek-r",
                "sameAs": [
                  "https://instagram.com/_.abi22._",
                  "https://github.com/Abishek2207",
                  "https://www.linkedin.com/in/abishek-r"
                ],
                "description": "Abishek R is the Founder and CEO of TulasiAI."
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://www.tulasiai.in/#organization",
                "name": "Tulasi AI Labs",
                "alternateName": ["TulasiAI", "Tulasi AI", "Tulasi-AI"],
                "url": "https://www.tulasiai.in",
                "logo": "https://www.tulasiai.in/logo.png",
                "founder": {
                  "@id": "https://www.tulasiai.in/#founder"
                },
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "Founder",
                  "email": "abishekramamoorthy22@gmail.com"
                },
                "sameAs": [
                  "https://github.com/Abishek2207"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://www.tulasiai.in/#website",
                "name": "TulasiAI",
                "url": "https://www.tulasiai.in",
                "publisher": {
                  "@id": "https://www.tulasiai.in/#organization"
                },
                "author": {
                  "@id": "https://www.tulasiai.in/#founder"
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://www.tulasiai.in/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ])
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
          <Suspense fallback={null}>
            {children}
            <XPNotificationSystem />
            <CommandPalette />
            <KeepAlive />

            <ServiceWorkerRegistrar />
            <BackendWarmup />
            <Analytics />
            <SpeedInsights />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
