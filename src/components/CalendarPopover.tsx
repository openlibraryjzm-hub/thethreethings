import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarPopoverProps {
  selectedDate: string; // YYYY-MM-DD or ''
  onSelectDate: (dateStr: string) => void;
  onClearDate: () => void;
  completedDates?: Set<string>; // Set of 'YYYY-MM-DD' dates with accomplishments
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarPopover: React.FC<CalendarPopoverProps> = ({
  selectedDate,
  onSelectDate,
  onClearDate,
  completedDates = new Set(),
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize view year & month from selectedDate or current date
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(formatted);
    setIsOpen(false);
  };

  const handleJumpToToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    onSelectDate(formatted);
    setIsOpen(false);
  };

  // Days in month calculation
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  const formatButtonLabel = () => {
    if (!selectedDate) return 'Calendar';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none">
      {/* Trigger Button Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
          selectedDate
            ? 'bg-[#DA7756] hover:bg-[#C86446] text-white border-[#DA7756] shadow-xs'
            : isOpen
            ? 'bg-[#FAF7F2] border-[#DA7756] text-[#2D2A26]'
            : 'bg-white hover:bg-[#FAF7F2] border-[#E6DFD5] text-[#78716A] hover:text-[#2D2A26]'
        }`}
        title="Open calendar picker"
      >
        <CalendarIcon className={`w-3.5 h-3.5 ${selectedDate ? 'text-white' : 'text-[#DA7756]'}`} />
        <span>{formatButtonLabel()}</span>

        {/* Clear custom date button */}
        {selectedDate && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClearDate();
              setIsOpen(false);
            }}
            className="ml-0.5 p-0.5 hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            title="Clear date filter"
          >
            <X className="w-3 h-3 text-white" />
          </span>
        )}
      </button>

      {/* Popover Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            data-no-swipe="true"
            className="absolute right-0 top-full mt-2 w-72 p-4 bg-white rounded-2xl border border-[#E6DFD5] shadow-lg z-50"
          >
            {/* Header: Month/Year navigation */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6DFD5]/60">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 text-[#78716A] hover:text-[#2D2A26] hover:bg-[#FAF7F2] rounded-xl transition-colors cursor-pointer"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-serif-accent font-bold text-[#2D2A26] text-base italic">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 text-[#78716A] hover:text-[#2D2A26] hover:bg-[#FAF7F2] rounded-xl transition-colors cursor-pointer"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_OF_WEEK.map((d) => (
                <span key={d} className="text-[11px] font-semibold text-[#78716A]/60 py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="w-8 h-8" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const isToday = todayStr === dateKey;
                const hasCompleted = completedDates.has(dateKey);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`relative w-8 h-8 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DA7756] text-white shadow-xs'
                        : isToday
                        ? 'bg-[#FDF3EF] text-[#DA7756] border border-[#DA7756]/40 hover:bg-[#DA7756] hover:text-white'
                        : 'text-[#2D2A26] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>{day}</span>
                    {/* Small dot indicator for completed accomplishments */}
                    {hasCompleted && (
                      <span
                        className={`w-1 h-1 rounded-full absolute bottom-1 ${
                          isSelected ? 'bg-white' : 'bg-[#6E8B74]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="mt-3 pt-2.5 border-t border-[#E6DFD5]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={handleJumpToToday}
                className="text-[11px] font-semibold text-[#DA7756] hover:text-[#C86446] transition-colors cursor-pointer"
              >
                Today
              </button>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    onClearDate();
                    setIsOpen(false);
                  }}
                  className="text-[11px] font-semibold text-[#78716A] hover:text-[#2D2A26] transition-colors cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
