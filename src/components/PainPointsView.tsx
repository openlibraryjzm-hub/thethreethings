import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Plus, X, Sparkles, Cloud } from 'lucide-react';
import { PainPoint } from '../types';

const STORAGE_KEY = 'the_three_things_pain_points_v5';
const MAX_CHAR_LIMIT = 26;

// Punchy, short starter keywords
const STARTER_WORDS: PainPoint[] = [
  { id: '1', title: 'Bad Sleep Routine', isCompleted: false, createdAt: 1 },
  { id: '2', title: 'Neck & Posture Ache', isCompleted: false, createdAt: 2 },
  { id: '3', title: 'Tax Paperwork', isCompleted: false, createdAt: 3 },
  { id: '4', title: 'Cluttered Inbox', isCompleted: false, createdAt: 4 },
  { id: '5', title: 'Dentist Delay', isCompleted: false, createdAt: 5 },
  { id: '6', title: 'Garage Boxes', isCompleted: false, createdAt: 6 },
  { id: '7', title: 'Screen Time Fatigue', isCompleted: false, createdAt: 7 },
];

// Visual scale & palette variations for the word cloud
const CLOUD_STYLES = [
  {
    font: 'text-xl sm:text-2xl font-serif-accent italic font-bold',
    color: 'text-[#DA7756]',
    bg: 'bg-[#FDF3EF] border-[#DA7756]/30',
    padding: 'py-2 px-4',
  },
  {
    font: 'text-sm sm:text-base font-bold',
    color: 'text-[#2D2A26]',
    bg: 'bg-white border-[#E6DFD5]',
    padding: 'py-1.5 px-3.5',
  },
  {
    font: 'text-base sm:text-lg font-serif-accent italic font-bold',
    color: 'text-[#6E8B74]',
    bg: 'bg-[#F0F4F1] border-[#6E8B74]/30',
    padding: 'py-1.5 px-3.5',
  },
  {
    font: 'text-xs sm:text-sm font-semibold',
    color: 'text-[#C28B54]',
    bg: 'bg-white border-[#E6DFD5]',
    padding: 'py-1 px-3',
  },
  {
    font: 'text-[11px] sm:text-xs font-medium',
    color: 'text-[#78716A]',
    bg: 'bg-[#FAF7F2] border-[#E6DFD5]',
    padding: 'py-1 px-2.5',
  },
  {
    font: 'text-lg sm:text-xl font-bold',
    color: 'text-[#DA7756]',
    bg: 'bg-white border-[#DA7756]/30',
    padding: 'py-1.5 px-3.5',
  },
  {
    font: 'text-sm sm:text-base font-serif-accent italic font-bold',
    color: 'text-[#3D3833]',
    bg: 'bg-[#F5F0E8] border-[#E6DFD5]',
    padding: 'py-1 px-3',
  },
];

// Hash string for stable aesthetic styling
const getStyleForWord = (str: string, index: number) => {
  let hash = index;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return CLOUD_STYLES[Math.abs(hash) % CLOUD_STYLES.length];
};

export const PainPointsView: React.FC = () => {
  const [items, setItems] = useState<PainPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load pain points cloud', e);
    }
    return STARTER_WORDS;
  });

  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save pain points cloud', e);
    }
  }, [items]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Check duplicate
    if (items.some((i) => i.title.toLowerCase() === trimmed.toLowerCase())) {
      setInputVal('');
      return;
    }

    const newItem: PainPoint = {
      id: `pain-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed,
      isCompleted: false,
      createdAt: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);
    setInputVal('');
    inputRef.current?.focus();
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all words from your cloud?')) {
      setItems([]);
    }
  };

  const remainingChars = MAX_CHAR_LIMIT - inputVal.length;

  return (
    <main className="flex-1 min-h-0 px-4 md:px-8 py-3.5 md:py-6 max-w-3xl w-full mx-auto overflow-y-auto custom-scrollbar select-none flex flex-col justify-start">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-[#DA7756]" />
          <h1 className="text-xl md:text-2xl font-serif-accent italic font-bold text-[#2D2A26] tracking-tight">
            Pain Points Cloud
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6DFD5]/50 text-[#78716A] border border-[#E6DFD5]">
            {items.length} {items.length === 1 ? 'word' : 'words'}
          </span>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[11px] text-[#78716A]/70 hover:text-red-500 transition-colors px-1.5 py-1 cursor-pointer"
              title="Clear entire cloud"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mindful Purpose Subtitle */}
      <div className="rounded-2xl p-3 md:p-3.5 bg-[#F5F0E8]/80 border border-[#E6DFD5] mb-3.5 shadow-2xs shrink-0">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#DA7756] shrink-0 mt-0.5" />
          <p className="text-[11px] md:text-xs text-[#78716A] leading-relaxed">
            <strong className="text-[#2D2A26] font-semibold">Friction word cloud:</strong> Short keywords of what is nagging or bothering you right now. Glance at this cloud when picking today's <strong>3 Focus goals</strong>.
          </p>
        </div>
      </div>

      {/* Keyword Input with Strict Character Limit */}
      <form onSubmit={handleAdd} className="mb-3.5 shrink-0">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs focus-within:border-[#DA7756]/60 transition-all">
          <input
            ref={inputRef}
            type="text"
            maxLength={MAX_CHAR_LIMIT}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Name a friction keyword (e.g. Neck Ache, Tax Delay)..."
            className="flex-1 text-xs md:text-sm text-[#2D2A26] placeholder-[#78716A]/50 outline-none bg-transparent"
          />

          {/* Character limit pill */}
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
              remainingChars <= 5 ? 'text-red-500 font-bold' : 'text-[#78716A]/60'
            }`}
          >
            {inputVal.length}/{MAX_CHAR_LIMIT}
          </span>

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DA7756] hover:bg-[#C86446] disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Confined Word Cloud Chamber */}
      <div className="relative w-full min-h-[300px] max-h-[460px] rounded-3xl border border-[#E6DFD5] bg-gradient-to-b from-[#FAF7F2] to-[#F5F0E8]/70 p-4 sm:p-6 flex flex-wrap items-center justify-center content-center gap-2 sm:gap-3 overflow-y-auto custom-scrollbar shadow-2xs shrink-0 select-none">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 pointer-events-none">
            <Cloud className="w-8 h-8 text-[#78716A]/40 mb-2" />
            <p className="text-xs text-[#78716A]">Your cloud is clear. Type short keywords above to add.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const style = getStyleForWord(item.title, index);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative inline-flex items-center gap-1.5 rounded-2xl border shadow-2xs transition-all duration-200 hover:scale-105 hover:shadow-xs cursor-default ${style.bg} ${style.padding}`}
                >
                  <span className={`${style.font} ${style.color} tracking-tight leading-none`}>
                    {item.title}
                  </span>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-0.5 rounded-full text-[#78716A]/40 hover:text-red-500 hover:bg-black/5 transition-colors cursor-pointer"
                    title="Remove keyword"
                    aria-label={`Remove ${item.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <p className="text-[10px] text-[#78716A]/70 text-center mt-2.5">
        Tap the <span className="font-bold">×</span> on any word to dismiss it once handled.
      </p>
    </main>
  );
};
