import React from 'react';
import { Target, Rows3, Mountain, Apple, Lightbulb, Heart } from 'lucide-react';
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
  { id: 'painpoints', label: 'Pain Points', icon: Mountain },
  { id: 'health', label: 'Health', icon: Apple },
  { id: 'tip', label: 'Tip', icon: Lightbulb },
  { id: 'support', label: 'Support', icon: Heart },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 md:px-8 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3.5 md:py-4 bg-[#F5F0E8]/80 backdrop-blur-md border-b border-[#E6DFD5]">
      {/* Brand Title with Subtitle Pill */}
      <div className="flex items-center gap-3">
        <span className="text-xl md:text-2xl font-serif-accent italic text-[#DA7756]">The Three Things</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#E6DFD5]/60 text-[#78716A]">
          <Target className="w-3.5 h-3.5 text-[#DA7756]" />
          <span>One day at a time</span>
        </span>
      </div>

      {/* Navigation Buttons: Active tab shows label, inactive tabs are icon-only */}
      <div className="flex items-center gap-1.5 bg-[#E6DFD5]/50 p-1 rounded-2xl border border-[#E6DFD5]">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onSelectView(id)}
              title={label}
              aria-label={label}
              className={`flex items-center gap-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#2D2A26] shadow-xs px-3.5'
                  : 'text-[#78716A] hover:text-[#2D2A26] hover:bg-white/40 px-2.5'
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
