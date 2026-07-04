import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
};

export default function VedicAPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <h1 className="text-5xl font-bold drop-shadow-lg">
        🚀 Vedic Feature A - Enhanced Experience
      </h1>
    </motion.div>
  );
}
