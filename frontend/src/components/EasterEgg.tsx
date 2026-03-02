"use client";
import { useEffect } from "react";

const KONAMI_TRIGGER = "tulasiai";

export default function EasterEgg() {
    useEffect(() => {
        let typed = "";
        const handler = (e: KeyboardEvent) => {
            typed += e.key.toLowerCase();
            if (typed.includes(KONAMI_TRIGGER)) {
                triggerAntigravity();
                typed = "";
            }
            if (typed.length > 20) typed = typed.slice(-10);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    function triggerAntigravity() {
        // Make all elements fall/float
        const elements = document.querySelectorAll("*");
        elements.forEach((el: any) => {
            if (el.style) {
                el.style.transition = "transform 2s ease-in-out";
                el.style.transform = `translateY(-${Math.random() * 300}px) rotate(${Math.random() * 360}deg)`;
            }
        });

        // Easter egg message
        setTimeout(() => {
            alert("🌿 Tulasi AI - Defying Gravity Since 2024! 🚀");
            location.reload();
        }, 2000);
    }

    return null;
}
