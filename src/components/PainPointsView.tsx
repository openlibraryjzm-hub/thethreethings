import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mountain,
  Film,
  Compass,
  Hammer,
  Radio,
  Rows3,
  Plus,
  Sparkles,
  Cloud,
  Trash2,
  Check,
  MoveDiagonal2,
} from 'lucide-react';
import { PainPoint, ActiveView } from '../types';

export type CloudMode = 'painpoints' | 'media' | 'adventures' | 'projects' | 'oomf';

const PAINPOINTS_STORAGE_KEY = 'the_three_things_pain_points_v5';
const MEDIA_STORAGE_KEY = 'the_three_things_media_desires_v1';
const ADVENTURES_STORAGE_KEY = 'the_three_things_adventures_v1';
const PROJECTS_STORAGE_KEY = 'the_three_things_projects_v1';
const OOMF_STORAGE_KEY = 'the_three_things_oomf_v1';
const MODE_STORAGE_KEY = 'the_three_things_cloud_mode_v1';

const MAX_CHAR_LIMIT = 26;
const MIN_SCALE = 0.6;
const MAX_SCALE = 6.0;

// 1. Pain Points (friction reservoir)
const STARTER_PAIN_POINTS: PainPoint[] = [
  { id: '1', title: 'Bad Sleep Routine', isCompleted: false, createdAt: 1, scale: 1.25 },
  { id: '2', title: 'Neck & Posture Ache', isCompleted: false, createdAt: 2, scale: 1.0 },
  { id: '3', title: 'Tax Paperwork', isCompleted: false, createdAt: 3, scale: 1.35 },
  { id: '4', title: 'Cluttered Inbox', isCompleted: false, createdAt: 4, scale: 0.9 },
  { id: '5', title: 'Dentist Delay', isCompleted: false, createdAt: 5, scale: 1.1 },
  { id: '6', title: 'Garage Boxes', isCompleted: false, createdAt: 6, scale: 0.85 },
  { id: '7', title: 'Screen Time Fatigue', isCompleted: false, createdAt: 7, scale: 1.15 },
];

// 2. Media Desires (backlog reservoir)
const STARTER_MEDIA_DESIRES: PainPoint[] = [
  { id: 'm1', title: 'Sci-Fi Classics', isCompleted: false, createdAt: 1, scale: 1.25 },
  { id: 'm2', title: 'Cozy Indies', isCompleted: false, createdAt: 2, scale: 1.0 },
  { id: 'm3', title: 'Elden Ring DLC', isCompleted: false, createdAt: 3, scale: 1.35 },
  { id: 'm4', title: 'Studio Ghibli', isCompleted: false, createdAt: 4, scale: 0.95 },
  { id: 'm5', title: 'Cyberpunk Anime', isCompleted: false, createdAt: 5, scale: 1.15 },
  { id: 'm6', title: 'Metroidvanias', isCompleted: false, createdAt: 6, scale: 0.85 },
  { id: 'm7', title: 'Philosophy Non-Fiction', isCompleted: false, createdAt: 7, scale: 1.1 },
];

// 3. IRL Adventures (trips, hikes, spots)
const STARTER_ADVENTURES: PainPoint[] = [
  { id: 'a1', title: 'Coastal Ridge Hike', isCompleted: false, createdAt: 1, scale: 1.25 },
  { id: 'a2', title: 'Kyoto Trip', isCompleted: false, createdAt: 2, scale: 1.35 },
  { id: 'a3', title: 'Camping Weekend', isCompleted: false, createdAt: 3, scale: 1.0 },
  { id: 'a4', title: 'Night Food Market', isCompleted: false, createdAt: 4, scale: 0.95 },
  { id: 'a5', title: 'Kayaking in the Bay', isCompleted: false, createdAt: 5, scale: 1.15 },
  { id: 'a6', title: 'Hot Springs Retreat', isCompleted: false, createdAt: 6, scale: 0.85 },
  { id: 'a7', title: 'Scenic Train Route', isCompleted: false, createdAt: 7, scale: 1.1 },
];

