import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Brain, Code2, FileText, Mic, Zap, ArrowRight, Activity, Users, BookOpen } from "lucide-react";
import Link from "next/link";

const tools = [
    {
        name: "Tulasi AI Chat",
        desc: "RAG-powered chatbot. Upload PDFs, ask questions, get instant answers with multilingual support and voice I/O.",
        icon: Brain,
        href: "/learning",
        gradient: "from-violet-500 to-purple-600",
        stats: "2,400+ chats",
        badge: "Most Used",
        badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    },
    {
        name: "Code Assistant",
        desc: "Solve 150+ LeetCode problems with a multi-language editor. Free Piston API for code execution. Debug with AI hints.",
        icon: Code2,
        href: "/coding",
        gradient: "from-blue-500 to-cyan-600",
        stats: "34 solved",
        badge: "Active",
        badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    {
        name: "Interview AI",
        desc: "Practice mock interviews with voice support. Get AI-evaluated scores with keyword detection and detailed feedback.",
        icon: Mic,
        href: "/interviews",
        gradient: "from-emerald-500 to-teal-600",
        stats: "12 interviews",
        badge: "Recommended",
        badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    {
        name: "Resume AI",
        desc: "Build ATS-friendly resumes with live previews. Get keyword optimization scores against 13 industry-specific terms.",
        icon: FileText,
        href: "/resume",
        gradient: "from-orange-500 to-rose-600",
        stats: "ATS Score: 82%",
        badge: "Updated",
        badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    },
];

const pipelines = [
    { name: "Basic RAG", desc: "PDF → Chunk → Embed → FAISS → Answer", status: "active", color: "text-emerald-500" },
    { name: "Multi-doc RAG", desc: "Multiple PDFs with cross-document reasoning", status: "beta", color: "text-blue-500" },
    { name: "Agent Pipeline", desc: "LangChain Agent with tool calling", status: "coming", color: "text-muted-foreground" },
    { name: "LLM Fine-tuned", desc: "Custom HuggingFace model fine-tuned on your data", status: "coming", color: "text-muted-foreground" },
];

const usageStats = [
    { label: "AI Chats", value: "2,411", icon: Brain, change: "+12% this week" },
    { label: "Code Runs", value: "890", icon: Code2, change: "+8% this week" },
    { label: "Interviews Done", value: "48", icon: Mic, change: "+5 this month" },
    { label: "Resume Exports", value: "3", icon: FileText, change: "Last: 2 days ago" },
];

export default function AIHubPage() {
    return (
        <div className="flex flex-col gap-6 fade-in-up">
            {/* Header */}
            <div className="rounded-2xl page-header-bg border border-border px-6 py-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl gradient-brand">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">AI Hub</h1>
                        <p className="text-sm text-muted-foreground">All AI-powered tools in one place</p>
                    </div>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {usageStats.map((s) => (
                    <Card key={s.label} className="card-hover">
                        <CardContent className="flex items-center gap-3 pt-4 pb-4 px-4">
                            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                <s.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <p className="text-[10px] text-emerald-500 mt-0.5">{s.change}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* AI Tools Grid */}
            <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">AI Tools</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {tools.map((tool) => (
                        <Card key={tool.name} className="card-hover overflow-hidden group">
                            <div className={`h-2 bg-gradient-to-r ${tool.gradient}`} />
                            <CardContent className="pt-5 pb-4 px-5">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} shadow-md`}>
                                        <tool.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold">{tool.name}</h3>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tool.badgeColor}`}>{tool.badge}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.desc}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Activity className="h-3 w-3" /> {tool.stats}
                                            </span>
                                            <Link href={tool.href}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${tool.gradient} text-white text-xs font-semibold hover:opacity-90 transition-opacity`}>
                                                Launch <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* AI Pipeline Selector */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        AI Pipeline Configuration
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Select the AI pipeline powering Tulasi Chat</p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                        {pipelines.map((p, i) => (
                            <div key={p.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${i === 0 ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"} ${p.status === "coming" ? "opacity-50 cursor-not-allowed" : ""}`}>
                                <div className={`w-2 h-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : p.status === "beta" ? "bg-blue-500" : "bg-muted-foreground"}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${p.color}`}>{p.status}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Community & Integrations Row */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="card-hover">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" /> Study Community
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">Join 8,400+ learners using AI tools to upskill daily.</p>
                        <Link href="/social" className="flex items-center justify-center gap-2 py-2 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition">
                            Join a Study Room <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardContent>
                </Card>
                <Card className="card-hover">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" /> Learning Paths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">Follow AI-curated roadmaps for your target role.</p>
                        <Link href="/roadmaps" className="flex items-center justify-center gap-2 py-2 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition">
                            View Roadmaps <ArrowRight className="h-4 w-4" />
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
