"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Upload, Download, Share2, Search, ExternalLink, Trash2, Eye, Plus, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Certificate = {
    id: string;
    file_name: string;
    category: string;
    description: string;
    file_url: string;
    uploaded_at: string;
};

const categories = ["All", "AI/ML", "Cloud", "Frontend", "Data", "DevOps", "Other"];

// Helper to calculate UI properties based on category
const getCategoryProps = (cat: string) => {
    switch (cat) {
        case "Cloud": return { color: "from-orange-500 to-amber-400", emoji: "☁️" };
        case "AI/ML": return { color: "from-violet-500 to-indigo-400", emoji: "🤖" };
        case "Frontend": return { color: "from-blue-500 to-cyan-400", emoji: "💻" };
        case "Data": return { color: "from-emerald-500 to-teal-400", emoji: "📊" };
        case "DevOps": return { color: "from-cyan-500 to-blue-400", emoji: "🐳" };
        default: return { color: "from-gray-500 to-slate-400", emoji: "📜" };
    }
};

export default function CertificatesPage() {
    const [certs, setCerts] = useState<Certificate[]>([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [preview, setPreview] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const getAuthHeaders = async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        return {
            "Authorization": `Bearer ${session?.access_token}`
        };
    };

    const fetchCerts = async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates`, { headers });
            if (res.ok) {
                const data = await res.json();
                setCerts(data);
            }
        } catch (e) {
            console.error("Failed to fetch certificates", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCerts();
    }, []);

    const filtered = certs.filter(c =>
        (filter === "All" || c.category === filter) &&
        (c.file_name.toLowerCase().includes(search.toLowerCase()) ||
            (c.description && c.description.toLowerCase().includes(search.toLowerCase())))
    );

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "Other"); // Default category

            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/upload`, {
                method: "POST",
                headers, // FormData handles Content-Type automatically
                body: formData
            });

            if (res.ok) {
                const newCert = await res.json();
                setCerts([newCert, ...certs]);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
            e.target.value = ""; // Reset input
        }
    };

    const deleteCert = async (id: string) => {
        if (!confirm("Are you sure you want to delete this certificate?")) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/certificates/${id}`, {
                method: "DELETE",
                headers
            });
            if (res.ok) {
                setCerts(certs.filter(c => c.id !== id));
            }
        } catch (e) {
            console.error("Failed to delete certificate", e);
        }
    };

    if (loading) {
        return <div className="p-10 flex justify-center"><Activity className="animate-spin text-primary h-8 w-8" /></div>;
    }

    return (
        <div className="flex flex-col gap-6 fade-in-up">
            {/* Header */}
            <div className="rounded-2xl page-header-bg border border-border px-6 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Award className="h-6 w-6 text-primary" /> Certificate Vault
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Store, showcase, and share your achievements</p>
                    </div>
                    <label className="cursor-pointer">
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition shadow-sm ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                            {uploading ? <Activity className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {uploading ? 'Uploading...' : 'Upload Certificate'}
                        </div>
                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <div className="text-center px-4 py-2 rounded-xl bg-card/60 border border-border">
                        <p className="text-xl font-bold">{certs.length}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    {["AI/ML", "Cloud", "Frontend"].map(c => (
                        <div key={c} className="text-center px-4 py-2 rounded-xl bg-card/60 border border-border">
                            <p className="text-xl font-bold">{certs.filter(x => x.category === c).length}</p>
                            <p className="text-xs text-muted-foreground">{c}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search certificates..."
                        className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {categories.map(c => (
                        <button key={c} onClick={() => setFilter(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === c ? "gradient-brand text-white shadow-sm" : "border border-border hover:bg-accent"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Certificate Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map(cert => {
                    const props = getCategoryProps(cert.category);
                    return (
                        <div key={cert.id} className="group rounded-2xl border border-border overflow-hidden card-hover bg-card">
                            {/* Card Visual */}
                            <div className={`h-28 bg-gradient-to-br ${props.color} relative flex items-center justify-center`}>
                                <span className="text-5xl">{props.emoji}</span>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                                    <button onClick={() => setPreview(cert)} className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 transition text-white">
                                        <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => deleteCert(cert.id)} className="p-1.5 rounded-lg bg-black/30 hover:bg-red-500/70 transition text-white">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">{cert.category}</span>
                                </div>
                            </div>
                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-sm mb-1 truncate" title={cert.file_name}>{cert.file_name}</h3>
                                <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{cert.description || "Uploaded Certificate"}</p>
                                <p className="text-xs text-muted-foreground mb-3">Added: {new Date(cert.uploaded_at).toLocaleDateString()}</p>
                                <div className="flex items-center gap-2">
                                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs hover:bg-accent transition-colors">
                                        <Download className="h-3 w-3" /> View/DL
                                    </a>
                                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs hover:bg-accent transition-colors">
                                        <Share2 className="h-3 w-3" /> Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Upload Placeholder */}
                <label className="cursor-pointer rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center h-52 hover:border-primary hover:bg-primary/5 transition-all group">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Activity className="h-8 w-8 text-primary animate-spin mb-2" />
                            <p className="text-sm font-medium text-primary">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                            <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Add Certificate</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG</p>
                        </>
                    )}
                    <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {/* Preview Modal */}
            {preview && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
                    <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className={`h-40 bg-gradient-to-br ${getCategoryProps(preview.category).color} flex items-center justify-center rounded-t-xl relative`}>
                            <span className="text-6xl">{getCategoryProps(preview.category).emoji}</span>
                        </div>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold mb-1 truncate" title={preview.file_name}>{preview.file_name}</h2>
                            <p className="text-muted-foreground text-sm mb-1">{preview.description || "Uploaded Certificate"}</p>
                            <p className="text-xs text-muted-foreground mb-4">Added: {new Date(preview.uploaded_at).toLocaleDateString()}</p>
                            <div className="flex gap-2">
                                <Button className="flex-1 gradient-brand border-0 text-white gap-2 rounded-xl" asChild>
                                    <a href={preview.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" /> Download / View Origin
                                    </a>
                                </Button>
                                <Button variant="outline" className="rounded-xl" onClick={() => setPreview(null)}>Close</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
