"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Raw mouse coordinates (no lag for the dot)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for the trailing ring to create smooth lag
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setMounted(true);
    // Hide default cursor on body
    document.body.style.cursor = "none";

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      if (
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.closest("button") ||
        target.closest("a")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Precise leading dot (no lag) */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div style={{ width: 6, height: 6, background: "white", borderRadius: "50%", boxShadow: "0 0 10px white" }} />
      </motion.div>

      {/* 2. Trailing lerp ring (lag) */}
      <motion.div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 9998,
          pointerEvents: "none",
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          opacity: isHovering ? 0.8 : 0.4,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: isHovering ? "1.5px solid #06B6D4" : "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "50%",
            background: isHovering ? "rgba(6, 182, 212, 0.1)" : "transparent",
            boxShadow: isHovering ? "0 0 20px rgba(6,182,212,0.4)" : "none",
            transition: "all 0.2s ease-out",
          }}
        />
      </motion.div>
    </>
  );
}
