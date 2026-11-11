import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Trash2,
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Check,
  History,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCompletionSound } from '../utils/sound';
import { WeeklyMediaCard, WeeklyMediaSlot, DayKey } from '../types';

const STORAGE_KEY = 'the_three_things_weekly_media_v2';
const LEGACY_CARDS_STORAGE_KEY = 'the_three_things_media_cards_v1';
const LEGACY_THEME_STORAGE_KEY = 'the_three_things_monthly_theme_v1';

export const WEEK_DAYS: DayKey[] = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

export const DAY_FULL_NAMES: Record<DayKey, string> = {
  Sa: 'Saturday',
  Su: 'Sunday',
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
};

export interface DayLevelConfig {
  label: string;
  dotCount: number;
  textColor: string;
  shadowClass?: string;
  badgeColor: string;
}

export const DAY_LEVEL_CONFIGS: Record<number, DayLevelConfig> = {
  0: {
    label: 'Inactive',
    dotCount: 0,
    textColor: 'text-[#78716A]/40 hover:text-[#2D2A26]',
    badgeColor: 'text-[#78716A]/60',
  },
  1: {
    label: 'Quick Check-in',
    dotCount: 1,
    textColor: 'text-[#78716A] font-semibold',
    badgeColor: 'text-[#78716A]',
  },
  2: {
    label: 'Mild Session',
    dotCount: 2,
    textColor: 'text-[#44403C] font-bold',
    badgeColor: 'text-[#44403C]',
  },
  3: {
    label: 'Deep Focus',
    dotCount: 3,
    textColor: 'text-[#DA7756] font-extrabold',
    badgeColor: 'text-[#DA7756]',
    shadowClass: 'drop-shadow-[0_1px_4px_rgba(218,119,86,0.3)]',
  },
  4: {
    label: 'Immersive Dive',
    dotCount: 4,
    textColor: 'text-[#C84A22] font-black',
    badgeColor: 'text-[#C84A22]',
    shadowClass: 'drop-shadow-[0_1px_6px_rgba(200,74,34,0.4)]',
  },
  5: {
    label: 'Marathon Peak 🌟',
    dotCount: 5,
    textColor: 'text-[#D97706] font-black',
    badgeColor: 'text-[#D97706]',
    shadowClass: 'drop-shadow-[0_1px_8px_rgba(217,119,6,0.5)]',
  },
};

export const getSlotDayLevel = (slot: WeeklyMediaSlot, day: DayKey): number => {
  if (slot.dayLevels && typeof slot.dayLevels[day] === 'number') {
    return Math.max(0, Math.min(5, slot.dayLevels[day]!));
  }
  return (slot.activeDays || []).includes(day) ? 1 : 0;
};

// Helper to compute Saturday–Friday week details and formatted date range
// Saturday + Sunday (first 2 weekend days) -> Monday–Friday (remaining 5 days)
export function getWeekDetails(targetDate: Date = new Date()) {
  const d = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Saturday starts the week:
  // Sat (6) -> 0
  // Sun (0) -> -1
  // Mon (1) -> -2 ... Fri (5) -> -6
  const diffToSaturday = -((day + 1) % 7);

  const saturday = new Date(d);
  saturday.setDate(d.getDate() + diffToSaturday);
  saturday.setHours(0, 0, 0, 0);

  const friday = new Date(saturday);
  friday.setDate(saturday.getDate() + 6);
  friday.setHours(23, 59, 59, 999);

  const m1 = saturday.toLocaleDateString('en-US', { month: 'short' });
  const m2 = friday.toLocaleDateString('en-US', { month: 'short' });
  const d1 = saturday.getDate();
  const d2 = friday.getDate();
  const y1 = saturday.getFullYear();
  const y2 = friday.getFullYear();

  let dateLabel = '';
  if (y1 === y2) {
    if (m1 === m2) {
      dateLabel = `${m1} ${d1} – ${d2}, ${y1}`;
    } else {
      dateLabel = `${m1} ${d1} – ${m2} ${d2}, ${y1}`;
    }
  } else {
    dateLabel = `${m1} ${d1}, ${y1} – ${m2} ${d2}, ${y2}`;
  }

  // Consistent, collision-free date ID: 'week-YYYY-MM-DD' based on Saturday start
  const id = `week-${y1}-${String(saturday.getMonth() + 1).padStart(2, '0')}-${String(d1).padStart(2, '0')}`;

  const firstJan = new Date(y1, 0, 1);
  const weekNumber = Math.max(1, Math.ceil(((saturday.getTime() - firstJan.getTime()) / 86400000 + 1) / 7));

  return {
    id,
    year: y1,
    weekNumber,
    startDate: saturday.toISOString(),
    endDate: friday.toISOString(),
    dateLabel,
  };
}

