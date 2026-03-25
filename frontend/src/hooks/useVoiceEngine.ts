"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

interface UseVoiceEngineOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceEngine({ onTranscript, onError }: UseVoiceEngineOptions = {}) {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    synthRef.current = window.speechSynthesis;

    if (supported) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setState("listening");
      recognition.onend = () => {
        if (state === "listening") setState("idle");
      };
      recognition.onerror = (e: any) => {
        setState("error");
        onError?.(e.error);
        setTimeout(() => setState("idle"), 2000);
      };
      recognition.onresult = (e: any) => {
        const interim = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setTranscript(interim);

        if (e.results[e.results.length - 1].isFinal) {
          setState("processing");
          onTranscript?.(interim);
          setTranscript("");
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setState("listening");
    } catch {}
  }, [isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState("idle");
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    // Prefer a natural English voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) => v.lang === "en-US" && !v.name.toLowerCase().includes("compact")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    synthRef.current.speak(utterance);
    setState("speaking");
  }, []);

  const cancelSpeech = useCallback(() => {
    synthRef.current?.cancel();
    setState("idle");
  }, []);

  const toggle = useCallback(() => {
    if (state === "listening") stopListening();
    else startListening();
  }, [state, startListening, stopListening]);

  return {
    state,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    cancelSpeech,
    toggle,
  };
}