// 4. Projects (side & passion projects)
const STARTER_PROJECTS: PainPoint[] = [
  { id: 'p1', title: 'Portfolio Redesign', isCompleted: false, createdAt: 1, scale: 1.25 },
  { id: 'p2', title: 'Custom Mechanical Board', isCompleted: false, createdAt: 2, scale: 1.0 },
  { id: 'p3', title: 'Woodworking Desk Build', isCompleted: false, createdAt: 3, scale: 1.35 },
  { id: 'p4', title: 'Indie Game Prototype', isCompleted: false, createdAt: 4, scale: 1.15 },
  { id: 'p5', title: 'Podcast Setup', isCompleted: false, createdAt: 5, scale: 0.9 },
  { id: 'p6', title: 'Recipe Zine', isCompleted: false, createdAt: 6, scale: 0.85 },
  { id: 'p7', title: 'Open Source CLI Tool', isCompleted: false, createdAt: 7, scale: 1.1 },
];

// 5. OOMF (channels, playlists, music aided by oomfs.tv & oomfit)
const STARTER_OOMF: PainPoint[] = [
  { id: 'o1', title: 'Deep Work Ambient', isCompleted: false, createdAt: 1, scale: 1.25 },
  { id: 'o2', title: 'Video Essay Channels', isCompleted: false, createdAt: 2, scale: 1.15 },
  { id: 'o3', title: 'City Pop Nightdrive', isCompleted: false, createdAt: 3, scale: 1.35 },
  { id: 'o4', title: 'Tech Philosophy', isCompleted: false, createdAt: 4, scale: 0.95 },
  { id: 'o5', title: 'Late Night Synthwave', isCompleted: false, createdAt: 5, scale: 1.1 },
  { id: 'o6', title: 'Lo-Fi Coding Beats', isCompleted: false, createdAt: 6, scale: 1.0 },
  { id: 'o7', title: 'Acoustic Guitar Sets', isCompleted: false, createdAt: 7, scale: 0.85 },
];

interface ModeConfig {
  id: CloudMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  bannerTitle: string;
  bannerDesc: React.ReactNode;
  placeholder: string;
  emptyText: string;
  companionView: ActiveView;
  companionLabel: string;
  companionIcon: React.ComponentType<{ className?: string }>;
}