export function createDefaultSlots(count: number = 6): WeeklyMediaSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `slot-${Date.now()}-${i + 1}-${Math.random().toString(36).slice(2, 6)}`,
    title: '',
    activeDays: [],
    imageUrl: '',
  }));
}

// Client-side canvas compression to store optimized JPEG in localStorage
const compressAndReadImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_DIM = 960;

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

type ViewMode = 'current' | 'all-weeks' | 'archived';

export const MediaView: React.FC = () => {
  const currentWeekMeta = useMemo(() => getWeekDetails(new Date()), []);
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [selectedWeekId, setSelectedWeekId] = useState<string>(currentWeekMeta.id);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // All Weeks State
  const [weeks, setWeeks] = useState<WeeklyMediaCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: WeeklyMediaCard[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify current week exists; if missing, auto-create it at front
          const hasCurrent = parsed.some((w) => w.id === currentWeekMeta.id);
          if (!hasCurrent) {
            const newCurrentWeek: WeeklyMediaCard = {
              ...currentWeekMeta,
              theme: '',
              slots: createDefaultSlots(6),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            return [newCurrentWeek, ...parsed];
          }
          return parsed;
        }
      }

      // Check legacy v1 data for graceful migration
      const legacySaved = localStorage.getItem(LEGACY_CARDS_STORAGE_KEY);
      const legacyTheme = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      let initialSlots = createDefaultSlots(6);
      let initialTheme = '';

      if (legacySaved) {
        try {
          const parsedLegacy = JSON.parse(legacySaved);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            initialSlots = parsedLegacy.map((c, idx) => ({
              id: c.id || `slot-${idx + 1}`,
              title: c.mediaTitle || c.title || '',
              goal: c.mediaTitle ? (c.title || '') : '',
              isCompleted: Boolean(c.isCompleted),
              imageUrl: c.imageUrl || '',
            }));
            while (initialSlots.length < 6) {
              initialSlots.push({
                id: `slot-${Date.now()}-${initialSlots.length + 1}`,
                title: '',
                goal: '',
                isCompleted: false,
                imageUrl: '',
              });
            }
          }
        } catch (e) {
          console.warn('Failed migrating legacy cards', e);
        }
      }

      if (legacyTheme) {
        try {
          if (legacyTheme.startsWith('{')) {
            initialTheme = JSON.parse(legacyTheme).theme || '';
          } else {
            initialTheme = legacyTheme;
          }
        } catch {
          // ignore
        }
      }

      return [
        {
          ...currentWeekMeta,
          theme: initialTheme,
          slots: initialSlots,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    } catch (e) {
      console.error('Failed to load weekly media cards', e);
      return [
        {
          ...currentWeekMeta,
          theme: '',
          slots: createDefaultSlots(6),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    }
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const themeInputRef = useRef<HTMLInputElement | null>(null);
  const [isThemeFocused, setIsThemeFocused] = useState(false);
  const [activeDayFocus, setActiveDayFocus] = useState<{
    weekId: string;
    slotId: string;
    day: DayKey;
  } | null>(null);

  // Clear active day focus when switching view mode or selected week
  useEffect(() => {
    setActiveDayFocus(null);
  }, [viewMode, selectedWeekId]);

  // Persist weeks
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
    } catch (e) {
      console.error('Failed to save weekly media cards to localStorage', e);
    }
  }, [weeks]);

  // Current active week card
  const currentWeek = useMemo(() => {
    return weeks.find((w) => w.id === currentWeekMeta.id) || weeks[0];
  }, [weeks, currentWeekMeta.id]);

  // The week currently being rendered in full view
  const activeDisplayedWeek = useMemo(() => {
    if (viewMode === 'archived' && selectedWeekId) {
      return weeks.find((w) => w.id === selectedWeekId) || currentWeek;
    }
    return currentWeek;
  }, [viewMode, selectedWeekId, weeks, currentWeek]);

  // Update a specific week
  const handleUpdateWeek = (weekId: string, updates: Partial<WeeklyMediaCard>) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, ...updates, updatedAt: Date.now() } : w))
    );
  };

  // Update a specific slot inside a week
  const handleUpdateSlot = (weekId: string, slotId: string, updates: Partial<WeeklyMediaSlot>) => {
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id !== weekId) return w;
        return {
          ...w,
          updatedAt: Date.now(),
          slots: w.slots.map((s) => (s.id === slotId ? { ...s, ...updates } : s)),
        };
      })
    );
  };

  // Clear slot content
  const handleClearSlot = (weekId: string, slotId: string) => {
    if (activeDayFocus?.slotId === slotId) {
      setActiveDayFocus(null);
    }
    handleUpdateSlot(weekId, slotId, {
      title: '',
      activeDays: [],
      dayLevels: {},
      imageUrl: '',
      completedAt: undefined,
    });
  };

  // Set engagement level (0 to 5) for a day in a slot
  const handleSetDayLevel = (
    weekId: string,
    slotId: string,
    day: DayKey,
    targetLevel: number
  ) => {
    const clamped = Math.max(0, Math.min(5, targetLevel));
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id !== weekId) return w;
        return {
          ...w,
          updatedAt: Date.now(),
          slots: w.slots.map((s) => {
            if (s.id !== slotId) return s;
            const nextDayLevels: Partial<Record<DayKey, number>> = {
              ...(s.dayLevels || {}),
            };

            if (clamped > 0) {
              nextDayLevels[day] = clamped;
            } else {
              delete nextDayLevels[day];
            }

            const nextActiveDays = (Object.keys(nextDayLevels) as DayKey[]).filter(
              (d) => (nextDayLevels[d] || 0) > 0
            );

            // Celebrate Level 5 peak
            if (clamped === 5) {
              confetti({
                particleCount: 25,
                spread: 45,
                origin: { y: 0.7 },
                colors: ['#D97706', '#F59E0B', '#DA7756'],
                disableForReducedMotion: true,
              });
            }

            // Celebrate completing all 7 days in the week
            if (nextActiveDays.length === 7 && (s.activeDays?.length || 0) < 7) {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#DA7756', '#6E8B74', '#F5F0E8', '#C86446'],
                disableForReducedMotion: true,
              });
            }

            return {
              ...s,
              dayLevels: nextDayLevels,
              activeDays: nextActiveDays,
              isCompleted: nextActiveDays.length > 0,
              completedAt: nextActiveDays.length > 0 ? (s.completedAt || Date.now()) : undefined,
            };
          }),
        };
      })
    );
  };

  // Step intensity level with + / - buttons
  const handleStepDayLevel = (
    weekId: string,
    slotId: string,
    day: DayKey,
    delta: number
  ) => {
    const week = weeks.find((w) => w.id === weekId);
    const slot = week?.slots.find((s) => s.id === slotId);
    if (!slot) return;
    const current = getSlotDayLevel(slot, day);
    const nextLevel = Math.max(0, Math.min(5, current + delta));
    if (nextLevel !== current) {
      if (current === 0 && nextLevel > 0) {
        playCompletionSound();
      }
      handleSetDayLevel(weekId, slotId, day, nextLevel);
    }
  };

  // Click on a day button in the 7-day strip
  const handleDayButtonClick = (
    weekId: string,
    slotId: string,
    day: DayKey
  ) => {
    const week = weeks.find((w) => w.id === weekId);
    const slot = week?.slots.find((s) => s.id === slotId);
    if (!slot) return;
    const current = getSlotDayLevel(slot, day);

    const isAlreadyFocused =
      activeDayFocus?.weekId === weekId &&
      activeDayFocus?.slotId === slotId &&
      activeDayFocus?.day === day;

    if (isAlreadyFocused) {
      // Dismiss adjuster bar if tapping the already focused day
      setActiveDayFocus(null);
    } else {
      // Focus this day to display the docked adjuster bar
      setActiveDayFocus({ weekId, slotId, day });
      // If inactive, jumpstart to Level 1 with sound
      if (current === 0) {
        playCompletionSound();
        handleSetDayLevel(weekId, slotId, day, 1);
      }
    }
  };

  // Add a new rectangular slot to a week
  const handleAddSlot = (weekId: string) => {
    const newSlot: WeeklyMediaSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      activeDays: [],
      dayLevels: {},
      imageUrl: '',
    };
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, slots: [...w.slots, newSlot], updatedAt: Date.now() } : w))
    );
  };

  // Remove a slot from a week (if more than 1)
  const handleRemoveSlot = (weekId: string, slotId: string) => {
    if (activeDayFocus?.slotId === slotId) {
      setActiveDayFocus(null);
    }
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id !== weekId || w.slots.length <= 1) return w;
        return {
          ...w,
          slots: w.slots.filter((s) => s.id !== slotId),
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Image handling
  const handleImageUpload = async (weekId: string, slotId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const compressed = await compressAndReadImage(file);
      handleUpdateSlot(weekId, slotId, { imageUrl: compressed });
    } catch (err) {
      console.error('Failed to process artwork', err);
    }
  };

  // Calculate completion stats for active displayed week
  const totalDaysLogged = useMemo(() => {
    return activeDisplayedWeek.slots.reduce((sum, s) => sum + (s.activeDays?.length || 0), 0);
  }, [activeDisplayedWeek]);

  const activeMediaCount = useMemo(() => {
    return activeDisplayedWeek.slots.filter((s) => (s.activeDays?.length || 0) > 0).length;
  }, [activeDisplayedWeek]);

  // Render the Large Weekly Card
  const renderLargeCard = (week: WeeklyMediaCard, isArchiveView: boolean) => {
    // Helper to test if a slot has content
    const isSlotFilled = (slot: WeeklyMediaSlot) => {
      return Boolean(
        slot.title.trim() ||
        slot.imageUrl ||
        (slot.activeDays && slot.activeDays.length > 0)
      );
    };

    const filledSlots = week.slots.filter(isSlotFilled);
    // View mode: shows only filled cards. Edit mode: shows filled + empty cards ready to fill.
    const slotsToDisplay = isEditMode ? week.slots : filledSlots;

    return (
      <motion.div
        key={week.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="w-full rounded-3xl p-6 md:p-8 bg-white border border-[#E6DFD5] shadow-xs hover:shadow-sm transition-all duration-300"
      >
        {/* Card Header: Theme prompt on left, Date & All Weeks on right */}
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6DFD5]">
          {/* Left: Borderless Large Weekly Focus / Theme with Blinking Cursor */}
          <div
            onClick={() => themeInputRef.current?.focus()}
            className="relative flex items-center flex-1 min-w-0 max-w-xl cursor-text py-1"
          >
            {!week.theme && !isThemeFocused && (
              <div className="absolute left-0 pointer-events-none flex items-center select-none">
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
                  className="w-[3px] h-7 md:h-8 bg-[#DA7756] rounded-full inline-block"
                />
              </div>
            )}
            <input
              ref={themeInputRef}
              type="text"
              value={week.theme || ''}
              onFocus={() => setIsThemeFocused(true)}
              onBlur={() => setIsThemeFocused(false)}
              onChange={(e) => handleUpdateWeek(week.id, { theme: e.target.value })}
              className="w-full text-2xl md:text-3xl font-bold text-[#2D2A26] bg-transparent border-none outline-none focus:ring-0 tracking-tight p-0"
              aria-label="Weekly media theme"
            />
            {week.theme && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateWeek(week.id, { theme: '' });
                }}
                className="p-1 text-[#78716A]/40 hover:text-[#DA7756] rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                title="Clear theme"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Big Orange Date with Edit Mode & All Weeks Below It */}
          <div className="flex flex-col items-start md:items-end shrink-0 text-left md:text-right">
            <span className="text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic select-none leading-none">
              {week.dateLabel}
            </span>

            <div className="flex items-center gap-2 mt-2 select-none">
              {/* Edit vs View Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsEditMode((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isEditMode
                    ? 'px-2.5 py-1 rounded-xl bg-[#DA7756] hover:bg-[#C86446] text-white shadow-2xs active:scale-95'
                    : 'text-[#78716A] hover:text-[#DA7756]'
                }`}
                title={isEditMode ? 'Finish editing and view filled cards' : 'Edit queue & add new media'}
              >
                {isEditMode ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3 h-3 text-[#DA7756]" />
                    <span>Edit</span>
                  </>
                )}
              </button>

              <span className="text-[#E6DFD5] text-xs leading-none">•</span>

              {!isArchiveView ? (
                <button
                  type="button"
                  onClick={() => setViewMode('all-weeks')}
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716A] hover:text-[#DA7756] transition-colors cursor-pointer"
                  title="Browse all weeks"
                >
                  <Layers className="w-3.5 h-3.5 text-[#DA7756]" />
                  <span>All Weeks ({weeks.length})</span>
                  <span className="text-[#DA7756] font-bold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('all-weeks')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716A] hover:text-[#DA7756] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#DA7756]" />
                  <span>Back to Archive List</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grid of Rectangular Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {/* Empty State when in View Mode with 0 filled cards */}
          {slotsToDisplay.length === 0 && !isEditMode && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-[#FAF7F2]/60 rounded-3xl border border-dashed border-[#E6DFD5] p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF3EF] border border-[#DA7756]/20 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-[#DA7756]" />
              </div>
              <h3 className="text-base font-bold text-[#2D2A26]">No media added to this week yet</h3>
              <p className="text-xs text-[#78716A] max-w-sm mt-1 mb-5">
                Switch to edit mode to start adding books, shows, movies, or games.
              </p>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#DA7756] hover:bg-[#C86446] text-white text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Curate Media</span>
              </button>
            </div>
          )}

          {slotsToDisplay.map((slot, index) => {
            const indexStr = String(index + 1).padStart(2, '0');
            const fileRefKey = `${week.id}-${slot.id}`;

            return (
              <div
                key={slot.id}
                className={`relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-xs ${
                  slot.isCompleted
                    ? 'bg-[#F0F4F1]/90 border-[#6E8B74]/35'
                    : 'bg-[#FAF7F2] border-[#E6DFD5] hover:border-[#DA7756]/40'
                }`}
              >
                {/* 1. Rectangular Artwork Upload / Poster Area */}
                <div
                  className="relative h-[145px] md:h-[150px] w-full bg-[#FAF6EE] border-b border-[#E6DFD5] flex items-center justify-center cursor-pointer group overflow-hidden select-none"
                  onClick={() => fileInputRefs.current[fileRefKey]?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageUpload(week.id, slot.id, file);
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      fileInputRefs.current[fileRefKey] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(week.id, slot.id, file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {slot.imageUrl ? (
                    <>
                      <img
                        src={slot.imageUrl}
                        alt={slot.title || `Media ${indexStr}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRefs.current[fileRefKey]?.click();
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
                            handleUpdateSlot(week.id, slot.id, { imageUrl: '' });
                          }}
                          className="p-1.5 bg-white text-[#C86446] rounded-xl shadow-md hover:bg-red-50 transition-all cursor-pointer"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-[#78716A]/60 group-hover:text-[#DA7756] transition-colors p-4">
                      <Upload className="w-7 h-7 stroke-[1.75] transition-transform duration-200 group-hover:scale-110" />
                      <span className="text-[11px] font-semibold tracking-wide uppercase">
                        Drop Artwork
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Rectangular Slot Body: Media Title and Borderless Day Buttons */}
                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  {/* Media Title Field */}
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={slot.title}
                      onChange={(e) =>
                        handleUpdateSlot(week.id, slot.id, { title: e.target.value })
                      }
                      placeholder="Media Title (e.g. Severance)"
                      className="w-full text-base font-bold text-[#2D2A26] placeholder-[#78716A]/40 bg-transparent border-none outline-none focus:ring-0 leading-tight"
                    />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleClearSlot(week.id, slot.id)}
                        className="p-1 text-[#78716A]/40 hover:text-[#DA7756] hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Clear slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 3. Horizontally Aligned Borderless Day Buttons: Sa, Su, Mo, Tu, We, Th, Fr */}
                  <div className="pt-2 border-t border-[#E6DFD5]/50 flex flex-col gap-1">
                    <div className="grid grid-cols-7 gap-0.5 w-full items-center justify-items-center">
                      {WEEK_DAYS.map((day) => {
                        const level = getSlotDayLevel(slot, day);
                        const isDayFocused =
                          activeDayFocus?.weekId === week.id &&
                          activeDayFocus?.slotId === slot.id &&
                          activeDayFocus?.day === day;
                        const cfg = DAY_LEVEL_CONFIGS[level] || DAY_LEVEL_CONFIGS[0];

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayButtonClick(week.id, slot.id, day)}
                            title={`${DAY_FULL_NAMES[day]}: ${level === 0 ? 'Off' : `Level ${level} (${cfg.label})`}`}
                            className={`w-full py-1 px-0.5 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer select-none border ${
                              isDayFocused
                                ? 'bg-[#F2ECE4] border-[#DA7756]/40 shadow-2xs'
                                : 'border-transparent hover:bg-black/[0.03]'
                            }`}
                          >
                            <span
                              className={`text-sm md:text-base leading-tight transition-all ${cfg.textColor} ${
                                cfg.shadowClass || ''
                              } ${level > 0 ? 'scale-105' : ''}`}
                            >
                              {day}
                            </span>

                            {/* Level Dots */}
                            <div className="h-2 flex items-center justify-center gap-0.5 mt-0.5">
                              {level > 0 ? (
                                Array.from({ length: level }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`w-1 h-1 rounded-full ${
                                      level === 5
                                        ? 'bg-[#D97706] shadow-[0_0_3px_#D97706]'
                                        : level >= 3
                                        ? 'bg-[#DA7756]'
                                        : 'bg-[#78716A]'
                                    }`}
                                  />
                                ))
                              ) : (
                                <span className="w-1 h-1 rounded-full bg-transparent" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Docked Level Adjuster Bar: Level xyz with + and - buttons */}
                    <AnimatePresence>
                      {activeDayFocus?.weekId === week.id &&
                        activeDayFocus?.slotId === slot.id && (
                          <motion.div
                            key={`dock-${slot.id}-${activeDayFocus.day}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            {(() => {
                              const focusedDay = activeDayFocus.day;
                              const currentLevel = getSlotDayLevel(slot, focusedDay);
                              const cfg = DAY_LEVEL_CONFIGS[currentLevel] || DAY_LEVEL_CONFIGS[0];

                              return (
                                <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#FAF4ED] border border-[#E6DFD5] rounded-xl text-xs shadow-2xs mt-1">
                                  {/* Left: Day + Level label (e.g. Tuesday · Level 3: Deep Focus) */}
                                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                    <span className="font-bold text-[#2D2A26] shrink-0">
                                      {DAY_FULL_NAMES[focusedDay]}
                                    </span>
                                    <span className="text-[#78716A]/40">·</span>
                                    <span className={`font-semibold truncate ${cfg.badgeColor}`}>
                                      {currentLevel === 0
                                        ? 'Off'
                                        : `Level ${currentLevel}: ${cfg.label}`}
                                    </span>
                                  </div>

                                  {/* Right: [-] [+] stepper and Done */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStepDayLevel(week.id, slot.id, focusedDay, -1)
                                      }
                                      disabled={currentLevel <= 0}
                                      className="w-6 h-6 rounded-lg bg-white border border-[#E6DFD5] text-[#2D2A26] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#FAF7F2] active:scale-95 flex items-center justify-center font-bold transition-all shadow-2xs cursor-pointer"
                                      title="Decrease level"
                                    >
                                      <Minus className="w-3 h-3 stroke-[2.5]" />
                                    </button>

                                    <span className="w-4 text-center font-bold text-xs text-[#2D2A26]">
                                      {currentLevel}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStepDayLevel(week.id, slot.id, focusedDay, 1)
                                      }
                                      disabled={currentLevel >= 5}
                                      className="w-6 h-6 rounded-lg bg-white border border-[#E6DFD5] text-[#2D2A26] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#FAF7F2] active:scale-95 flex items-center justify-center font-bold transition-all shadow-2xs cursor-pointer"
                                      title="Increase level"
                                    >
                                      <Plus className="w-3 h-3 stroke-[2.5]" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setActiveDayFocus(null)}
                                      className="ml-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-[#78716A] hover:text-[#2D2A26] hover:bg-black/5 transition-colors cursor-pointer"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Another Slot Button (visible only in Edit Mode) */}
          {isEditMode && (
            <button
              type="button"
              onClick={() => handleAddSlot(week.id)}
              className="flex flex-col items-center justify-center min-h-[240px] rounded-2xl border-2 border-dashed border-[#E6DFD5] hover:border-[#DA7756]/60 bg-[#FAF7F2]/60 hover:bg-[#FDF3EF]/40 text-[#78716A] hover:text-[#DA7756] transition-all cursor-pointer p-6 group"
              title="Add another rectangular slot"
            >
              <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#DA7756] text-[#78716A] group-hover:text-white border border-[#E6DFD5] group-hover:border-transparent flex items-center justify-center mb-3 transition-colors shadow-2xs">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase">
                Add Media Slot
              </span>
              <span className="text-[11px] text-[#78716A]/70 mt-1 font-medium">
                Expand this week's queue
              </span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // Render the Secondary Page: Heavily Shrunk All Weeks Grid
  const renderAllWeeksView = () => {
    return (
      <motion.div
        key="all-weeks"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full flex flex-col gap-6"
      >
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DFD5]">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setViewMode('current')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DA7756] hover:text-[#C86446] transition-colors cursor-pointer self-start mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Current Week</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic">
                All Weeks Archive
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6DFD5]/60 text-[#78716A]">
                {weeks.length} {weeks.length === 1 ? 'week' : 'weeks'}
              </span>
            </div>
            <p className="text-xs text-[#78716A]/80">
              Browse your weekly media timelines. Click any week card to expand it into full view.
            </p>
          </div>
        </div>

        {/* Heavily Shrunk / Truncated Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
          {weeks.map((week) => {
            const isCurrent = week.id === currentWeekMeta.id;
            const weekDaysCount = week.slots.reduce((sum, s) => sum + (s.activeDays?.length || 0), 0);
            const filledSlots = week.slots.filter(
              (s) => s.title.trim() || (s.activeDays?.length || 0) > 0 || s.imageUrl
            );
            const artworkThumbnails = week.slots.filter((s) => s.imageUrl).slice(0, 4);

            return (
              <div
                key={week.id}
                onClick={() => {
                  setSelectedWeekId(week.id);
                  setViewMode('archived');
                }}
                className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between h-[210px] overflow-hidden select-none hover:-translate-y-1 hover:shadow-md ${
                  isCurrent
                    ? 'bg-white border-[#DA7756]/60 shadow-xs ring-1 ring-[#DA7756]/20'
                    : 'bg-white border-[#E6DFD5] hover:border-[#DA7756]/50'
                }`}
              >
                {/* Shrunk Card Top: Date & Badge */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif-accent font-bold text-base md:text-lg text-[#2D2A26] group-hover:text-[#DA7756] transition-colors italic truncate">
                      {week.dateLabel}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#DA7756] bg-[#FDF3EF] border border-[#DA7756]/30 px-2 py-0.2 rounded-full shrink-0">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Truncated Theme Line */}
                  <p className="text-xs text-[#78716A] line-clamp-1 italic">
                    {week.theme || 'No theme specified'}
                  </p>
                </div>

                {/* Shrunk Card Middle: Miniature Artwork Mosaic Preview */}
                <div className="my-auto py-2">
                  {artworkThumbnails.length > 0 ? (
                    <div className="grid grid-cols-4 gap-1.5 h-12 w-full rounded-xl overflow-hidden bg-[#FAF6EE] p-1 border border-[#E6DFD5]/60">
                      {artworkThumbnails.map((slot, i) => (
                        <div
                          key={slot.id || i}
                          className="relative h-full w-full rounded-lg overflow-hidden bg-[#FAF7F2]"
                        >
                          <img
                            src={slot.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {/* Fill empty boxes if fewer than 4 */}
                      {Array.from({ length: Math.max(0, 4 - artworkThumbnails.length) }).map(
                        (_, idx) => (
                          <div
                            key={idx}
                            className="h-full w-full rounded-lg bg-[#FAF7F2]/60 border border-dashed border-[#E6DFD5]"
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="h-12 w-full rounded-xl bg-[#FAF7F2] border border-dashed border-[#E6DFD5] flex items-center justify-center text-[11px] text-[#78716A]/50">
                      <span>{filledSlots.length} media items logged</span>
                    </div>
                  )}
                </div>

                {/* Shrunk Card Footer: Completion Status & Action */}
                <div className="pt-2 border-t border-[#E6DFD5]/60 flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold inline-flex items-center gap-1 text-[11px] ${
                      weekDaysCount > 0 ? 'text-[#DA7756]' : 'text-[#78716A]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B74]" />
                    <span>
                      {weekDaysCount} {weekDaysCount === 1 ? 'day' : 'days'} logged
                    </span>
                  </span>

                  <span className="text-[11px] font-bold text-[#DA7756] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    View card →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <main className="flex-1 min-h-0 px-4 md:px-8 py-4 md:py-6 max-w-6xl w-full mx-auto overflow-y-auto custom-scrollbar select-none">
      {/* Disclaimer Banner for Archive View */}
      {viewMode === 'archived' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-5 p-4 rounded-2xl bg-[#F5F0E8] border border-[#E6DFD5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DA7756]/15 flex items-center justify-center shrink-0">
              <History className="w-4 h-4 text-[#DA7756]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#DA7756]">
                  Archived Week View
                </span>
                <span className="text-xs text-[#78716A]">·</span>
                <span className="text-xs font-semibold text-[#2D2A26]">
                  {activeDisplayedWeek.dateLabel}
                </span>
              </div>
              <p className="text-xs text-[#78716A]">
                You are viewing past weekly media. Any adjustments made here update this historical entry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('all-weeks')}
              className="px-3 py-1.5 rounded-xl border border-[#E6DFD5] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#78716A] hover:text-[#2D2A26] transition-all cursor-pointer shadow-2xs"
            >
              ← All Weeks
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedWeekId(currentWeekMeta.id);
                setViewMode('current');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#DA7756] hover:bg-[#C86446] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              Jump to This Week →
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content Switcher */}
      <AnimatePresence mode="wait">
        {viewMode === 'all-weeks'
          ? renderAllWeeksView()
          : renderLargeCard(activeDisplayedWeek, viewMode === 'archived')}
      </AnimatePresence>
    </main>
  );
};
