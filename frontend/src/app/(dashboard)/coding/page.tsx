"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Play, RotateCcw } from "lucide-react";

const LANGUAGES = [
    { value: "python", label: "Python", defaultCode: 'print("Hello, Tulasi AI!")' },
    { value: "javascript", label: "JavaScript", defaultCode: 'console.log("Hello, Tulasi AI!");' },
    { value: "java", label: "Java", defaultCode: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Tulasi AI!");\n  }\n}' },
    { value: "cpp", label: "C++", defaultCode: '#include <iostream>\nint main() {\n  std::cout << "Hello, Tulasi AI!" << std::endl;\n  return 0;\n}' },
    { value: "typescript", label: "TypeScript", defaultCode: 'const greeting: string = "Hello, Tulasi AI!";\nconsole.log(greeting);' },
];

const SAMPLE_PROBLEMS = [
    { id: 1, title: "Two Sum", difficulty: "Easy", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." },
    { id: 2, title: "Reverse String", difficulty: "Easy", description: "Write a function that reverses a string. The input string is given as an array of characters." },
    { id: 3, title: "Valid Parentheses", difficulty: "Easy", description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid." },
    { id: 4, title: "Merge Two Sorted Lists", difficulty: "Medium", description: "You are given the heads of two sorted linked lists list1 and list2." },
    { id: 5, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", description: "Given a string s, find the length of the longest substring without repeating characters." },
    { id: 6, title: "Container With Most Water", difficulty: "Medium", description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container with the most water." },
    { id: 7, title: "Trapping Rain Water", difficulty: "Hard", description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining." },
];

export default function CodingPage() {
    const [selectedLang, setSelectedLang] = useState("python");
    const [code, setCode] = useState(LANGUAGES[0].defaultCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [selectedProblem, setSelectedProblem] = useState(SAMPLE_PROBLEMS[0]);
    const [difficultyFilter, setDifficultyFilter] = useState("All");

    const handleLangChange = (lang: string) => {
        setSelectedLang(lang);
        const found = LANGUAGES.find((l) => l.value === lang);
        if (found) setCode(found.defaultCode);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Running...");
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/v1/code/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: selectedLang, code }),
            });
            const data = await res.json();
            setOutput(data.output || data.error || "Execution complete.");
        } catch {
            // Fallback: use Piston public API directly
            try {
                const langVersionMap: Record<string, string> = {
                    python: "3.10.0", javascript: "18.15.0", java: "15.0.2",
                    cpp: "10.2.0", typescript: "5.0.3",
                };
                const langNameMap: Record<string, string> = {
                    python: "python3", javascript: "javascript", java: "java",
                    cpp: "c++", typescript: "typescript",
                };
                const res = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        language: langNameMap[selectedLang] || selectedLang,
                        version: langVersionMap[selectedLang] || "*",
                        files: [{ content: code }],
                    }),
                });
                const data = await res.json();
                setOutput(data.run?.output || data.run?.stderr || "Execution complete.");
            } catch {
                setOutput("Error: Could not connect to any code execution service.");
            }
        }
        setIsRunning(false);
    };

    const filteredProblems =
        difficultyFilter === "All"
            ? SAMPLE_PROBLEMS
            : SAMPLE_PROBLEMS.filter((p) => p.difficulty === difficultyFilter);

    return (
        <div className="flex h-[calc(100vh-7rem)] gap-4">
            {/* Problem List Sidebar */}
            <div className="hidden lg:flex w-80 flex-col gap-4">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-sm">Problems</CardTitle>
                        <div className="flex gap-2 mt-2">
                            {["All", "Easy", "Medium", "Hard"].map((d) => (
                                <Button
                                    key={d}
                                    variant={difficultyFilter === d ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={() => setDifficultyFilter(d)}
                                >
                                    {d}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pt-3">
                        <div className="space-y-2">
                            {filteredProblems.map((p) => (
                                <button
                                    key={p.id}
                                    className={`w-full text-left rounded-lg border p-3 text-sm hover:bg-accent transition-colors ${selectedProblem.id === p.id ? "bg-accent border-primary" : ""
                                        }`}
                                    onClick={() => setSelectedProblem(p)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{p.title}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${p.difficulty === "Easy"
                                                    ? "bg-green-500/20 text-green-500"
                                                    : p.difficulty === "Medium"
                                                        ? "bg-yellow-500/20 text-yellow-500"
                                                        : "bg-red-500/20 text-red-500"
                                                }`}
                                        >
                                            {p.difficulty}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Problem Description */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{selectedProblem.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{selectedProblem.description}</p>
                    </CardContent>
                </Card>

                {/* Code Editor */}
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Select value={selectedLang} onValueChange={handleLangChange}>
                                <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map((l) => (
                                        <SelectItem key={l.value} value={l.value}>
                                            {l.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const found = LANGUAGES.find((l) => l.value === selectedLang);
                                    if (found) setCode(found.defaultCode);
                                    setOutput("");
                                }}
                            >
                                <RotateCcw className="h-3 w-3 mr-1" /> Reset
                            </Button>
                            <Button size="sm" onClick={handleRun} disabled={isRunning}>
                                <Play className="h-3 w-3 mr-1" /> {isRunning ? "Running..." : "Run Code"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="flex-1 p-4 bg-background font-mono text-sm resize-none focus:outline-none border-b"
                            spellCheck={false}
                        />
                        <div className="h-32 p-4 bg-muted/30 overflow-y-auto">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Output:</p>
                            <pre className="text-sm font-mono whitespace-pre-wrap">{output || "Run your code to see output here."}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
