import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  SunMedium,
  Moon,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCompletionSound } from '../utils/sound';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

interface ReminderItem {
  id: string;
  name: string;
  hint: string;
  type: 'toothbrush' | 'water' | 'mouthwash' | 'floss';
  showInAfternoon: boolean; // mouthwash & floss are false
}

const ALL_ITEMS: ReminderItem[] = [
  {
    id: 'toothbrush',
    name: 'Toothbrush',
    hint: 'Gentle 2-minute clean',
    type: 'toothbrush',
    showInAfternoon: true,
  },
  {
    id: 'mouthwash',
    name: 'Mouth Wash',
    hint: '30-second rinse',
    type: 'mouthwash',
    showInAfternoon: false, // only morning & evening
  },
  {
    id: 'water',
    name: 'Glass of Water',
    hint: 'Cool, fresh hydration',
    type: 'water',
    showInAfternoon: true,
  },
  {
    id: 'floss',
    name: 'Tooth Floss',
    hint: 'Clean between each tooth',
    type: 'floss',
    showInAfternoon: false, // only morning & evening
  },
];

const determineTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
};

export const HealthView: React.FC = () => {
  // Current time of day (automatic)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(determineTimeOfDay);

  // Untracked session checks (purely for the moment)
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  // Automatically update time of day periodically and on app resume/focus
  useEffect(() => {
    const updateTime = () => {
      setTimeOfDay(determineTimeOfDay());
    };

    // Check periodically
    const timer = setInterval(updateTime, 30000);

    // Update immediately when user unlocks phone or switches back to app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', updateTime);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', updateTime);
    };
  }, []);

  // Filter items based on time of day rule:
  // mouthwash and tooth floss only show on morning and evening
  const visibleItems = useMemo(() => {
    if (timeOfDay === 'afternoon') {
      return ALL_ITEMS.filter((item) => item.showInAfternoon);
    }
    return ALL_ITEMS;
  }, [timeOfDay]);

  // Greeting title
  const greeting = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
        return 'Good morning';
      case 'afternoon':
        return 'Good afternoon';
      case 'evening':
      default:
        return 'Good evening';
    }
  }, [timeOfDay]);

  const greetingIcon = useMemo(() => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="w-5 h-5 text-[#DA7756]" />;
      case 'afternoon':
        return <SunMedium className="w-5 h-5 text-[#DA7756]" />;
      case 'evening':
      default:
        return <Moon className="w-5 h-5 text-[#6E8B74]" />;
    }
  }, [timeOfDay]);

  // Toggle item for this moment
  const handleToggleItem = (id: string) => {
    const nextChecked = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(nextChecked);
    playCompletionSound();

    // If all visible items are checked in this moment, gentle celebratory confetti
    const allDone = visibleItems.every((item) => nextChecked[item.id]);
    if (allDone) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#DA7756', '#6E8B74', '#FAF7F2', '#3B82F6'],
      });
    }
  };

  const handleResetCurrent = () => {
    setCheckedIds({});
  };

  const allVisibleDone = visibleItems.length > 0 && visibleItems.every((item) => checkedIds[item.id]);

  return (
    <main className="flex-1 min-h-0 px-4 md:px-8 py-4 md:py-8 max-w-5xl w-full mx-auto overflow-y-auto custom-scrollbar select-none flex flex-col justify-start md:justify-center">
      {/* Top Greeting Header */}
      <div className="flex flex-col items-center text-center mb-5 md:mb-8 shrink-0">
        {/* Big Simple Greeting */}
        <motion.div
          key={greeting}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2.5 md:gap-3"
        >
          {greetingIcon}
          <h1 className="text-3xl md:text-5xl font-serif-accent italic font-bold text-[#2D2A26] tracking-tight">
            {greeting}
          </h1>
        </motion.div>

        {/* Gentle, untracked philosophy subtitle */}
        <p className="text-[11px] md:text-xs text-[#78716A] mt-1 md:mt-2 font-medium">
          A gentle reminder for right now · Nothing to catch up on
        </p>
      </div>

      {/* Cards Container: Automatically balanced depending on 2 or 4 items */}
      <div
        className={`w-full mx-auto transition-all duration-500 ${
          visibleItems.length === 2
            ? 'max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'
            : 'max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6'
        }`}
      >
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item) => {
            const isChecked = !!checkedIds[item.id];

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                onClick={() => handleToggleItem(item.id)}
                className={`group relative rounded-2xl md:rounded-3xl p-3.5 md:p-6 border transition-all duration-300 flex flex-col items-center justify-between cursor-pointer select-none ${
                  isChecked
                    ? 'bg-gradient-to-b from-[#F0F4F1] to-white border-[#6E8B74]/50 shadow-xs'
                    : 'bg-white hover:bg-[#FAF7F2]/60 border-[#E6DFD5] hover:border-[#DA7756]/40 hover:shadow-xs'
                }`}
              >
                {/* Top Subtle Status Badge */}
                <div className="w-full flex items-center justify-end mb-1 md:mb-2">
                  <span
                    className={`p-1 rounded-full transition-colors ${
                      isChecked
                        ? 'bg-[#6E8B74] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#D0C6B8] group-hover:text-[#DA7756]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </span>
                </div>

                {/* Tactile Vector SVG Graphic */}
                <div className="relative w-20 h-28 sm:w-28 sm:h-36 my-1 md:my-2 flex items-center justify-center">
                  {/* Floating sparkles when checked */}
                  {isChecked && (
                    <motion.div
                      animate={{ y: [-2, 2, -2], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-1 -right-1 text-[#6E8B74] pointer-events-none"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  )}

                  {/* =================================================== */}
                  {/* 1. TOOTHBRUSH SVG                                   */}
                  {/* =================================================== */}
                  {item.type === 'toothbrush' && (
                    <svg viewBox="0 0 80 160" className="w-full h-full drop-shadow-xs">
                      <defs>
                        <linearGradient id="brushBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={isChecked ? '#6E8B74' : '#E8E2D7'} />
                          <stop offset="100%" stopColor={isChecked ? '#59745F' : '#D5CCA'} />
                        </linearGradient>
                      </defs>

                      {/* Bristles Head */}
                      <path
                        d="M32 18 C32 14, 48 14, 48 18 L48 44 L32 44 Z"
                        fill={isChecked ? '#FAF7F2' : '#FFFFFF'}
                        stroke={isChecked ? '#6E8B74' : '#D0C6B8'}
                        strokeWidth="1.5"
                      />
                      {/* Bristle Tufts Details */}
                      <path
                        d="M34 22 L46 22 M34 28 L46 28 M34 34 L46 34 M34 40 L46 40"
                        stroke={isChecked ? '#DA7756' : '#C5BCAE'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />

                      {/* Neck */}
                      <path
                        d="M36 44 L38 80 L42 80 L44 44 Z"
                        fill={isChecked ? '#EFEBE4' : '#F5F0E8'}
                        stroke={isChecked ? '#6E8B74' : '#D0C6B8'}
                        strokeWidth="1.5"
                      />

                      {/* Metallic Accent Collar */}
                      <rect
                        x="37"
                        y="80"
                        width="6"
                        height="4"
                        rx="1"
                        fill={isChecked ? '#DA7756' : '#B8AE9F'}
                      />

                      {/* Ergonomic Handle */}
                      <path
                        d="M35 84 C31 100, 31 138, 33 150 C34 154, 38 156, 40 156 C42 156, 46 154, 47 150 C49 138, 49 100, 45 84 Z"
                        fill="url(#brushBodyGrad)"
                        stroke={isChecked ? '#4B6350' : '#B8AE9F'}
                        strokeWidth="1.5"
                      />

                      {/* Tactile Grip Ridges */}
                      <line x1="36" y1="110" x2="44" y2="110" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                      <line x1="36" y1="120" x2="44" y2="120" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                      <line x1="37" y1="130" x2="43" y2="130" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    </svg>
                  )}

                  {/* =================================================== */}
                  {/* 2. GLASS OF WATER SVG                               */}
                  {/* =================================================== */}
                  {item.type === 'water' && (
                    <svg viewBox="0 0 80 160" className="w-full h-full drop-shadow-xs">
                      <defs>
                        <linearGradient id="glassWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={isChecked ? '#7DD3FC' : '#E0F2FE'} />
                          <stop offset="100%" stopColor={isChecked ? '#0284C7' : '#BAE6FD'} />
                        </linearGradient>

                        <clipPath id="glassClip">
                          <path d="M22 36 L26 142 C26 148, 30 152, 38 152 L42 152 C50 152, 54 148, 54 142 L58 36 Z" />
                        </clipPath>
                      </defs>

                      {/* Glass Outer Contour */}
                      <path
                        d="M20 32 L25 142 C25 150, 30 154, 38 154 L42 154 C50 154, 55 150, 55 142 L60 32 Z"
                        fill="#FFFFFF"
                        stroke={isChecked ? '#0284C7' : '#CBD5E1'}
                        strokeWidth="2"
                      />

                      {/* Clipped Refreshing Water Level */}
                      <g clipPath="url(#glassClip)">
                        <rect
                          x="18"
                          y="56"
                          width="44"
                          height="100"
                          fill="url(#glassWaterGrad)"
                          opacity={isChecked ? 0.9 : 0.6}
                        />
                        {/* Wave Meniscus */}
                        <path
                          d="M18 56 Q28 52, 40 56 T62 56 L62 66 L18 66 Z"
                          fill={isChecked ? '#BAE6FD' : '#E0F2FE'}
                        />
                        {/* Bubbles */}
                        {isChecked && (
                          <>
                            <circle cx="30" cy="120" r="2" fill="#FFFFFF" opacity="0.8" />
                            <circle cx="48" cy="100" r="2.5" fill="#FFFFFF" opacity="0.75" />
                            <circle cx="36" cy="80" r="1.5" fill="#FFFFFF" opacity="0.85" />
                          </>
                        )}
                      </g>

                      {/* Glass Specular Glare */}
                      <path
                        d="M26 44 L29 138"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                    </svg>
                  )}

                  {/* =================================================== */}
                  {/* 3. MOUTHWASH BOTTLE SVG                             */}
                  {/* =================================================== */}
                  {item.type === 'mouthwash' && (
                    <svg viewBox="0 0 80 160" className="w-full h-full drop-shadow-xs">
                      <defs>
                        <linearGradient id="mouthwashGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={isChecked ? '#6EE7B7' : '#E6F4EA'} />
                          <stop offset="100%" stopColor={isChecked ? '#059669' : '#C7E4D3'} />
                        </linearGradient>

                        <clipPath id="bottleBodyClip">
                          <path d="M25 58 C25 54, 28 50, 32 50 L48 50 C52 50, 55 54, 55 58 L55 142 C55 148, 51 152, 45 152 L35 152 C29 152, 25 148, 25 142 Z" />
                        </clipPath>
                      </defs>

                      {/* Measuring Cup Cap */}
                      <rect
                        x="33"
                        y="24"
                        width="14"
                        height="18"
                        rx="3"
                        fill={isChecked ? '#047857' : '#94A3B8'}
                        stroke={isChecked ? '#065F46' : '#64748B'}
                        strokeWidth="1.5"
                      />
                      <line x1="35" y1="30" x2="45" y2="30" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />

                      {/* Neck Ring */}
                      <rect
                        x="35"
                        y="42"
                        width="10"
                        height="8"
                        fill="#F1F5F9"
                        stroke={isChecked ? '#059669' : '#CBD5E1'}
                        strokeWidth="1.5"
                      />

                      {/* Bottle Body */}
                      <path
                        d="M25 58 C25 54, 28 50, 32 50 L48 50 C52 50, 55 54, 55 58 L55 142 C55 148, 51 152, 45 152 L35 152 C29 152, 25 148, 25 142 Z"
                        fill="#FFFFFF"
                        stroke={isChecked ? '#059669' : '#CBD5E1'}
                        strokeWidth="2"
                      />

                      {/* Clipped Minty Liquid */}
                      <g clipPath="url(#bottleBodyClip)">
                        <rect
                          x="23"
                          y="72"
                          width="34"
                          height="85"
                          fill="url(#mouthwashGrad)"
                          opacity={isChecked ? 0.9 : 0.6}
                        />
                        <path d="M23 72 Q30 70, 40 72 T57 72 L57 78 L23 78 Z" fill="#A7F3D0" opacity="0.7" />
                      </g>

                      {/* Minimalist Label */}
                      <rect
                        x="30"
                        y="92"
                        width="20"
                        height="26"
                        rx="3"
                        fill="#FFFFFF"
                        stroke={isChecked ? '#059669' : '#E2E8F0'}
                        strokeWidth="1"
                      />
                      <line x1="34" y1="100" x2="46" y2="100" stroke={isChecked ? '#059669' : '#94A3B8'} strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="36" y1="106" x2="44" y2="106" stroke={isChecked ? '#059669' : '#CBD5E1'} strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  )}

                  {/* =================================================== */}
                  {/* 4. TOOTH FLOSS SVG                                  */}
                  {/* =================================================== */}
                  {item.type === 'floss' && (
                    <svg viewBox="0 0 80 160" className="w-full h-full drop-shadow-xs">
                      {/* Pulled Floss String curve */}
                      <path
                        d="M48 58 Q58 35, 42 22 Q32 12, 38 6"
                        fill="none"
                        stroke={isChecked ? '#DA7756' : '#94A3B8'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={isChecked ? 'none' : '3 3'}
                      />

                      {/* Floss Dispenser Body (Pebble Shape) */}
                      <path
                        d="M20 90 C20 68, 30 56, 40 56 C50 56, 60 68, 60 90 C60 125, 52 142, 40 142 C28 142, 20 125, 20 90 Z"
                        fill={isChecked ? '#FFFDF9' : '#FFFFFF'}
                        stroke={isChecked ? '#DA7756' : '#D0C6B8'}
                        strokeWidth="2"
                      />

                      {/* Flip Top Cap Hinge */}
                      <path
                        d="M28 62 C32 58, 48 58, 52 62"
                        fill="none"
                        stroke={isChecked ? '#DA7756' : '#B8AE9F'}
                        strokeWidth="2"
                      />

                      {/* Viewing Window showing spool */}
                      <circle
                        cx="40"
                        cy="96"
                        r="12"
                        fill={isChecked ? '#FDF3EF' : '#FAF7F2'}
                        stroke={isChecked ? '#DA7756' : '#E6DFD5'}
                        strokeWidth="1.5"
                      />
                      {/* Inner Floss Spool lines */}
                      <circle
                        cx="40"
                        cy="96"
                        r="6"
                        fill={isChecked ? '#FFFFFF' : '#F5F0E8'}
                        stroke={isChecked ? '#DA7756' : '#CBD5E1'}
                        strokeWidth="1"
                      />
                      <line x1="36" y1="96" x2="44" y2="96" stroke={isChecked ? '#DA7756' : '#94A3B8'} strokeWidth="1" />

                      {/* Metal Blade Cutter */}
                      <rect
                        x="46"
                        y="56"
                        width="4"
                        height="4"
                        rx="0.5"
                        fill={isChecked ? '#DA7756' : '#64748B'}
                      />
                    </svg>
                  )}
                </div>

                {/* Card Footer: Name and Hint */}
                <div className="w-full flex flex-col items-center text-center mt-2">
                  <h3
                    className={`text-sm font-bold transition-colors ${
                      isChecked ? 'text-[#6E8B74]' : 'text-[#2D2A26]'
                    }`}
                  >
                    {item.name}
                  </h3>
                  <span className="text-[11px] text-[#78716A] mt-0.5">
                    {item.hint}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Subtle Bottom Controls */}
      <div className="flex items-center justify-center gap-3 mt-4 md:mt-8 mb-2 text-xs text-[#78716A] shrink-0">
        {allVisibleDone ? (
          <span className="font-semibold text-[#6E8B74] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#6E8B74]" />
            <span>All done for this {timeOfDay} · Feeling fresh</span>
          </span>
        ) : (
          <span>Tap any card to check off for right now</span>
        )}

        {Object.values(checkedIds).some(Boolean) && (
          <button
            type="button"
            onClick={handleResetCurrent}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#78716A] hover:text-[#DA7756] hover:bg-white/80 transition-all border border-[#E6DFD5]/60 cursor-pointer text-[11px]"
            title="Reset checks for this moment"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </main>
  );
};
