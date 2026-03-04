"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Send,
    Upload,
    Bot,
    User,
    Mic,
    MicOff,
    Volume2,
    FileText,
    Sparkles,
} from "lucide-react";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
}

export default function LearningPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content:
                "Hello! I'm Tulasi AI. Upload a PDF or ask me anything about your studies. I support multilingual explanations and voice input/output. 🎓",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/v1/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: inputValue }),
            });
            const data = await res.json();
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: data.response || "I'm still learning! My backend isn't connected yet.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "ai",
                    content:
                        "I couldn't reach the backend. Please make sure the API server is running.",
                    timestamp: new Date(),
                },
            ]);
        }
        setIsLoading(false);
    };

    const handleVoiceToggle = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (!win.webkitSpeechRecognition && !win.SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }
        setIsListening(!isListening);
        if (!isListening) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
            const recognition = new SpeechRecognitionCtor();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognition.start();
        }
    };

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        speechSynthesis.speak(utterance);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFiles((prev) => [...prev, file.name]);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await fetch(`${API_URL}/api/v1/ai/upload`, {
                method: "POST",
                body: formData,
            });
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "ai",
                    content: `📄 "${file.name}" uploaded and processed! You can now ask questions about it.`,
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "ai",
                    content: `File "${file.name}" noted. Backend is not connected yet for processing.`,
                    timestamp: new Date(),
                },
            ]);
        }
    };

    return (
        <div className="flex h-[calc(100vh-7rem)] gap-4">
            {/* Sidebar: Uploaded Documents */}
            <div className="hidden lg:flex w-72 flex-col gap-4">
                <Card className="flex-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Uploaded Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {uploadedFiles.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
                            ) : (
                                uploadedFiles.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2 rounded-md border p-2 text-xs"
                                    >
                                        <FileText className="h-3 w-3 text-blue-500" />
                                        <span className="truncate">{file}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-3 w-3 mr-2" /> Upload PDF
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        AI Learning Assistant
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {msg.role === "ai" && (
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                )}
                                <div
                                    className={`rounded-2xl px-4 py-2.5 max-w-[75%] text-sm ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                        }`}
                                >
                                    {msg.content}
                                    {msg.role === "ai" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 ml-2 inline-flex"
                                            onClick={() => speakText(msg.content)}
                                        >
                                            <Volume2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                {msg.role === "user" && (
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-blue-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                                </div>
                                <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
                <div className="border-t p-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="flex gap-2"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 lg:hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant={isListening ? "destructive" : "outline"}
                            size="icon"
                            className="shrink-0"
                            onClick={handleVoiceToggle}
                        >
                            {isListening ? (
                                <MicOff className="h-4 w-4" />
                            ) : (
                                <Mic className="h-4 w-4" />
                            )}
                        </Button>
                        <Input
                            placeholder="Ask me anything..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" className="shrink-0" disabled={isLoading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
