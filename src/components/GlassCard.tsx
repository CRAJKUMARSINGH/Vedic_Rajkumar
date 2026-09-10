// src/components/GlassCard.tsx
import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

// Omit HTML drag events that conflict with framer-motion's onDrag type
type GlassCardProps = Omit<HTMLMotionProps<"div">, "onDrag" | "onDragStart" | "onDragEnd"> & {
  children: React.ReactNode;
  className?: string;
};

/**
 * A reusable card with glass-morphism background, subtle shadow and micro-animations.
 * Uses Tailwind CSS utilities for styling and framer-motion for hover/enter effects.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", ...rest }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, opacity: 1 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 shadow-lg transition-shadow duration-300 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
