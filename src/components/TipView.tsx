import React from 'react';
import { Lightbulb, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface TipViewProps {
  onBackToFocus?: () => void;
  topic?: string;
}

export const TipView: React.FC<TipViewProps> = ({ onBackToFocus, topic }) => {
  return (
    <main className="flex-1 min-h-0 px-4 md:px-8 py-6 md:py-8 flex flex-col items-center justify-start max-w-3xl w-full mx-auto select-none overflow-y-auto custom-scrollbar">
      {/* Back to Focus navigation link */}
      {onBackToFocus && (
        <div className="w-full flex items-center justify-start mb-6 shrink-0">
          <button
            onClick={onBackToFocus}
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716A] hover:text-[#DA7756] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Focus</span>
          </button>
        </div>
      )}

      {/* Placeholder content card */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full my-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-16 h-16 rounded-3xl bg-[#F5F0E8] border border-[#E6DFD5] flex items-center justify-center text-[#DA7756] mb-5 shadow-xs"
        >
          <Lightbulb className="w-8 h-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
          className="w-full"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6DFD5]/50 text-xs font-semibold text-[#78716A] mb-3 border border-[#E6DFD5]">
            <Sparkles className="w-3.5 h-3.5 text-[#DA7756]" />
            <span>Today's Topic: {topic || 'Mindful Insight'}</span>
          </div>
          <h2 className="text-2xl font-serif-accent italic text-[#2D2A26] mb-2">
            Daily Tips & Insights
          </h2>
          <p className="text-sm text-[#78716A] leading-relaxed">
            A calm space for daily wisdom, mindful focus advice, and productivity reflections. Content coming soon.
          </p>
        </motion.div>
      </div>
    </main>
  );
};
