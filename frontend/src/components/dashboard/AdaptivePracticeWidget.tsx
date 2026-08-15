"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Send, ChevronRight, CheckCircle2, 
  XCircle, Zap, TrendingUp, TrendingDown,
  Loader2, Sparkles, BookOpen
} from "lucide-react";
import { useSession } from "next-auth/react";

interface Question {
  id: number;
  topic: string;
  content: string;
  difficulty: number;
}

interface LearningMemory {
  topic: string;
  mastery_level: number;
  attempts_count: number;
  correct_count: number;
  wrong_count: number;
}

export function AdaptivePracticeWidget() {
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [memory, setMemory] = useState<LearningMemory | null>(null);
  
  const [userAnswer, setUserAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    is_correct: boolean;
    new_mastery_level: number;
  } | null>(null);

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      setUserAnswer("");
      
      const res = await fetch("/api/v1/practice/next-question");
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setMemory(data.memory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !question) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          user_answer: userAnswer,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, padding: 40, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, color: "rgba(255,255,255,0.5)"
      }}>
        <Loader2 className="animate-spin" size={24} />
        <span style={{ fontSize: 14 }}>Generating adaptive practice...</span>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, padding: 40, textAlign: "center"
      }}>
        Failed to load practice session.
      </div>
    );
  }

  const difficultyColors = ["#10B981", "#34D399", "#FBBF24", "#F59E0B", "#EF4444"];
  const diffColor = difficultyColors[Math.min(4, Math.max(0, question.difficulty - 1))];

  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)",
      border: "1px solid rgba(148,163,184,0.1)",
      borderRadius: 24, overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      fontFamily: "var(--font-outfit)"
    }}>
      
      {/* HEADER */}
      <div style={{
        padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: "rgba(99,102,241,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#818CF8"
          }}>
            <Brain size={20} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Adaptive Practice Engine
            </div>
            <div style={{ fontSize: 18, color: "white", fontWeight: 700 }}>
              {question.topic}
            </div>
          </div>
        </div>
        
        {memory && (
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "rgba(0,0,0,0.2)", padding: "8px 16px", borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.03)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={14} color="#FBBF24" />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                Mastery: <strong>Lvl {memory.mastery_level}</strong>
              </span>
            </div>
            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={14} color="#60A5FA" />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                Difficulty: <strong style={{ color: diffColor }}>Lvl {question.difficulty}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* QUESTION BODY */}
      <div style={{ padding: 32 }}>
        <div style={{ fontSize: 20, color: "white", lineHeight: 1.6, fontWeight: 500, marginBottom: 24 }}>
          {question.content}
        </div>
        
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            >
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Explain your approach or write your answer here..."
                style={{
                  width: "100%", minHeight: 120, padding: 16,
                  background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, color: "white", fontSize: 15,
                  resize: "vertical", outline: "none",
                  fontFamily: "var(--font-inter)", lineHeight: 1.5
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <button
                  onClick={submitAnswer}
                  disabled={submitting || !userAnswer.trim()}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "white", color: "black",
                    padding: "10px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
                    cursor: submitting || !userAnswer.trim() ? "not-allowed" : "pointer",
                    opacity: submitting || !userAnswer.trim() ? 0.5 : 1,
                    border: "none"
                  }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Answer
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              <div style={{
                padding: 24, borderRadius: 16,
                background: feedback.is_correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${feedback.is_correct ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                marginBottom: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  {feedback.is_correct ? 
                    <CheckCircle2 size={24} color="#10B981" /> : 
                    <XCircle size={24} color="#EF4444" />
                  }
                  <span style={{ fontSize: 18, fontWeight: 700, color: feedback.is_correct ? "#10B981" : "#EF4444" }}>
                    {feedback.is_correct ? "Great Job!" : "Needs Improvement"}
                  </span>
                  <span style={{ 
                    marginLeft: "auto", background: "rgba(255,255,255,0.1)", 
                    padding: "4px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "white" 
                  }}>
                    Score: {feedback.score}/100
                  </span>
                </div>
                
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6 }}>
                  {feedback.feedback}
                </p>
                
                {memory && feedback.new_mastery_level !== memory.mastery_level && (
                  <div style={{ 
                    marginTop: 16, padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 10,
                    display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "white"
                  }}>
                    {feedback.new_mastery_level > memory.mastery_level ? (
                      <><TrendingUp size={16} color="#10B981" /> Mastery Level Increased to {feedback.new_mastery_level}!</>
                    ) : (
                      <><TrendingDown size={16} color="#F59E0B" /> Mastery Level Adjusted to {feedback.new_mastery_level}. Don't worry, we'll practice more.</>
                    )}
                  </div>
                )}
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={fetchNextQuestion}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white",
                    padding: "10px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
                    cursor: "pointer", border: "none", boxShadow: "0 4px 12px rgba(99,102,241,0.3)"
                  }}
                >
                  <Sparkles size={16} />
                  Next Question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
