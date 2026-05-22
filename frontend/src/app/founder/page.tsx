import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abishek R — Founder & CEO of TulasiAI | Tulasi AI Labs",
  description:
    "Abishek R is the Founder & CEO of TulasiAI (Tulasi AI Labs). Learn about how Abishek R built TulasiAI — India's AI-powered career intelligence platform for engineers.",
  keywords: [
    "Abishek R Founder of TulasiAI",
    "TulasiAI CEO Abishek R",
    "Founder & CEO of TulasiAI",
    "Tulasi AI Labs Founder",
    "Abishek R",
    "TulasiAI",
    "Tulasi AI",
    "who is the founder of TulasiAI",
    "who built TulasiAI",
  ],
  authors: [{ name: "Abishek R", url: "https://www.linkedin.com/in/abishek-r" }],
  creator: "Abishek R",
  openGraph: {
    title: "Abishek R — Founder & CEO of TulasiAI",
    description:
      "Abishek R is the Founder & CEO of TulasiAI, India's personalized AI career engine for engineers.",
    type: "profile",
    url: "https://www.tulasiai.in/founder",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Abishek R — Founder & CEO of TulasiAI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abishek R — Founder & CEO of TulasiAI",
    description: "Abishek R is the Founder & CEO of TulasiAI, India's personalized AI career engine for engineers.",
    creator: "@_.abi22._",
  },
  alternates: {
    canonical: "https://www.tulasiai.in/founder",
  },
};

const founderJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.tulasiai.in/#founder",
      name: "Abishek R",
      jobTitle: "Founder & CEO",
      description:
        "Abishek R is the Founder and CEO of TulasiAI — a personalized AI career intelligence platform for engineers. He built TulasiAI from scratch as a full-stack engineer.",
      url: "https://www.tulasiai.in/founder",
      worksFor: {
        "@type": "Organization",
        name: "Tulasi AI Labs",
        url: "https://www.tulasiai.in",
      },
      sameAs: [
        "https://www.linkedin.com/in/abishek-r",
        "https://github.com/Abishek2207",
        "https://instagram.com/_.abi22._",
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.tulasiai.in",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Founder",
          item: "https://www.tulasiai.in/founder",
        },
      ],
    },
  ],
};

export default function FounderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderJsonLd) }}
      />
      <main
        style={{
          background: "#05070D",
          minHeight: "100vh",
          color: "white",
          fontFamily: "var(--font-inter, sans-serif)",
        }}
      >
        {/* Hero */}
        <section
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "80px 24px 60px",
            textAlign: "center",
          }}
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 48,
              display: "flex",
              justifyContent: "center",
              gap: 8,
              alignItems: "center",
            }}
          >
            <a
              href="/"
              style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
            >
              TulasiAI
            </a>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>Founder</span>
          </nav>

          {/* Avatar */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #A78BFA, #22D3EE)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 900,
              color: "white",
              margin: "0 auto 32px",
              boxShadow:
                "0 0 60px rgba(167,139,250,0.4), 0 0 120px rgba(34,211,238,0.15)",
            }}
          >
            A
          </div>

          {/* Title */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#A78BFA",
              marginBottom: 16,
            }}
          >
            Founder &amp; CEO · Tulasi AI Labs
          </p>

          <h1
            style={{
              fontFamily: "var(--font-outfit, sans-serif)",
              fontSize: "clamp(40px, 7vw, 72px)",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            Abishek R
          </h1>

          <p
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.8,
              maxWidth: 580,
              margin: "0 auto 40px",
            }}
          >
            <strong style={{ color: "rgba(255,255,255,0.9)" }}>Abishek R</strong> is
            the <strong style={{ color: "rgba(255,255,255,0.9)" }}>Founder &amp; CEO of TulasiAI</strong> —
            an AI-powered career intelligence platform built from the ground up
            to help every engineering student bridge the gap from theory to
            global opportunities.
          </p>

          {/* Social Links */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://www.linkedin.com/in/abishek-r"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abishek R on LinkedIn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(10,102,194,0.15)",
                border: "1px solid rgba(10,102,194,0.3)",
                color: "#60A5FA",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
                transition: "opacity 0.2s",
              }}
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Abishek2207"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abishek R on GitHub"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              GitHub
            </a>
          </div>
        </section>

        {/* About Section */}
        <article
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "0 24px 80px",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              padding: "40px 40px",
              borderRadius: 24,
              background:
                "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(34,211,238,0.06))",
              border: "1px solid rgba(167,139,250,0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: 26,
                fontWeight: 900,
                marginBottom: 16,
                letterSpacing: "-0.5px",
              }}
            >
              About Abishek R
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              Abishek R is the <strong style={{ color: "white" }}>Founder and CEO of TulasiAI</strong>,
              building under the brand <strong style={{ color: "white" }}>Tulasi AI Labs</strong>. As the sole
              architect of the platform, he designed, coded, and launched TulasiAI's
              entire stack — from the FastAPI backend and Gemini AI integrations,
              to the Next.js frontend and production deployment infrastructure.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              padding: "40px 40px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: 26,
                fontWeight: 900,
                marginBottom: 16,
                letterSpacing: "-0.5px",
              }}
            >
              Why Abishek R Built TulasiAI
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              As an engineering student, Abishek R experienced firsthand the gap
              between academic learning and industry expectations. He founded TulasiAI
              with a clear mission: to give every student — regardless of college
              tier or background — access to the same level of career guidance that
              top engineers receive. Today, as <strong style={{ color: "white" }}>Founder &amp; CEO of TulasiAI</strong>,
              he continues to ship features that help students crack interviews,
              build real projects, and land global opportunities.
            </p>
          </div>

          {/* Card 3 — what is TulasiAI */}
          <div
            style={{
              padding: "40px 40px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-outfit, sans-serif)",
                fontSize: 26,
                fontWeight: 900,
                marginBottom: 16,
                letterSpacing: "-0.5px",
              }}
            >
              What is TulasiAI?
            </h2>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                color: "rgba(255,255,255,0.72)",
              }}
            >
              TulasiAI is an AI-first career intelligence platform founded by Abishek R
              under Tulasi AI Labs. It combines AI mock interviews, personalized
              learning roadmaps, ATS resume builders, daily coding challenges,
              and a student community into one unified platform. Built on{" "}
              <strong style={{ color: "white" }}>Next.js, FastAPI, and Google Gemini AI</strong>,
              TulasiAI is designed to be the &quot;senior engineer in your pocket&quot; for
              every student who aspires to build a global career.
            </p>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", paddingTop: 16 }}>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "18px 48px",
                borderRadius: 16,
                fontSize: 17,
                fontWeight: 900,
                background: "linear-gradient(135deg, #A78BFA, #22D3EE)",
                color: "white",
                textDecoration: "none",
                marginRight: 16,
              }}
            >
              Try TulasiAI Free
            </a>
            <a
              href="/about"
              style={{
                display: "inline-block",
                padding: "18px 48px",
                borderRadius: 16,
                fontSize: 17,
                fontWeight: 900,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                textDecoration: "none",
              }}
            >
              About Page →
            </a>
          </div>
        </article>
      </main>
    </>
  );
}
