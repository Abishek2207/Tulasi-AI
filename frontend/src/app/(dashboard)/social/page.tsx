"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Send, Plus, Hash, Film } from "lucide-react";

interface GroupMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
}

const SAMPLE_GROUPS = [
    { id: "1", name: "DSA Warriors", members: 24, description: "Daily DSA practice" },
    { id: "2", name: "AI Study Circle", members: 18, description: "ML & AI discussions" },
    { id: "3", name: "Web Dev Hub", members: 31, description: "Full-stack web development" },
    { id: "4", name: "Interview Prep", members: 15, description: "Mock interviews & tips" },
];

const REELS = [
    { id: 1, title: "Binary Search Explained in 60s", channel: "CodeWithTulasi", views: "12K", category: "DSA" },
    { id: 2, title: "How GPT Works - Simple Explanation", channel: "AI Academy", views: "45K", category: "AI" },
    { id: 3, title: "Build a REST API in 5 Minutes", channel: "FastAPI Pro", views: "8K", category: "Backend" },
    { id: 4, title: "CSS Grid vs Flexbox", channel: "WebDev Tips", views: "22K", category: "Frontend" },
    { id: 5, title: "Docker for Beginners", channel: "DevOps Daily", views: "15K", category: "DevOps" },
    { id: 6, title: "System Design: URL Shortener", channel: "DesignGuru", views: "33K", category: "System Design" },
];

export default function SocialPage() {
    const [activeTab, setActiveTab] = useState<"groups" | "reels">("groups");
    const [selectedGroup, setSelectedGroup] = useState(SAMPLE_GROUPS[0]);
    const [messages, setMessages] = useState<GroupMessage[]>([
        { id: "1", sender: "Alice", content: "Has anyone solved the graph problem from yesterday?", timestamp: new Date() },
        { id: "2", sender: "You", content: "Yes! I used BFS for that one.", timestamp: new Date() },
        { id: "3", sender: "Bob", content: "Can you share the approach?", timestamp: new Date() },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;
        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender: "You", content: newMessage, timestamp: new Date() },
        ]);
        setNewMessage("");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Social Learning</h1>
                    <p className="text-muted-foreground">Study groups and educational content.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === "groups" ? "default" : "outline"}
                        onClick={() => setActiveTab("groups")}
                    >
                        <Users className="h-4 w-4 mr-2" /> Groups
                    </Button>
                    <Button
                        variant={activeTab === "reels" ? "default" : "outline"}
                        onClick={() => setActiveTab("reels")}
                    >
                        <Film className="h-4 w-4 mr-2" /> Reels
                    </Button>
                </div>
            </div>

            {activeTab === "groups" && (
                <div className="flex h-[calc(100vh-12rem)] gap-4">
                    {/* Group List */}
                    <div className="w-72 flex flex-col gap-2">
                        <Button variant="outline" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" /> Create Group
                        </Button>
                        {SAMPLE_GROUPS.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => setSelectedGroup(group)}
                                className={`text-left rounded-lg border p-3 transition-colors hover:bg-accent ${selectedGroup.id === group.id ? "bg-accent border-primary" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-sm">{group.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {group.members} members · {group.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Chat Area */}
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Hash className="h-4 w-4" /> {selectedGroup.name}
                                <span className="text-xs text-muted-foreground font-normal ml-2">
                                    {selectedGroup.members} members
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.sender === "You" ? "justify-end" : ""}`}>
                                        {msg.sender !== "You" && (
                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                                                {msg.sender[0]}
                                            </div>
                                        )}
                                        <div
                                            className={`rounded-2xl px-4 py-2 max-w-[70%] text-sm ${msg.sender === "You"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                }`}
                                        >
                                            {msg.sender !== "You" && (
                                                <p className="text-xs font-medium mb-1">{msg.sender}</p>
                                            )}
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="border-t p-4">
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                className="flex gap-2"
                            >
                                <Input
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === "reels" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {REELS.map((reel) => (
                        <Card key={reel.id} className="hover:border-primary transition-colors cursor-pointer">
                            <CardContent className="pt-6">
                                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-4">
                                    <Film className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="font-medium text-sm">{reel.title}</h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">{reel.channel}</span>
                                    <span className="text-xs text-muted-foreground">{reel.views} views</span>
                                </div>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">
                                    {reel.category}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
