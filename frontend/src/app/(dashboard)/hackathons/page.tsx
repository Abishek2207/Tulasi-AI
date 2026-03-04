import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Users, Trophy, Calendar, ExternalLink, Zap, Clock, Globe } from "lucide-react";

const hackathons = [
    {
        name: "Google AI Hackathon 2026",
        org: "Google",
        prize: "$50,000",
        deadline: "Mar 20, 2026",
        participants: "12,400+",
        tags: ["AI", "ML", "Open Source"],
        status: "upcoming",
        statusColor: "bg-blue-500",
        link: "#",
        emoji: "🔵",
        desc: "Build innovative AI solutions using Google Cloud Vertex AI and Gemini models. Open to all skill levels.",
    },
    {
        name: "HackAI — India Edition",
        org: "Devfolio",
        prize: "₹5,00,000",
        deadline: "Mar 14, 2026",
        participants: "8,200+",
        tags: ["AI", "SaaS", "EdTech"],
        status: "live",
        statusColor: "bg-emerald-500",
        link: "#",
        emoji: "🟢",
        desc: "India's largest AI hackathon. Build products that solve real problems using cutting-edge AI technologies.",
    },
    {
        name: "MLH Global Hack Week",
        org: "Major League Hacking",
        prize: "Swag + Internships",
        deadline: "Mar 10, 2026",
        participants: "50,000+",
        tags: ["Open Source", "Community", "All Tracks"],
        status: "live",
        statusColor: "bg-emerald-500",
        link: "#",
        emoji: "🟢",
        desc: "A week-long global event with daily challenges and mini-hacks across multiple domains.",
    },
    {
        name: "ETHIndia Buildathon",
        org: "ETHIndia",
        prize: "$25,000 in crypto",
        deadline: "Apr 5, 2026",
        participants: "3,500+",
        tags: ["Web3", "DeFi", "Blockchain"],
        status: "upcoming",
        statusColor: "bg-blue-500",
        link: "#",
        emoji: "🔵",
        desc: "India's premier Web3 hackathon. Build decentralized applications on Ethereum and Layer 2s.",
    },
    {
        name: "NASA Space Apps 2025",
        org: "NASA",
        prize: "Global Recognition",
        deadline: "Oct 2025",
        participants: "200,000+",
        tags: ["Space", "Data", "AI"],
        status: "past",
        statusColor: "bg-muted-foreground",
        link: "#",
        emoji: "⚫",
        desc: "International hackathon using NASA open data to address challenges on Earth and in space.",
    },
    {
        name: "Smart India Hackathon",
        org: "Government of India",
        prize: "₹1,00,000",
        deadline: "Aug 2025",
        participants: "1,00,000+",
        tags: ["GovTech", "Social Impact"],
        status: "past",
        statusColor: "bg-muted-foreground",
        link: "#",
        emoji: "⚫",
        desc: "National level hackathon presenting government problem statements for innovative digital solutions.",
    },
];

export default function HackathonsPage() {
    const live = hackathons.filter(h => h.status === "live");
    const upcoming = hackathons.filter(h => h.status === "upcoming");
    const past = hackathons.filter(h => h.status === "past");

    return (
        <div className="flex flex-col gap-6 fade-in-up">
            {/* Header */}
            <div className="rounded-2xl page-header-bg border border-border px-6 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Rocket className="h-6 w-6 text-primary" /> Hackathons
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Compete, build, and win with top global hackathons</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500">{live.length}</p>
                        <p className="text-xs text-muted-foreground">Live Now</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-500">{upcoming.length}</p>
                        <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                </div>
            </div>

            {/* Live */}
            <Section label="🟢 Live Now" count={live.length} color="text-emerald-500">
                {live.map(h => <HackCard key={h.name} h={h} />)}
            </Section>

            {/* Upcoming */}
            <Section label="🔵 Upcoming" count={upcoming.length} color="text-blue-500">
                {upcoming.map(h => <HackCard key={h.name} h={h} />)}
            </Section>

            {/* Past */}
            <Section label="⚫ Past" count={past.length} color="text-muted-foreground">
                {past.map(h => <HackCard key={h.name} h={h} />)}
            </Section>
        </div>
    );
}

function Section({ label, count, color, children }: { label: string; count: number; color: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <h2 className={`text-sm font-bold uppercase tracking-wide ${color}`}>{label}</h2>
                <span className="text-xs text-muted-foreground">({count})</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">{children}</div>
        </div>
    );
}

function HackCard({ h }: { h: typeof hackathons[number] }) {
    return (
        <Card className={`card-hover ${h.status === "past" ? "opacity-70" : ""}`}>
            <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm">{h.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />{h.org}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${h.statusColor}`}>
                        {h.status}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <p className="text-xs text-muted-foreground mb-3">{h.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {h.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{t}</span>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span>{h.prize}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{h.participants}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{h.deadline}</span>
                    </div>
                </div>
                {h.status !== "past" && (
                    <a href={h.link} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl gradient-brand text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                        <Zap className="h-3.5 w-3.5" /> Register Now <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </CardContent>
        </Card>
    );
}