const MODES: ModeConfig[] = [
  {
    id: 'painpoints',
    label: 'Pain Points',
    icon: Mountain,
    tooltip: 'Friction & long-term pain points',
    bannerTitle: 'Friction word cloud:',
    bannerDesc: (
      <>
        Short keywords of what is nagging or bothering you right now. Glance at this cloud when picking today's <strong>3 Focus goals</strong>.
      </>
    ),
    placeholder: 'Name a friction keyword (e.g. Neck Ache, Tax Delay)...',
    emptyText: 'Your friction cloud is clear. Type short keywords above to add.',
    companionView: 'focus',
    companionLabel: 'Focus View →',
    companionIcon: Rows3,
  },
  {
    id: 'media',
    label: 'Media Desires',
    icon: Film,
    tooltip: 'Media backlog & wishlist desires',
    bannerTitle: 'Media desires cloud:',
    bannerDesc: (
      <>
        Spatial reference of favorite genres, anticipated games, shows, or books. Glance here when curating your <strong>Weekly Media card</strong>.
      </>
    ),
    placeholder: 'Name a media desire (e.g. Cozy Indies, Elden Ring, Sci-Fi)...',
    emptyText: 'Your media desires cloud is clear. Type genres, games, or titles above to add.',
    companionView: 'media',
    companionLabel: 'Media View →',
    companionIcon: Film,
  },
  {
    id: 'adventures',
    label: 'IRL Adventures',
    icon: Compass,
    tooltip: 'Real-world adventures, trips, hikes & spots',
    bannerTitle: 'Adventure reservoir:',
    bannerDesc: (
      <>
        Places to visit, trails to hike, trips to take, and real-world experiences. Pull into your <strong>Focus goals</strong> when planning your weekend.
      </>
    ),
    placeholder: 'Name an adventure (e.g. Coastal Hike, Kyoto Trip)...',
    emptyText: 'Your adventure cloud is clear. Type trips, spots, or hikes above to add.',
    companionView: 'focus',
    companionLabel: 'Focus View →',
    companionIcon: Rows3,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Hammer,
    tooltip: 'Side projects, builds & creative ideas',
    bannerTitle: 'Side projects reservoir:',
    bannerDesc: (
      <>
        A spatial holding space for side projects, passion ideas, and creative endeavors. Pull actionable steps into your <strong>Focus goals</strong>.
      </>
    ),
    placeholder: 'Name a project (e.g. Portfolio v2, Woodworking Desk)...',
    emptyText: 'Your project cloud is clear. Type builds or ideas above to add.',
    companionView: 'focus',
    companionLabel: 'Focus View →',
    companionIcon: Rows3,
  },
  {
    id: 'oomf',
    label: 'OOMF',
    icon: Radio,
    tooltip: 'Channels, playlists & music curation',
    bannerTitle: 'OOMF curation:',
    bannerDesc: (
      <>
        Curation of standout channels, playlists, streamers, and music — aided by <strong>oomfs.tv</strong> and <strong>oomfit</strong>.
      </>
    ),
    placeholder: 'Name an OOMF item (e.g. Deep Work Ambient, Tech Essays)...',
    emptyText: 'Your OOMF cloud is clear. Type channels, playlists, or music above to add.',
    companionView: 'media',
    companionLabel: 'Media View →',
    companionIcon: Film,
  },
];

// Typographic palette variations with base REM sizing for fluid scaling
const CLOUD_STYLES = [
  {
    font: 'font-serif-accent italic font-bold',
    baseRem: 1.35, // ~21.6px
    color: 'text-[#DA7756]',
  },
  {
    font: 'font-bold',
    baseRem: 1.0, // ~16px
    color: 'text-[#2D2A26]',
  },
  {
    font: 'font-serif-accent italic font-bold',
    baseRem: 1.15, // ~18.4px
    color: 'text-[#6E8B74]',
  },
  {
    font: 'font-semibold',
    baseRem: 0.85, // ~13.6px
    color: 'text-[#C28B54]',
  },
  {
    font: 'font-medium',
    baseRem: 0.75, // ~12px
    color: 'text-[#78716A]',
  },
  {
    font: 'font-bold',
    baseRem: 1.25, // ~20px
    color: 'text-[#DA7756]',
  },
  {
    font: 'font-serif-accent italic font-bold',
    baseRem: 1.05, // ~16.8px
    color: 'text-[#3D3833]',
  },
];

const getStyleForWord = (str: string, index: number) => {
  let hash = index;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return CLOUD_STYLES[Math.abs(hash) % CLOUD_STYLES.length];
};

interface PainPointWordProps {
  item: PainPoint;
  index: number;
  isRemoveMode: boolean;
  isSelected: boolean;
  isActive: boolean;
  onToggleSelect: (id: string) => void;
  onSetActive: (id: string | null) => void;
  onUpdateScale: (id: string, scale: number) => void;
}

