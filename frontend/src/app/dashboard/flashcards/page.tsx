"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatApi, extractAndParseJson } from "@/lib/api";
import { BrainCircuit, Sparkles, Wand2, TerminalSquare, RotateCw, ArrowLeft, ArrowRight } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import toast from "react-hot-toast";

type Flashcard = {
  front: string;
  back: string;
};

// --- Mock Fallback Data ---
const MOCK_FLASHCARDS: Flashcard[] = [
  { front: "What is an event loop?", back: "A programming construct that waits for and dispatches events or messages in a program." },
  { front: "Explain Closure in JS.", back: "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment)." },
  { front: "What is the Big O of Binary Search?", back: "The time complexity of binary search is O(log n) because it halves the search area during each step." },
];

export default function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const prompt = `Generate exactly 5 highly technical flashcards on the topic of "${topic}". 
Format strictly as a JSON array of objects with "front" and "back" keys. Example:
[{"front": "Question?", "back": "Answer"}]
Return ONLY the JSON array, no markdown backticks, no explanatory text.`;

      const res = await chatApi.send(prompt, undefined, "flashcards");
      // Use resilient parsing
      let parsedData = extractAndParseJson<any>(res.response, []);
      
      // If AI wrapped the array in an object like { "flashcards": [...] }
      if (parsedData && !Array.isArray(parsedData) && typeof parsedData === 'object') {
        const potentialArray = Object.values(parsedData).find(val => Array.isArray(val));
        if (potentialArray) parsedData = potentialArray;
      }

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        setCards(parsedData);
        toast.success("AI Flashcards Generated!");
      } else {
        console.error("[Flashcards] Generation failed. Raw AI output:", res.response);
        throw new Error("Invalid structure: AI did not return a valid list of cards. Check console for details.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "Failed to sync with AI Neural Link.");
      setCards(MOCK_FLASHCARDS);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 64 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "linear-gradient(135deg, #FF0080, #7928CA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(255,0,128,0.3)"
          }}>
            <BrainCircuit size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-outfit)", letterSpacing: "-0.5px", margin: 0 }}>
              AI Flashcard Studio
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "4px 0 0" }}>
              Generate smart, flippable study decks for any technical topic.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input Form */}
      <TiltCard>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ padding: 32, marginBottom: 48, position: "relative", overflow: "hidden" }}
        >
          <div style={{
            position: "absolute", top: -50, right: -50, width: 150, height: 150,
            background: "radial-gradient(circle, rgba(121,40,202,0.2) 0%, transparent 70%)",
            filter: "blur(30px)", zIndex: 0
          }} />

          <form onSubmit={handleGenerate} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <TerminalSquare size={16} color="#FF0080" /> What do you want to learn?
            </label>
            <div style={{ display: "flex", gap: 16, position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Docker Networking, React Hooks, System Architecture..."
                disabled={loading}
                style={{
                  flex: 1, padding: "16px 20px", borderRadius: 14,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", fontSize: 15, fontFamily: "var(--font-inter)",
                  outline: "none", transition: "all 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#FF0080"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="btn-primary"
                style={{
                  background: "linear-gradient(135deg, #FF0080, #7928CA)",
                  boxShadow: "0 4px 14px rgba(255,0,128,0.3)",
                  padding: "0 28px", borderRadius: 14, cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !topic.trim() ? 0.6 : 1, display: "flex", alignItems: "center", gap: 8,
                  border: "none", color: "white", fontWeight: 600
                }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={18} />
                  </motion.div>
                ) : (
                  <><Wand2 size={18} /> Generate</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </TiltCard>

      {/* Loading Skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card" style={{ padding: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#7928CA", filter: "blur(18px)" }} />
            </motion.div>
            <p style={{ color: "var(--text-muted)", fontSize: 16, fontWeight: 500, animation: "pulse 2s infinite" }}>
              Synthesizing flashcards for {topic}...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Flippable Flashcard UI */}
      {!loading && cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{ perspective: 1500, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16, fontWeight: 600, letterSpacing: 1 }}>
            CARD {currentIndex + 1} OF {cards.length}
          </div>

          <motion.div
            style={{
              width: "100%", maxWidth: 600, height: 350, position: "relative",
              transformStyle: "preserve-3d", cursor: "pointer",
            }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={() => setFlipped(!flipped)}
          >
            {/* Front of Card */}
            <div
              className="glass-card"
              style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 40, textAlign: "center", border: "1px solid rgba(255,0,128,0.3)",
                background: "radial-gradient(circle at center, rgba(39,39,42,0.8) 0%, rgba(24,24,27,0.95) 100%)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
              }}
            >
              <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "white", lineHeight: 1.4 }}>
                {cards[currentIndex].front}
              </h2>
              <div style={{ position: "absolute", bottom: 24, display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12 }}>
                <RotateCw size={14} /> Tap to flip
              </div>
            </div>

            {/* Back of Card */}
            <div
              className="glass-card"
              style={{
                position: "absolute", inset: 0, backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 40, textAlign: "center", border: "1px solid rgba(121,40,202,0.3)",
                background: "radial-gradient(circle at center, rgba(121,40,202,0.1) 0%, rgba(24,24,27,0.95) 100%)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
              }}
            >
              <p style={{ fontSize: "clamp(18px, 3vw, 22px)", color: "var(--text-primary)", lineHeight: 1.7, fontWeight: 500 }}>
                {cards[currentIndex].back}
              </p>
              <div style={{ position: "absolute", bottom: 24, display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12 }}>
                <RotateCw size={14} /> Tap to flip back
              </div>
            </div>
          </motion.div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="btn-ghost"
              style={{
                width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                opacity: currentIndex === 0 ? 0.3 : 1, cursor: currentIndex === 0 ? "not-allowed" : "pointer"
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
              className="btn-primary"
              style={{
                width: 54, height: 54, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                opacity: currentIndex === cards.length - 1 ? 0.3 : 1, cursor: currentIndex === cards.length - 1 ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #FF0080, #7928CA)", boxShadow: "0 4px 14px rgba(255,0,128,0.3)", padding: 0
              }}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
