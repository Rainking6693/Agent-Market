"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  text?: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function GlitchHeadline({ text, label, children, className = "" }: Props) {
  const [isGlitching, setIsGlitching] = useState(true);
  const displayText = text || children;

  useEffect(() => {
    const timer = setTimeout(() => setIsGlitching(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const gradientStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #94A3B8 0%, #E2E8F0 25%, #FFFFFF 50%, #E2E8F0 75%, #94A3B8 100%)",
    backgroundSize: "200% 200%",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  return (
    <div>
      {label && <p className="text-xs tracking-widest text-slate-500 uppercase mb-4">{label}</p>}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {isGlitching ? (
          <motion.span
            animate={{ opacity: [1, 0.3, 1, 0.5, 1, 0.2, 1], x: [0, -2, 2, -1, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.1, 0.2, 0.4, 0.6, 0.8, 1] }}
            style={gradientStyle}
          >
            {displayText}
          </motion.span>
        ) : (
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={gradientStyle}
          >
            {displayText}
          </motion.span>
        )}
      </motion.h1>
    </div>
  );
}