const PainPointWord: React.FC<PainPointWordProps> = ({
  item,
  index,
  isRemoveMode,
  isSelected,
  isActive,
  onToggleSelect,
  onSetActive,
  onUpdateScale,
}) => {
  const wordRef = useRef<HTMLDivElement>(null);
  const style = getStyleForWord(item.title, index);
  const scale = item.scale ?? 1.0;
  const fontSizeRem = style.baseRem * scale;

  // Touch listener for two-finger pinch gesture on mobile
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    let initialDist = 0;
    let initialScale = 1.0;
    let isPinching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRemoveMode) return;
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialScale = item.scale ?? 1.0;
        isPinching = true;
        onSetActive(item.id);
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPinching || e.touches.length !== 2) return;
      if (e.cancelable) e.preventDefault();

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (initialDist > 0) {
        const factor = currentDist / initialDist;
        const nextScale = Math.min(Math.max(Number((initialScale * factor).toFixed(2)), MIN_SCALE), MAX_SCALE);
        onUpdateScale(item.id, nextScale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinching && e.touches.length < 2) {
        isPinching = false;
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [item.id, item.scale, isRemoveMode, onSetActive, onUpdateScale]);

  // Direct drag handle to resize (Pointer events for mouse & touch drag)
  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = item.scale ?? 1.0;

    const onPointerMove = (moveEvt: PointerEvent) => {
      moveEvt.preventDefault();
      const deltaX = moveEvt.clientX - startX;
      const deltaY = startY - moveEvt.clientY;
      const delta = (deltaX + deltaY) / 60;
      const nextScale = Math.min(Math.max(Number((startScale + delta).toFixed(2)), MIN_SCALE), MAX_SCALE);
      onUpdateScale(item.id, nextScale);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoveMode) {
      onToggleSelect(item.id);
    } else {
      onSetActive(isActive ? null : item.id);
    }
  };

  return (
    <motion.div
      ref={wordRef}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`relative inline-flex items-center transition-all duration-200 select-none max-w-full ${
        isRemoveMode
          ? 'cursor-pointer px-2.5 py-1 rounded-xl'
          : isActive
          ? 'ring-2 ring-[#DA7756]/40 bg-[#DA7756]/5 rounded-xl px-2.5 py-1'
          : 'cursor-pointer px-2 py-0.5 hover:scale-105'
      } ${
        isSelected
          ? 'bg-red-500/10 line-through decoration-red-500 decoration-2 opacity-60'
          : isRemoveMode
          ? 'hover:bg-black/5 hover:scale-105'
          : ''
      }`}
      style={{
        fontSize: `${fontSizeRem.toFixed(2)}rem`,
      }}
    >
      {isRemoveMode && (
        <span
          className={`mr-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full border text-[10px] transition-colors shrink-0 ${
            isSelected
              ? 'bg-red-500 border-red-500 text-white'
              : 'border-[#78716A]/40 bg-white/80'
          }`}
        >
          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </span>
      )}

      <span
        className={`${style.font} ${
          isSelected ? 'text-red-600' : style.color
        } tracking-tight leading-tight transition-colors break-words text-center`}
      >
        {item.title}
      </span>

      {/* Tactile drag handle visible when this word is active (not in remove mode) */}
      {isActive && !isRemoveMode && (
        <div
          onPointerDown={handleDragStart}
          data-no-swipe="true"
          className="ml-1.5 p-1 rounded-full bg-[#DA7756] text-white cursor-nwse-resize touch-none shadow-2xs hover:scale-110 active:scale-95 transition-transform shrink-0"
          title="Drag horizontally or diagonally to resize"
          aria-label="Drag to resize word"
        >
          <MoveDiagonal2 className="w-2.5 h-2.5 stroke-[2.5]" />
        </div>
      )}
    </motion.div>
  );
};

interface PainPointsViewProps {
  onNavigate?: (view: ActiveView) => void;
}

