"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";

const ROADMAPS = [
    {
        role: "AI/ML Engineer",
        color: "from-purple-500 to-indigo-600",
        tasks: [
            { id: 1, title: "Python Fundamentals", done: true },
            { id: 2, title: "NumPy & Pandas", done: true },
            { id: 3, title: "Statistics & Probability", done: true },
            { id: 4, title: "Linear Algebra", done: false },
            { id: 5, title: "Scikit-Learn (ML Basics)", done: false },
            { id: 6, title: "Deep Learning (PyTorch/TF)", done: false },
            { id: 7, title: "NLP Fundamentals", done: false },
            { id: 8, title: "Computer Vision", done: false },
            { id: 9, title: "LLMs & Transformers", done: false },
            { id: 10, title: "MLOps & Deployment", done: false },
        ],
    },
    {
        role: "Full-Stack Web Developer",
        color: "from-blue-500 to-cyan-600",
        tasks: [
            { id: 1, title: "HTML & CSS", done: true },
            { id: 2, title: "JavaScript ES6+", done: true },
            { id: 3, title: "React.js / Next.js", done: false },
            { id: 4, title: "TypeScript", done: false },
            { id: 5, title: "Node.js / Express", done: false },
            { id: 6, title: "Databases (SQL, NoSQL)", done: false },
            { id: 7, title: "REST & GraphQL APIs", done: false },
            { id: 8, title: "Authentication & Security", done: false },
            { id: 9, title: "Cloud & Deployment", done: false },
            { id: 10, title: "System Design", done: false },
        ],
    },
    {
        role: "Data Scientist",
        color: "from-green-500 to-emerald-600",
        tasks: [
            { id: 1, title: "Python for Data Science", done: true },
            { id: 2, title: "Exploratory Data Analysis", done: true },
            { id: 3, title: "Data Visualization", done: false },
            { id: 4, title: "Feature Engineering", done: false },
            { id: 5, title: "Supervised Learning", done: false },
            { id: 6, title: "Unsupervised Learning", done: false },
            { id: 7, title: "Time Series Analysis", done: false },
            { id: 8, title: "Big Data Tools", done: false },
            { id: 9, title: "Experiment Design (A/B)", done: false },
            { id: 10, title: "Business Intelligence", done: false },
        ],
    },
    {
        role: "DevOps Engineer",
        color: "from-orange-500 to-red-600",
        tasks: [
            { id: 1, title: "Linux & Networking", done: true },
            { id: 2, title: "Git & Version Control", done: true },
            { id: 3, title: "Docker", done: false },
            { id: 4, title: "Kubernetes", done: false },
            { id: 5, title: "CI/CD Pipelines", done: false },
            { id: 6, title: "Infrastructure as Code", done: false },
            { id: 7, title: "Cloud (AWS/GCP/Azure)", done: false },
            { id: 8, title: "Monitoring & Logging", done: false },
            { id: 9, title: "Security Hardening", done: false },
            { id: 10, title: "SRE Practices", done: false },
        ],
    },
];

export default function RoadmapsPage() {
    const [selectedRoadmap, setSelectedRoadmap] = useState(ROADMAPS[0]);
    const [tasks, setTasks] = useState(selectedRoadmap.tasks);

    const handleSelect = (roadmap: (typeof ROADMAPS)[0]) => {
        setSelectedRoadmap(roadmap);
        setTasks(roadmap.tasks);
    };

    const toggleTask = (id: number) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        );
    };

    const progress = Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Career Roadmaps</h1>
                <p className="text-muted-foreground">
                    Structured learning paths for your career goals.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {ROADMAPS.map((rm) => (
                    <button key={rm.role} onClick={() => handleSelect(rm)} className="text-left">
                        <Card
                            className={`transition-all hover:scale-[1.02] ${selectedRoadmap.role === rm.role ? "ring-2 ring-primary" : ""
                                }`}
                        >
                            <CardHeader className="pb-2">
                                <div className={`h-2 w-full rounded-full bg-gradient-to-r ${rm.color} mb-2`} />
                                <CardTitle className="text-sm">{rm.role}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    {Math.round(
                                        (rm.tasks.filter((t) => t.done).length / rm.tasks.length) * 100
                                    )}
                                    %
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {rm.tasks.filter((t) => t.done).length}/{rm.tasks.length} completed
                                </p>
                            </CardContent>
                        </Card>
                    </button>
                ))}
            </div>

            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle>{selectedRoadmap.role}</CardTitle>
                        <span className="text-sm font-medium text-primary">{progress}% Complete</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                            className={`h-2 rounded-full bg-gradient-to-r ${selectedRoadmap.color} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-2">
                        {tasks.map((task, index) => (
                            <Button
                                key={task.id}
                                variant="ghost"
                                className={`w-full justify-start h-auto py-3 px-4 ${task.done ? "text-muted-foreground" : ""
                                    }`}
                                onClick={() => toggleTask(task.id)}
                            >
                                <span className="w-8 text-xs text-muted-foreground">{index + 1}.</span>
                                {task.done ? (
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" />
                                ) : (
                                    <Circle className="h-4 w-4 mr-3 shrink-0" />
                                )}
                                <span className={task.done ? "line-through" : ""}>{task.title}</span>
                                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
