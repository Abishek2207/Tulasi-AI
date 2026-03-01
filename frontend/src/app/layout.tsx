import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TulasiAI — Advanced AI Education Platform",
  description: "Accelerate your learning with AI roadmaps, mock interviews, and personalized tutoring.",
  openGraph: {
    title: "TulasiAI — Advanced AI Education Platform",
    description: "Accelerate your learning with AI roadmaps, mock interviews, and personalized tutoring.",
    url: "https://tulasiai.com",
    siteName: "TulasiAI",
    images: [
      {
        url: "https://tulasiai.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TulasiAI — Advanced AI Education Platform",
    description: "Accelerate your learning with AI roadmaps, mock interviews, and personalized tutoring.",
    creator: "@TulasiAI",
    images: ["https://tulasiai.com/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
