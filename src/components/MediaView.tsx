import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, RefreshCw, Plus, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SlideToComplete } from './SlideToComplete';
import { playCompletionSound } from '../utils/sound';

export interface MediaCardItem {
  id: string;
  indexLabel: string;
  mediaTitle: string; // Title of the media (e.g. Severance, Dune)
  title: string;      // Goal related to the media (e.g. Watch 1 episode, beat xyz level)
  isCompleted: boolean;
  imageUrl?: string;
  count?: number;
  cap?: string;
}

const STORAGE_KEY = 'the_three_things_media_cards_v1';
const THEME_STORAGE_KEY = 'the_three_things_monthly_theme_v1';

const initialCards: MediaCardItem[] = [
  { id: 'media-card-1', indexLabel: '01', mediaTitle: '', title: '', isCompleted: false, imageUrl: '' },
  { id: 'media-card-2', indexLabel: '02', mediaTitle: '', title: '', isCompleted: false, imageUrl: '' },
  { id: 'media-card-3', indexLabel: '03', mediaTitle: '', title: '', isCompleted: false, imageUrl: '' },
  { id: 'media-card-4', indexLabel: '04', mediaTitle: '', title: '', isCompleted: false, imageUrl: '' },
];

// Helper to compress and convert images to lightweight base64 for persistent localStorage
const compressAndReadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_DIM = 1000;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Save as optimized JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const MediaView: React.FC = () => {
  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  // 4 Permanent Media Cards State
  const [cards, setCards] = useState<MediaCardItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) {
          return parsed.map((card, idx) => ({
            id: card.id || `media-card-${idx + 1}`,
            indexLabel: card.indexLabel || `0${idx + 1}`,
            mediaTitle: card.mediaTitle !== undefined ? card.mediaTitle : (card.title || ''),
            title: card.mediaTitle !== undefined ? (card.title || '') : '',
            isCompleted: Boolean(card.isCompleted),
            imageUrl: card.imageUrl || '',
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load media cards from localStorage', e);
    }
    return initialCards;
  });

  // Monthly Theme State (Single title string)
  const [monthlyTheme, setMonthlyTheme] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        if (saved.startsWith('{')) {
          const parsed = JSON.parse(saved);
          return parsed.theme || '';
        }
        return saved;
      }
    } catch (e) {
      console.error('Failed to load monthly theme from localStorage', e);
    }
    return '';
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save media cards to localStorage', e);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme: monthlyTheme }));
    } catch (e) {
      console.error('Failed to save monthly theme to localStorage', e);
    }
  }, [monthlyTheme]);

  const handleUpdateCard = (id: string, updates: Partial<MediaCardItem>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const handleClearCard = (id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { ...card, mediaTitle: '', title: '', isCompleted: false, imageUrl: '' }
          : card
      )
    );
  };

  // "New Goal": clears specific goal and completes state, but retains mediaTitle & right half artwork
  const handleNewGoal = (id: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id
          ? { ...card, title: '', isCompleted: false }
          : card
      )
    );
  };

  const handleComplete = (id: string) => {
    // Play tactile acoustic celebratory sound
    playCompletionSound();

    // Trigger celebratory confetti in warm brand palette
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#DA7756', '#6E8B74', '#F5F0E8', '#C86446'],
      disableForReducedMotion: true,
    });

    handleUpdateCard(id, { isCompleted: true });
  };

  const handleImageUpload = async (id: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressedDataUrl = await compressAndReadImage(file);
      handleUpdateCard(id, { imageUrl: compressedDataUrl });
    } catch (err) {
      console.error('Failed to process image', err);
    }
  };

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(id, file);
    }
    e.target.value = '';
  };

  const handleDrop = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(id, file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <main className="flex-1 min-h-0 px-8 py-6 max-w-5xl w-full mx-auto overflow-y-auto custom-scrollbar select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-2">
        <p className="text-xs uppercase tracking-widest text-[#78716A] font-semibold">
          Media Log
        </p>
        <span className="text-xs text-[#78716A]/70 font-medium italic">
          Curation, artwork & completions
        </span>
      </div>

      <div className="flex flex-col gap-5 pb-12">
        {/* 🌟 DISTINCT MONTHLY THEME CARD */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full h-[270px] md:h-[285px] rounded-3xl p-6 md:p-7 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden border border-[#E2D8CC] bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch h-full">
            {/* LEFT HALF */}
            <div className="flex flex-col justify-between h-full pr-0 md:pr-4 overflow-hidden">
              {/* Header: Month anchor & Clear */}
              <div className="flex items-center justify-between shrink-0">
                <span className="text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic select-none">
                  {currentMonthName}
                </span>

                <button
                  type="button"
                  onClick={() => setMonthlyTheme('')}
                  className="p-1.5 text-[#78716A]/50 hover:text-[#DA7756] hover:bg-white/80 rounded-xl transition-colors cursor-pointer"
                  title="Clear theme title"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Center: Sole Large Bold Charcoal Text Area (2-line wrap) */}
              <div className="my-auto py-1">
                <textarea
                  rows={2}
                  value={monthlyTheme}
                  onChange={(e) => setMonthlyTheme(e.target.value)}
                  placeholder="What is this month's media theme?"
                  className="w-full text-xl md:text-2xl font-bold text-[#2D2A26] placeholder-[#78716A]/35 bg-transparent border-none outline-none focus:ring-0 transition-colors tracking-tight leading-snug resize-none overflow-hidden"
                />
              </div>

              {/* Bottom spacer for balanced vertical alignment */}
              <div className="h-2 shrink-0" />
            </div>

            {/* RIGHT HALF: 2x2 Grid with prominent dead-center focal circle */}
            <div className="relative h-full w-full flex items-center justify-center select-none overflow-hidden">
              <div className="relative w-full h-[195px] md:h-[215px] rounded-2xl md:rounded-3xl border border-[#E6DFD5] bg-[#E6DFD5] shadow-xs">
                {/* 2x2 Quadrant Grid */}
                <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-[1px]">
                  {cards.map((card, i) => (
                    <div
                      key={card.id || i}
                      className="relative overflow-hidden flex items-center justify-center bg-[#FAF6EE] w-full h-full"
                    >
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.mediaTitle || card.title || `Media ${card.indexLabel}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm md:text-base font-serif-accent font-bold text-[#DA7756]/50 italic select-none">
                          {card.indexLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Prominent Dead-Center Focal Circle: Perfectly balanced across all 4 quadrants */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-xl bg-[#FAF6EE] ring-1 ring-[#DA7756]/25 flex items-center justify-center overflow-hidden transition-transform duration-200 hover:scale-105">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6]">
                    <Sparkles className="w-8 h-8 md:w-9 md:h-9 text-[#DA7756]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subtle Section Divider */}
        <div className="flex items-center justify-between pt-2 px-2">
          <p className="text-xs uppercase tracking-widest text-[#78716A] font-semibold">
            Active Media Queue
          </p>
          <span className="text-xs text-[#78716A]/70 font-medium italic">
            4 Slots
          </span>
        </div>

        {/* 4 Cards Stacked Vertically */}
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: (idx + 1) * 0.06, ease: 'easeOut' }}
            className={`w-full h-[230px] md:h-[240px] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden border ${
              card.isCompleted
                ? 'bg-[#F0F4F1]/90 border-[#6E8B74]/30'
                : 'bg-white border-[#E6DFD5]'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch h-full">
              {/* LEFT HALF */}
              <div className="flex flex-col justify-between h-full pr-0 md:pr-4 overflow-hidden">
                {/* Header: Numeral, Media Title & Clear / Status */}
                <div className="flex items-center justify-between shrink-0 gap-2">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic select-none shrink-0">
                      {card.indexLabel}
                    </span>

                    {/* Media Title Field (styled in prominent serif accent like Month Theme card) */}
                    <input
                      type="text"
                      value={card.mediaTitle}
                      onChange={(e) => handleUpdateCard(card.id, { mediaTitle: e.target.value })}
                      placeholder="Media Title (e.g. Severance)"
                      className="flex-1 min-w-0 text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] placeholder-[#DA7756]/35 italic bg-transparent border-none outline-none focus:ring-0 transition-colors truncate leading-none"
                    />

                    {card.isCompleted && (
                      <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-[#6E8B74] bg-[#6E8B74]/15 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3" />
                        <span>Done</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleClearCard(card.id)}
                    className="p-1.5 text-[#78716A]/50 hover:text-[#DA7756] hover:bg-[#FAF7F2] rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Reset slot (clears title, goal & artwork)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Goal Input Area: 2-line Textarea matching Month Theme card */}
                <div className="my-auto py-1">
                  {card.isCompleted ? (
                    <div className="py-1">
                      <p className="text-xl md:text-2xl font-bold text-[#2D2A26]/70 line-through decoration-[#6E8B74] decoration-2 tracking-tight leading-snug line-clamp-2 select-text">
                        {card.title || card.mediaTitle || 'Untitled Goal'}
                      </p>
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={card.title}
                      onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                      placeholder="What is your goal?"
                      className="w-full text-xl md:text-2xl font-bold text-[#2D2A26] placeholder-[#78716A]/35 bg-transparent border-none outline-none focus:ring-0 transition-colors tracking-tight leading-snug resize-none overflow-hidden"
                    />
                  )}
                </div>

                {/* Footer: SlideToComplete or Completed New Goal Action */}
                <div className="mt-auto pt-1 shrink-0">
                  {card.isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleNewGoal(card.id)}
                      className="w-full h-[52px] flex items-center justify-center gap-2 rounded-2xl bg-[#DA7756] hover:bg-[#C86446] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                      title="Set a new goal for this media (keeps artwork)"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>New Goal</span>
                    </button>
                  ) : (
                    <SlideToComplete
                      onComplete={() => handleComplete(card.id)}
                      disabled={!card.title.trim() && !card.mediaTitle.trim()}
                      disabledLabel="Enter a goal to unlock"
                      completeLabel="Slide to complete"
                    />
                  )}
                </div>
              </div>

              {/* RIGHT HALF: Image Upload & Display with strictly locked previous image size */}
              <div className="flex items-center justify-center h-full w-full">
                <div
                  className={`group relative rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-colors cursor-pointer h-[152px] md:h-[162px] w-full ${
                    card.isCompleted
                      ? 'border-[#6E8B74]/30 bg-[#F0F4F1]/60 hover:border-[#6E8B74]/50'
                      : 'border-[#E6DFD5] bg-[#FAF7F2] hover:border-[#DA7756]/50'
                  }`}
                  onDrop={(e) => handleDrop(card.id, e)}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRefs.current[card.id]?.click()}
                >
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      fileInputRefs.current[card.id] = el;
                    }}
                    onChange={(e) => handleFileChange(card.id, e)}
                    className="hidden"
                  />

                  {card.imageUrl ? (
                    /* Uploaded Image strictly adhering to the locked bounds */
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={card.imageUrl}
                        alt={card.mediaTitle || card.title || `Media ${card.indexLabel}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRefs.current[card.id]?.click();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2D2A26] rounded-xl text-xs font-semibold shadow-md hover:bg-[#FDF3EF] hover:text-[#DA7756] transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateCard(card.id, { imageUrl: '' });
                          }}
                          className="p-1.5 bg-white text-[#C86446] rounded-xl shadow-md hover:bg-red-50 transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty state: upload icon conforming to exact same size */
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <Upload
                        className={`w-10 h-10 transition-all duration-300 group-hover:scale-110 ${
                          card.isCompleted
                            ? 'text-[#6E8B74]/60 group-hover:text-[#6E8B74]'
                            : 'text-[#DA7756]/60 group-hover:text-[#DA7756]'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
};
