"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, RotateCcw, Star } from "lucide-react";

const ROLES = [
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "AI/ML Engineer",
    "Data Scientist",
    "DevOps Engineer",
];

const QUESTION_BANK: Record<string, string[]> = {
    "Frontend Developer": [
        "Explain the Virtual DOM and its benefits.",
        "What is the difference between CSR, SSR, and SSG?",
        "How does React's reconciliation algorithm work?",
        "Explain CSS specificity and the cascade.",
        "What is a closure in JavaScript?",
    ],
    "Backend Developer": [
        "Explain RESTful API design principles.",
        "What is the difference between SQL and NoSQL databases?",
        "How do you handle authentication and authorization?",
        "Explain microservices architecture.",
        "What are database indexes, and when should you use them?",
    ],
    "AI/ML Engineer": [
        "Explain the bias-variance tradeoff.",
        "What is backpropagation?",
        "How do transformers work in NLP?",
        "What is the difference between supervised and unsupervised learning?",
        "Explain the concept of attention mechanisms.",
    ],
    "Data Scientist": [
        "What is the difference between precision and recall?",
        "How do you handle missing data?",
        "Explain cross-validation.",
        "What is feature engineering?",
        "How do you detect and handle outliers?",
    ],
    "Full-Stack Developer": [
        "What is the difference between REST and GraphQL?",
        "Explain WebSockets and real-time communication.",
        "How do you optimize web performance?",
        "What are JWTs, and how are they used for auth?",
        "Explain CI/CD pipelines.",
    ],
    "DevOps Engineer": [
        "Explain Docker containers vs virtual machines.",
        "What is Kubernetes and why is it used?",
        "How do you set up a CI/CD pipeline?",
        "Explain infrastructure as code.",
        "What is observability in distributed systems?",
    ],
};

interface Evaluation {
    score: number;
    feedback: string;
}

export default function InterviewsPage() {
    const [selectedRole, setSelectedRole] = useState("");
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);

    const questions = selectedRole ? QUESTION_BANK[selectedRole] || [] : [];

    const startInterview = (role: string) => {
        setSelectedRole(role);
        setCurrentQIndex(0);
        setAnswer("");
        setEvaluation(null);
        setInterviewStarted(true);
        setCompletedCount(0);
    };

    const handleVoiceRecord = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (!win.webkitSpeechRecognition && !win.SpeechRecognition) {
            alert("Speech recognition not supported.");
            return;
        }
        setIsRecording(!isRecording);
        if (!isRecording) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
            const recognition = new SpeechRecognitionCtor();
            recognition.lang = "en-US";
            recognition.interimResults = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                setAnswer((prev) => prev + " " + event.results[0][0].transcript);
                setIsRecording(false);
            };
            recognition.onerror = () => setIsRecording(false);
            recognition.onend = () => setIsRecording(false);
            recognition.start();
        }
    };

    const submitAnswer = async () => {
        setIsLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/api/v1/interview/evaluate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: selectedRole,
                    question: questions[currentQIndex],
                    answer,
                }),
            });
            const data = await res.json();
            setEvaluation({ score: data.score, feedback: data.feedback });
        } catch {
            // Offline evaluation fallback
            const wordCount = answer.trim().split(/\s+/).length;
            const score = Math.min(10, Math.max(1, Math.round(wordCount / 5)));
            setEvaluation({
                score,
                feedback:
                    wordCount < 10
                        ? "Your answer is too brief. Try to elaborate with examples and deeper explanations."
                        : wordCount < 30
                            ? "Decent answer, but consider adding more technical depth."
                            : "Good answer! Try to also mention real-world applications or tradeoffs.",
            });
        }
        setCompletedCount((c) => c + 1);
        setIsLoading(false);
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex((i) => i + 1);
            setAnswer("");
            setEvaluation(null);
        }
    };

    if (!interviewStarted) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mock Interviews</h1>
                    <p className="text-muted-foreground">
                        Practice role-specific interviews with AI evaluation.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {ROLES.map((role) => (
                        <Card key={role} className="hover:border-primary transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-base">{role}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {QUESTION_BANK[role]?.length || 5} practice questions
                                </p>
                                <Button onClick={() => startInterview(role)} className="w-full">
                                    Start Interview
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{selectedRole} Interview</h1>
                    <p className="text-sm text-muted-foreground">
                        Question {currentQIndex + 1} of {questions.length} · {completedCount} answered
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setInterviewStarted(false)}
                >
                    <RotateCcw className="h-4 w-4 mr-2" /> Change Role
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{questions[currentQIndex]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type or speak your answer..."
                        className="w-full min-h-[150px] p-3 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                        <Button
                            variant={isRecording ? "destructive" : "outline"}
                            onClick={handleVoiceRecord}
                        >
                            {isRecording ? (
                                <MicOff className="h-4 w-4 mr-2" />
                            ) : (
                                <Mic className="h-4 w-4 mr-2" />
                            )}
                            {isRecording ? "Stop Recording" : "Voice Answer"}
                        </Button>
                        <Button
                            onClick={submitAnswer}
                            disabled={!answer.trim() || isLoading}
                            className="flex-1"
                        >
                            {isLoading ? "Evaluating..." : "Submit Answer"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {evaluation && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            Score:
                            <div className="flex">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < evaluation.score
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-muted-foreground"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xl font-bold ml-2">
                                {evaluation.score}/10
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{evaluation.feedback}</p>
                        {currentQIndex < questions.length - 1 && (
                            <Button onClick={nextQuestion} className="mt-4">
                                Next Question →
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
