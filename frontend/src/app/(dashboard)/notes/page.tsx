"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StickyNote, Plus, Search, Pin, Tag, Trash2, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Note = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
    created_at: string;
    updated_at: string;
};

// Simple random color generator based on index/id for UI flair
const colors = ["border-l-violet-500", "border-l-blue-500", "border-l-emerald-500", "border-l-orange-500", "border-l-rose-500"];
const getColor = (id: string) => colors[id.charCodeAt(0) % colors.length];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selected, setSelected] = useState<Note | null>(null);
    const [search, setSearch] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`
        };
    };

    const fetchNotes = async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notes`, { headers });
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
                if (data.length > 0 && !selected) setSelected(data[0]);
            }
        } catch (e) {
            console.error("Failed to fetch notes", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    const pinned = filtered.filter(n => n.pinned);
    const all = filtered.filter(n => !n.pinned);

    const selectNote = (note: Note) => {
        setSelected(note);
        setIsEditing(false);
    };

    const startEdit = () => {
        if (!selected) return;
        setEditTitle(selected.title || "");
        setEditContent(selected.content || "");
        setIsEditing(true);
    };

    const saveEdit = async () => {
        if (!selected) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notes/${selected.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ title: editTitle, content: editContent })
            });
            if (res.ok) {
                const updated = await res.json();
                setNotes(notes.map(n => n.id === updated.id ? updated : n));
                setSelected(updated);
                setIsEditing(false);
            }
        } catch (e) {
            console.error("Failed to update note", e);
        }
    };

    const addNote = async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notes`, {
                method: "POST",
                headers,
                body: JSON.stringify({ title: "New Note", content: "", tags: [], pinned: false })
            });
            if (res.ok) {
                const newNote = await res.json();
                setNotes([newNote, ...notes]);
                setSelected(newNote);
                setEditTitle(newNote.title);
                setEditContent(newNote.content);
                setIsEditing(true);
            }
        } catch (e) {
            console.error("Failed to create note", e);
        }
    };

    const togglePin = async (id: string, currentPinnedState: boolean) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notes/${id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ pinned: !currentPinnedState })
            });
            if (res.ok) {
                const updated = await res.json();
                setNotes(notes.map(n => n.id === updated.id ? updated : n));
                if (selected?.id === updated.id) setSelected(updated);
            }
        } catch (e) {
            console.error("Failed to pin note", e);
        }
    };

    const deleteNote = async (id: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notes/${id}`, {
                method: "DELETE",
                headers
            });
            if (res.ok) {
                const remaining = notes.filter(n => n.id !== id);
                setNotes(remaining);
                setSelected(remaining.length > 0 ? remaining[0] : null);
            }
        } catch (e) {
            console.error("Failed to delete note", e);
        }
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center p-10"><Activity className="h-8 w-8 text-primary animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col gap-4 fade-in-up h-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <StickyNote className="h-6 w-6 text-primary" />
                        Notes
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Your personal knowledge base</p>
                </div>
                <Button onClick={addNote} className="gradient-brand border-0 text-white gap-2 rounded-xl shadow-sm hover:opacity-90">
                    <Plus className="h-4 w-4" /> New Note
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-5 min-h-[600px]">
                {/* Notes List */}
                <div className="col-span-2 flex flex-col gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="space-y-1 overflow-y-auto">
                        {notes.length === 0 && (
                            <div className="text-center p-10 text-muted-foreground text-sm border border-dashed rounded-xl border-border bg-card">
                                No notes yet. Create your first note!
                            </div>
                        )}
                        {pinned.length > 0 && (
                            <>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1">📌 Pinned</p>
                                {pinned.map(n => (
                                    <NoteCard key={n.id} note={n}
                                        color={getColor(n.id)}
                                        selected={selected?.id === n.id}
                                        onClick={() => selectNote(n)}
                                        onTogglePin={() => togglePin(n.id, n.pinned)}
                                        onDelete={() => deleteNote(n.id)} />
                                ))}
                                <div className="border-t border-border my-2" />
                            </>
                        )}
                        {all.length > 0 && <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1">All Notes</p>}
                        {all.map(n => (
                            <NoteCard key={n.id} note={n}
                                color={getColor(n.id)}
                                selected={selected?.id === n.id}
                                onClick={() => selectNote(n)}
                                onTogglePin={() => togglePin(n.id, n.pinned)}
                                onDelete={() => deleteNote(n.id)} />
                        ))}
                    </div>
                </div>

                {/* Note Editor */}
                <Card className="col-span-3">
                    {selected ? (
                        <>
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex items-center justify-between">
                                    {isEditing ? (
                                        <input
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            className="text-lg font-bold bg-transparent border-b-2 border-primary focus:outline-none flex-1 mr-4"
                                            placeholder="Note Title"
                                        />
                                    ) : (
                                        <h2 className="text-lg font-bold">{selected.title}</h2>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button onClick={saveEdit} size="sm" className="gradient-brand border-0 text-white rounded-lg">Save</Button>
                                                <Button onClick={() => { setIsEditing(false); setEditTitle(selected.title); setEditContent(selected.content); }} variant="ghost" size="sm" className="rounded-lg">Cancel</Button>
                                            </>
                                        ) : (
                                            <Button onClick={startEdit} variant="outline" size="sm" className="rounded-lg">Edit</Button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {(selected.tags || []).map(t => (
                                        <span key={t} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                            <Tag className="h-2.5 w-2.5" />{t}
                                        </span>
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        Last edited: {new Date(selected.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 h-full">
                                {isEditing ? (
                                    <textarea
                                        value={editContent}
                                        onChange={e => setEditContent(e.target.value)}
                                        className="w-full h-full min-h-[400px] bg-transparent text-sm font-sans resize-none focus:outline-none text-foreground"
                                        placeholder="Start typing your note here..."
                                    />
                                ) : (
                                    <div className="text-sm text-foreground font-sans whitespace-pre-wrap leading-relaxed min-h-[400px]">
                                        {selected.content || <span className="text-muted-foreground italic">Empty note. Click edit to begin writing.</span>}
                                    </div>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex flex-col items-center justify-center h-full text-center py-20 min-h-[500px]">
                            <StickyNote className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <p className="text-muted-foreground">Select a note from the sidebar or click <br />"New Note" to begin</p>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}

function NoteCard({ note, color, selected, onClick, onTogglePin, onDelete }: {
    note: Note; color: string; selected: boolean;
    onClick: () => void; onTogglePin: () => void; onDelete: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`group p-3 rounded-xl border-l-4 cursor-pointer transition-all ${color} ${selected ? "bg-primary/10 border-y border-r border-primary/20" : "bg-card border-y border-r border-border hover:bg-accent/50"}`}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold truncate">{note.title || "Untitled"}</p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={e => { e.stopPropagation(); onTogglePin(); }} className="p-1 hover:text-primary transition-colors rounded">
                        <Pin className={`h-3 w-3 ${note.pinned ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-500 transition-colors rounded">
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                    </button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content || "Empty note."}</p>
            <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(note.updated_at).toLocaleDateString()}</p>
        </div>
    );
}