export const PainPointsView: React.FC<PainPointsViewProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<CloudMode>(() => {
    try {
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as CloudMode | null;
      if (
        savedMode === 'painpoints' ||
        savedMode === 'media' ||
        savedMode === 'adventures' ||
        savedMode === 'projects' ||
        savedMode === 'oomf'
      ) {
        return savedMode;
      }
    } catch (e) {
      console.error('Failed to load cloud mode', e);
    }
    return 'painpoints';
  });

  const [clouds, setClouds] = useState<Record<CloudMode, PainPoint[]>>(() => {
    const loadCloud = (key: string, starters: PainPoint[]): PainPoint[] => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error(`Failed to load ${key}`, e);
      }
      return starters;
    };

    return {
      painpoints: loadCloud(PAINPOINTS_STORAGE_KEY, STARTER_PAIN_POINTS),
      media: loadCloud(MEDIA_STORAGE_KEY, STARTER_MEDIA_DESIRES),
      adventures: loadCloud(ADVENTURES_STORAGE_KEY, STARTER_ADVENTURES),
      projects: loadCloud(PROJECTS_STORAGE_KEY, STARTER_PROJECTS),
      oomf: loadCloud(OOMF_STORAGE_KEY, STARTER_OOMF),
    };
  });

  const [inputVal, setInputVal] = useState('');
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chamberRef = useRef<HTMLDivElement>(null);

  // Sync each cloud independently to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PAINPOINTS_STORAGE_KEY, JSON.stringify(clouds.painpoints));
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(clouds.media));
      localStorage.setItem(ADVENTURES_STORAGE_KEY, JSON.stringify(clouds.adventures));
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(clouds.projects));
      localStorage.setItem(OOMF_STORAGE_KEY, JSON.stringify(clouds.oomf));
    } catch (e) {
      console.error('Failed to save clouds to localStorage', e);
    }
  }, [clouds]);

  // Sync active mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (e) {
      console.error('Failed to save cloud mode', e);
    }
  }, [mode]);

  const items = clouds[mode] || [];

  const setItems = (action: React.SetStateAction<PainPoint[]>) => {
    setClouds((prev) => {
      const nextItems = typeof action === 'function' ? action(prev[mode]) : action;
      return {
        ...prev,
        [mode]: nextItems,
      };
    });
  };

  const currentConfig = MODES.find((m) => m.id === mode) || MODES[0];

  const handleSwitchMode = (newMode: CloudMode) => {
    if (newMode === mode) return;
    setActiveWordId(null);
    setIsRemoveMode(false);
    setSelectedIds(new Set());
    setInputVal('');
    setMode(newMode);
  };

  // Chamber-level pinch gesture support when a word is active
  useEffect(() => {
    const el = chamberRef.current;
    if (!el || !activeWordId || isRemoveMode) return;

    let initialDist = 0;
    let initialScale = 1.0;
    let isPinching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const targetItem = items.find((i) => i.id === activeWordId);
        initialScale = targetItem?.scale ?? 1.0;
        isPinching = true;
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPinching || e.touches.length !== 2) return;
      if (e.cancelable) e.preventDefault();

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (initialDist > 0) {
        const factor = currentDist / initialDist;
        const nextScale = Math.min(Math.max(Number((initialScale * factor).toFixed(2)), MIN_SCALE), MAX_SCALE);
        handleUpdateScale(activeWordId, nextScale);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isPinching && e.touches.length < 2) {
        isPinching = false;
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [activeWordId, items, isRemoveMode]);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Check duplicate in current cloud
    if (items.some((i) => i.title.toLowerCase() === trimmed.toLowerCase())) {
      setInputVal('');
      return;
    }

    const prefix = mode === 'painpoints' ? 'pain' : mode;
    const newItem: PainPoint = {
      id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed,
      isCompleted: false,
      createdAt: Date.now(),
      scale: 1.0,
    };

    setItems((prev) => [newItem, ...prev]);
    setInputVal('');
    inputRef.current?.focus();
  };

  const handleToggleRemoveMode = () => {
    setActiveWordId(null);
    setIsRemoveMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  };

  const handleToggleSelect = (id: string) => {
    if (!isRemoveMode) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleConfirmRemoval = () => {
    if (selectedIds.size === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    if (items.length - selectedIds.size <= 0) {
      setIsRemoveMode(false);
    }
  };

  const handleCancelRemoval = () => {
    setSelectedIds(new Set());
    setIsRemoveMode(false);
  };

  const handleUpdateScale = (id: string, scale: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, scale } : item))
    );
  };

  const handleStepScale = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const current = item.scale ?? 1.0;
        const next = Math.min(Math.max(Number((current + delta).toFixed(2)), MIN_SCALE), MAX_SCALE);
        return { ...item, scale: next };
      })
    );
  };

  const activeWord = items.find((i) => i.id === activeWordId);
  const remainingChars = MAX_CHAR_LIMIT - inputVal.length;

  return (
    <main className="flex-1 min-h-0 px-4 md:px-8 py-3.5 md:py-6 max-w-3xl w-full mx-auto overflow-y-auto custom-scrollbar select-none flex flex-col justify-start">
      {/* Top Header & 5-Mode Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3 px-1 shrink-0">
        {/* Mode Switcher Segmented Control (Active tab shows label, inactive show icons) */}
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar p-1 rounded-2xl bg-[#E6DFD5]/60 border border-[#E6DFD5] shadow-2xs max-w-full">
            {MODES.map((m) => {
              const isSelected = mode === m.id;
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSwitchMode(m.id)}
                  aria-label={m.label}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#2D2A26] shadow-xs px-3 shrink-0'
                      : 'text-[#78716A] hover:text-[#2D2A26] hover:bg-white/40 px-2.5'
                  }`}
                  title={m.tooltip}
                >
                  <Icon className="w-3.5 h-3.5 text-[#DA7756] shrink-0" />
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {m.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Action Cluster: Companion View Link Button and Removal Action */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(currentConfig.companionView)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-[#F5F0E8] text-[#DA7756] border border-[#E6DFD5] shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
              title={`Open ${currentConfig.companionLabel}`}
            >
              <currentConfig.companionIcon className="w-3.5 h-3.5 text-[#DA7756]" />
              <span>{currentConfig.companionLabel}</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={handleToggleRemoveMode}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                isRemoveMode
                  ? 'bg-[#DA7756] text-white border-[#DA7756] shadow-2xs'
                  : 'bg-white hover:bg-[#F5F0E8] text-[#78716A] hover:text-[#2D2A26] border-[#E6DFD5]'
              }`}
              title={isRemoveMode ? 'Exit remove mode' : 'Select entries to remove'}
            >
              <Trash2 className="w-3 h-3" />
              <span>{isRemoveMode ? 'Done' : 'Remove'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mindful Purpose Subtitle Banner */}
      <div className="rounded-2xl p-3 md:p-3.5 bg-[#F5F0E8]/80 border border-[#E6DFD5] mb-3.5 shadow-2xs shrink-0">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#DA7756] shrink-0 mt-0.5" />
          <p className="text-[11px] md:text-xs text-[#78716A] leading-relaxed">
            <strong className="text-[#2D2A26] font-semibold">{currentConfig.bannerTitle} </strong>
            {currentConfig.bannerDesc}
          </p>
        </div>
      </div>

      {/* Removal Selection Toolbar (Visible only in Remove Mode) */}
      <AnimatePresence>
        {isRemoveMode && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="overflow-hidden mb-3.5 shrink-0"
          >
            <div className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-[#FDF3EF] border border-[#DA7756]/30 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#2D2A26]">
                  {selectedIds.size === 0
                    ? 'Tap words to select for removal'
                    : `${selectedIds.size} word${selectedIds.size === 1 ? '' : 's'} selected`}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-[11px] text-[#78716A] hover:text-[#2D2A26] underline decoration-dotted ml-1 cursor-pointer"
                  >
                    {selectedIds.size === items.length ? 'Deselect all' : 'Select all'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelRemoval}
                  className="text-xs font-semibold px-2.5 py-1 rounded-xl text-[#78716A] hover:text-[#2D2A26] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoval}
                  disabled={selectedIds.size === 0}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-[#DA7756] hover:bg-[#C86446] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Confirm ({selectedIds.size})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyword Input with Strict Character Limit */}
      <form onSubmit={handleAdd} className="mb-3.5 shrink-0">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs focus-within:border-[#DA7756]/60 transition-all">
          <input
            ref={inputRef}
            type="text"
            maxLength={MAX_CHAR_LIMIT}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={currentConfig.placeholder}
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
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DA7756] hover:bg-[#C86446] disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Confined Word Cloud Chamber (Organic typography with pinch & drag scaling) */}
      <div
        ref={chamberRef}
        onClick={() => setActiveWordId(null)}
        className="relative w-full min-h-[300px] max-h-[460px] rounded-3xl border border-[#E6DFD5] bg-gradient-to-b from-[#FAF7F2] to-[#F5F0E8]/70 p-4 sm:p-6 flex flex-wrap items-center justify-center content-center gap-2.5 sm:gap-4 overflow-y-auto custom-scrollbar shadow-2xs shrink-0 select-none"
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 pointer-events-none">
            <Cloud className="w-8 h-8 text-[#78716A]/40 mb-2" />
            <p className="text-xs text-[#78716A]">{currentConfig.emptyText}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <PainPointWord
                key={item.id}
                item={item}
                index={index}
                isRemoveMode={isRemoveMode}
                isSelected={selectedIds.has(item.id)}
                isActive={activeWordId === item.id}
                onToggleSelect={handleToggleSelect}
                onSetActive={setActiveWordId}
                onUpdateScale={handleUpdateScale}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Active Word Precision Resize Bar */}
      <AnimatePresence>
        {activeWord && !isRemoveMode && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            className="overflow-hidden mt-3 shrink-0"
          >
            <div data-no-swipe="true" className="p-2.5 px-3.5 sm:px-4 rounded-2xl bg-white border border-[#E6DFD5] shadow-xs flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-serif-accent italic font-bold text-[#DA7756] truncate max-w-[110px] sm:max-w-[160px]">
                  "{activeWord.title}"
                </span>
                <span className="text-[10px] font-mono text-[#78716A] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E6DFD5]">
                  {Math.round((activeWord.scale ?? 1.0) * 100)}%
                </span>
              </div>

              {/* Slider & Step Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-[200px] sm:max-w-[240px]">
                <button
                  type="button"
                  onClick={() => handleStepScale(activeWord.id, -0.1)}
                  className="w-6 h-6 rounded-lg bg-[#FAF7F2] hover:bg-[#F5F0E8] border border-[#E6DFD5] text-[#2D2A26] flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                  title="Decrease size"
                >
                  −
                </button>

                <input
                  type="range"
                  min={MIN_SCALE}
                  max={MAX_SCALE}
                  step="0.05"
                  value={activeWord.scale ?? 1.0}
                  onChange={(e) => handleUpdateScale(activeWord.id, parseFloat(e.target.value))}
                  className="w-full accent-[#DA7756] h-1.5 bg-[#FAF7F2] rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleStepScale(activeWord.id, 0.1)}
                  className="w-6 h-6 rounded-lg bg-[#FAF7F2] hover:bg-[#F5F0E8] border border-[#E6DFD5] text-[#2D2A26] flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                  title="Increase size"
                >
                  +
                </button>
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={() => setActiveWordId(null)}
                className="text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E8] text-[#2D2A26] border border-[#E6DFD5] transition-colors cursor-pointer shrink-0"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[10px] text-[#78716A]/70 text-center mt-2.5">
        {isRemoveMode
          ? 'Tap words to select them for removal, then click Confirm.'
          : activeWord
          ? 'Pinch with two fingers or drag the handle/slider to adjust size.'
          : 'Tap any word to resize, or use two-finger pinch gesture on mobile.'}
      </p>
    </main>
  );
};
