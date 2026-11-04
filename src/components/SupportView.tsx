import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SupportView: React.FC = () => {
  return (
    <main className="flex-1 min-h-0 px-8 py-12 flex flex-col items-center justify-center max-w-7xl w-full mx-auto text-center select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-16 h-16 rounded-3xl bg-[#F5F0E8] border border-[#E6DFD5] flex items-center justify-center text-[#DA7756] mb-5 shadow-xs"
      >
        <Heart className="w-8 h-8 fill-[#DA7756]/20 text-[#DA7756]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
        className="max-w-md"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6DFD5]/50 text-xs font-semibold text-[#78716A] mb-3 border border-[#E6DFD5]">
          <Sparkles className="w-3.5 h-3.5 text-[#DA7756]" />
          <span>Placeholder</span>
        </div>
        <h2 className="text-2xl font-serif-accent italic text-[#2D2A26] mb-2">
          Support The Project
        </h2>
        <p className="text-sm text-[#78716A] leading-relaxed">
          Thank you for using The Three Things. Support links, feedback channels, and creator appreciation will be hosted here soon.
        </p>
      </motion.div>
    </main>
  );
};
