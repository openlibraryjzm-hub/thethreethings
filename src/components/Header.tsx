import React from 'react';
import { Target, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeView: 'focus' | 'completed';
  onSelectView: (view: 'focus' | 'completed') => void;
  completedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  completedCount,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-[#F5F0E8]/80 backdrop-blur-md border-b border-[#E6DFD5]">
      {/* Brand Title with Subtitle Pill */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-serif-accent italic text-[#DA7756]">The Three Things</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[#E6DFD5]/60 text-[#78716A]">
          <Target className="w-3.5 h-3.5 text-[#DA7756]" />
          <span>One day at a time</span>
        </span>
      </div>

      {/* Navigation Buttons: Focus vs Completed */}
      <div className="flex items-center gap-1.5 bg-[#E6DFD5]/50 p-1 rounded-2xl border border-[#E6DFD5]">
        <button
          onClick={() => onSelectView('focus')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'focus'
              ? 'bg-white text-[#2D2A26] shadow-xs'
              : 'text-[#78716A] hover:text-[#2D2A26]'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#DA7756]" />
          <span>Focus</span>
        </button>

        <button
          onClick={() => onSelectView('completed')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'completed'
              ? 'bg-white text-[#2D2A26] shadow-xs'
              : 'text-[#78716A] hover:text-[#2D2A26]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B74]" />
          <span>Completed</span>
          {completedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#6E8B74]/20 text-[#6E8B74] text-[10px] font-bold">
              {completedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
