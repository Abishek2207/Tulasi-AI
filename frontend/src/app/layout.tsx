import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TulasiAI – AI-Powered Education & Career Ecosystem",
  description: "Your all-in-one AI-powered learning platform. Practice coding, prepare for interviews, build your resume, and more.",
  keywords: "TulasiAI, AI learning, coding practice, mock interview, resume builder, career roadmap",
  openGraph: {
    title: "TulasiAI – AI-Powered Education Ecosystem",
    description: "AI-powered all-in-one education and career development platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
