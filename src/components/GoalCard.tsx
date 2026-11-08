import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Goal } from '../types';
import { Trash2, RotateCcw, Plus, Sparkles, Pencil, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { fireCelebrationConfetti } from '../utils/confetti';
import { SlideToComplete } from './SlideToComplete';
import { playCompletionSound } from '../utils/sound';
import { parseSubGoals } from '../utils/subGoals';

interface GoalCardProps {
  goal: Goal;
  index: number;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onCompleteGoal: (
    id: string,
    completedSubGoals?: string[],
    remainingTitle?: string
  ) => void;
  onClearGoal: (id: string) => void;
}

// Relatable, motivating placeholders showing the '//' separator syntax naturally
const PLACEHOLDERS = [
  'e.g. Morning stretch // Brew coffee',
  'e.g. Finish project draft // Clear inbox',
  'e.g. 20 min walk // Call mom',
];

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index,
  onUpdateGoal,
  onCompleteGoal,
  onClearGoal,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sub-goals parsed from '//' separator
  const subGoals = useMemo(() => parseSubGoals(goal.title), [goal.title]);
  const hasSubGoals = subGoals.length >= 2;

  // Selected sub-goals indices for slide completion
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [sliderKey, setSliderKey] = useState<number>(0);

  // Auto-resize textarea to fit content when active
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
    }
  }, [goal.title, isEditing]);

  // Clean up selected indices if sub-goals count decreases
  useEffect(() => {
    setSelectedIndices((prev) => prev.filter((i) => i < subGoals.length));
  }, [subGoals.length]);

  const toggleSubGoal = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleDoneTyping = () => {
    setIsFocused(false);
    setIsEditing(false);
    textareaRef.current?.blur();
  };

  const handleComplete = () => {
    if (goal.isCompleted) return;

    // Play tactile acoustic celebratory sound
    playCompletionSound();

    // Trigger celebration confetti with warm tones
    fireCelebrationConfetti();

    if (hasSubGoals) {
      if (selectedIndices.length > 0) {
        // Individual sub-goals selected: complete selected, keep unselected
        const completedItems = selectedIndices.map((i) => subGoals[i]);
        const remainingItems = subGoals.filter((_, i) => !selectedIndices.includes(i));
        const remainingTitle = remainingItems.join(' // ');

        setSelectedIndices([]);
        setSliderKey((k) => k + 1);

        onCompleteGoal(goal.id, completedItems, remainingTitle);
      } else {
        // Default: treat all sub-goals together as one full completion
        setSelectedIndices([]);
        setSliderKey((k) => k + 1);

        onCompleteGoal(goal.id, subGoals, '');
      }
    } else {
      onCompleteGoal(goal.id);
    }
  };

  const handleClear = () => {
    setSelectedIndices([]);
    setIsEditing(false);
    setIsFocused(false);
    onClearGoal(goal.id);
  };

  const handleNewGoal = () => {
    setSelectedIndices([]);
    setIsEditing(false);
    setIsFocused(false);
    onClearGoal(goal.id);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const indexLabel = String(index + 1).padStart(2, '0');
  const placeholderText = PLACEHOLDERS[index % PLACEHOLDERS.length];

  // Show textarea when no sub-goals exist, or when actively editing/focused
  const shouldShowTextarea = !hasSubGoals || isEditing || isFocused;

  // Determine slide to complete parameters: always enabled by default if text exists
  const isSliderDisabled = !goal.title.trim();
  const disabledLabel = 'Enter a goal to unlock';

  const completeLabel =
    hasSubGoals && selectedIndices.length > 0
      ? selectedIndices.length === 1
        ? 'Slide to complete (1)'
        : `Slide to complete (${selectedIndices.length})`
      : 'Slide to complete';

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

        <div className="flex items-center gap-1">
          {/* Header pencil button: alternative 1-click edit option */}
          {hasSubGoals && !goal.isCompleted && !shouldShowTextarea && (
            <button
              onClick={handleStartEditing}
              className="p-2 text-[#78716A]/50 hover:text-[#DA7756] hover:bg-[#FAF7F2] rounded-2xl transition-colors cursor-pointer"
              title="Edit goal text"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleClear}
            className="p-2 text-[#78716A]/50 hover:text-[#DA7756] hover:bg-[#FAF7F2] rounded-2xl transition-colors cursor-pointer"
            title="Clear card contents"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Goal Content Area: Clicking whitespace enters edit mode */}
      <div
        onClick={() => {
          if (!goal.isCompleted) {
            handleStartEditing();
          }
        }}
        className={`my-5 flex-1 flex flex-col justify-center ${
          goal.isCompleted ? '' : 'cursor-text'
        }`}
      >
        {goal.isCompleted ? (
          /* Completed View: Strikethrough presentation */
          <div className="py-2">
            {hasSubGoals ? (
              <p className="text-xl font-semibold text-[#2D2A26]/70 leading-relaxed">
                {subGoals.map((sub, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className="text-[#6E8B74]/50 font-mono font-normal px-2 select-none">
                        //
                      </span>
                    )}
                    <span className="line-through decoration-[#6E8B74] decoration-2">
                      {sub}
                    </span>
                  </React.Fragment>
                ))}
              </p>
            ) : (
              <p className="text-xl font-semibold text-[#2D2A26]/70 line-through decoration-[#6E8B74] decoration-2 leading-relaxed">
                {goal.title || 'Untitled Goal'}
              </p>
            )}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E8B74]/15 text-[#6E8B74] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Completed!</span>
            </div>
          </div>
        ) : shouldShowTextarea ? (
          /* Textarea Input (while typing, editing, or blank) */
          <textarea
            ref={textareaRef}
            value={goal.title}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleDoneTyping();
              }
            }}
            onChange={(e) => onUpdateGoal(goal.id, { title: e.target.value })}
            placeholder={placeholderText}
            rows={2}
            className="w-full bg-transparent resize-none border-none outline-none text-xl font-semibold text-[#2D2A26] placeholder-[#78716A]/40 leading-relaxed focus:ring-0"
          />
        ) : (
          /* Sub-Goals Text Form: Flowing text with centered floating selection points above */
          <div className="flex flex-wrap items-end gap-y-3 py-2 text-xl font-semibold text-[#2D2A26] leading-relaxed select-none">
            {subGoals.map((subGoal, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <span className="text-[#78716A]/40 font-mono font-normal select-none px-2.5 pb-0.5">
                      //
                    </span>
                  )}
                  <div className="inline-flex flex-col items-center group">
                    {/* Generous mobile-friendly hitbox for the centered floating dot */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubGoal(idx);
                      }}
                      className="w-9 h-8 -mt-2 mb-0.5 flex items-center justify-center cursor-pointer focus:outline-none touch-manipulation"
                      title={isSelected ? 'Deselect sub-goal' : 'Select sub-goal to complete'}
                    >
                      <span
                        className={`block rounded-full transition-all duration-200 pointer-events-none ${
                          isSelected
                            ? 'w-3 h-3 bg-[#DA7756] ring-3 ring-[#DA7756]/25 shadow-xs scale-110'
                            : 'w-2.5 h-2.5 border-2 border-[#78716A]/40 bg-white group-hover:border-[#DA7756] group-hover:scale-110'
                        }`}
                      />
                    </button>

                    {/* Sub-goal text: simple clean text, orange when selected */}
                    <span
                      className={`px-1 py-0.5 cursor-text transition-colors duration-200 ${
                        isSelected
                          ? 'text-[#DA7756] font-bold'
                          : 'text-[#2D2A26] hover:text-[#2D2A26]/80'
                      }`}
                    >
                      {subGoal}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer: Action Controls */}
      <div className="pt-4 border-t border-[#E6DFD5]/60">
        {goal.isCompleted ? (
          /* Post-completion dual actions */
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onUpdateGoal(goal.id, { isCompleted: false, completedAt: undefined })}
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
        ) : isFocused || isEditing ? (
          /* Tactile Done Button while keyboard/typing is active */
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDoneTyping}
            className="w-full h-[52px] rounded-2xl bg-[#DA7756] hover:bg-[#C86446] active:scale-[0.99] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Done</span>
          </button>
        ) : (
          /* Tactile Slide Knob when viewing */
          <SlideToComplete
            key={`${goal.id}-${sliderKey}`}
            onComplete={handleComplete}
            disabled={isSliderDisabled}
            disabledLabel={disabledLabel}
            completeLabel={completeLabel}
          />
        )}
      </div>
    </motion.div>
  );
};
