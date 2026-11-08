import React from 'react';
import { Rows3, Mountain, Film, Apple, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveView } from '../types';

interface HeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  completedCount?: number;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'focus', label: 'Focus', icon: Rows3 },
  { id: 'painpoints', label: 'Points', icon: Mountain },
  { id: 'media', label: 'Media', icon: Film },
  { id: 'health', label: 'Health', icon: Apple },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
}) => {
  return (
    <header data-no-swipe="true" className="w-full flex items-center justify-center sm:justify-end px-3 sm:px-8 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3 sm:py-4 bg-[#F5F0E8]/80 backdrop-blur-md border-b border-[#E6DFD5]">
      {/* Navigation Segmented Bar (Full width on mobile, right-aligned on desktop) */}
      <div className="w-full max-w-md sm:w-auto flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 bg-[#E6DFD5]/50 p-1 rounded-2xl border border-[#E6DFD5]">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onSelectView(id)}
              title={label}
              aria-label={label}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#2D2A26] shadow-xs px-3 sm:px-3.5 flex-shrink-0'
                  : 'text-[#78716A] hover:text-[#2D2A26] hover:bg-white/40 px-2 sm:px-2.5 flex-1 sm:flex-initial'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#DA7756] shrink-0" />
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </header>
  );
};
