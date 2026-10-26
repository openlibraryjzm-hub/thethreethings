import React, { useRef, useEffect } from 'react';
import { Goal } from '../types';
import { Trash2, RotateCcw, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { SlideToComplete } from './SlideToComplete';
import { playCompletionSound } from '../utils/sound';

interface GoalCardProps {
  goal: Goal;
  index: number;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onCompleteGoal: (id: string) => void;
  onClearGoal: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index,
  onUpdateGoal,
  onCompleteGoal,
  onClearGoal,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
    }
  }, [goal.title]);

  const handleComplete = () => {
    if (goal.isCompleted) return;

    // Play tactile acoustic celebratory sound
    playCompletionSound();

    // Trigger celebration confetti with warm tones
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#DA7756', '#6E8B74', '#F5F0E8', '#C86446'],
      disableForReducedMotion: true,
    });

    onCompleteGoal(goal.id);
  };

  const handleNewGoal = () => {
    onClearGoal(goal.id);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 border h-full ${
        goal.isCompleted
          ? 'bg-[#F0F4F1]/90 border-[#6E8B74]/30 shadow-xs'
          : 'bg-white border-[#E6DFD5] shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-serif-accent font-bold text-[#DA7756]/80 italic">
            {indexLabel}
          </span>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#78716A]/70">
            {goal.isCompleted ? 'Completed' : 'Current Goal'}
          </span>
        </div>

        <button
          onClick={() => onClearGoal(goal.id)}
          className="p-2 text-[#78716A]/50 hover:text-[#DA7756] hover:bg-[#FAF7F2] rounded-2xl transition-colors cursor-pointer"
          title="Clear card contents"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Goal Title Input Area */}
      <div className="my-5 flex-1 flex flex-col justify-center">
        {goal.isCompleted ? (
          <div className="py-2">
            <p className="text-xl font-semibold text-[#2D2A26]/70 line-through decoration-[#6E8B74] decoration-2 leading-relaxed">
              {goal.title || 'Untitled Goal'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E8B74]/15 text-[#6E8B74] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Completed!</span>
            </div>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={goal.title}
            onChange={(e) => onUpdateGoal(goal.id, { title: e.target.value })}
            placeholder={`What is Goal ${index + 1}?`}
            rows={2}
            className="w-full bg-transparent resize-none border-none outline-none text-xl font-semibold text-[#2D2A26] placeholder-[#78716A]/40 leading-relaxed focus:ring-0"
          />
        )}
      </div>

      {/* Card Footer: Action Controls */}
      <div className="pt-4 border-t border-[#E6DFD5]/60">
        {goal.isCompleted ? (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onUpdateGoal(goal.id, { isCompleted: false })}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] text-xs font-semibold text-[#78716A] hover:text-[#2D2A26] transition-all cursor-pointer shadow-2xs"
              title="Keep this goal and mark it incomplete"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Goal</span>
            </button>
            <button
              onClick={handleNewGoal}
              className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-[#DA7756] hover:bg-[#C86446] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Clear this slot to start a blank new goal"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Goal</span>
            </button>
          </div>
        ) : (
          <SlideToComplete
            onComplete={handleComplete}
            disabled={!goal.title.trim()}
          />
        )}
      </div>
    </motion.div>
  );
};
