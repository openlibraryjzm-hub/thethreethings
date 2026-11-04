import React, { useState, useMemo, useEffect } from 'react';
import { Goal } from '../types';
import {
  CheckCircle2,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPopover } from './CalendarPopover';

interface CompletedViewProps {
  completedHistory: Goal[];
  onDeleteCompletedGoal: (id: string) => void;
  onBackToFocus?: () => void;
}

interface GroupedGoals {
  dateKey: string;
  displayDate: string;
  goals: Goal[];
}

type FilterType = 'all' | 'today' | 'yesterday' | 'custom';

const ITEMS_PER_PAGE = 50;

export const CompletedView: React.FC<CompletedViewProps> = ({
  completedHistory,
  onDeleteCompletedGoal,
  onBackToFocus,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [customDate, setCustomDate] = useState<string>(''); // YYYY-MM-DD
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Helper to format date header
  const getDisplayDate = (timestamp?: number): { dateKey: string; displayDate: string } => {
    if (!timestamp) return { dateKey: 'unknown', displayDate: 'Earlier' };
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

    const formattedStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (isToday) {
      return { dateKey, displayDate: `Today — ${formattedStr}` };
    }
    if (isYesterday) {
      return { dateKey, displayDate: `Yesterday — ${formattedStr}` };
    }
    return { dateKey, displayDate: formattedStr };
  };

  // Helper to format completion timestamp (e.g., 2:45 PM)
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Collect set of unique dates that have accomplishments (for calendar dots)
  const completedDates = useMemo(() => {
    const set = new Set<string>();
    completedHistory.forEach((goal) => {
      if (goal.completedAt) {
        const d = new Date(goal.completedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        set.add(key);
      }
    });
    return set;
  }, [completedHistory]);

  // 1. Filter goals by selected timeframe
  const filteredGoals = useMemo(() => {
    const sorted = [...completedHistory].sort(
      (a, b) => (b.completedAt || 0) - (a.completedAt || 0)
    );

    if (filter === 'all') return sorted;

    const now = new Date();

    return sorted.filter((goal) => {
      if (!goal.completedAt) return false;
      const d = new Date(goal.completedAt);

      if (filter === 'today') {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      if (filter === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return (
          d.getDate() === yesterday.getDate() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getFullYear() === yesterday.getFullYear()
        );
      }

      if (filter === 'custom' && customDate) {
        const itemDateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate()
        ).padStart(2, '0')}`;
        return itemDateKey === customDate;
      }

      return true;
    });
  }, [completedHistory, filter, customDate]);

  // 2. Pagination calculation
  const totalFiltered = filteredGoals.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));

  // Auto-clamp page if items are deleted or filter changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  // 3. Slice page items (50 per page)
  const paginatedGoals = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGoals.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredGoals, currentPage]);

  // 4. Group the current page's goals by date
  const groupedGoals: GroupedGoals[] = useMemo(() => {
    const map = new Map<string, { displayDate: string; goals: Goal[] }>();

    paginatedGoals.forEach((goal) => {
      const { dateKey, displayDate } = getDisplayDate(goal.completedAt);
      if (!map.has(dateKey)) {
        map.set(dateKey, { displayDate, goals: [] });
      }
      map.get(dateKey)!.goals.push(goal);
    });

    return Array.from(map.entries()).map(([dateKey, val]) => ({
      dateKey,
      displayDate: val.displayDate,
      goals: val.goals,
    }));
  }, [paginatedGoals]);

  const handleSelectFilter = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
    if (newFilter !== 'custom') {
      setCustomDate('');
    }
  };

  if (completedHistory.length === 0) {
    return (
      <main className="flex-1 min-h-0 px-8 py-12 flex flex-col items-center justify-center max-w-7xl w-full mx-auto text-center select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-3xl bg-[#F5F0E8] border border-[#E6DFD5] flex items-center justify-center text-[#78716A]/60 mb-4 shadow-xs"
        >
          <CheckCircle2 className="w-8 h-8 text-[#DA7756]" />
        </motion.div>
        <h2 className="text-xl font-bold text-[#2D2A26] mb-1">No completed goals yet</h2>
        <p className="text-sm text-[#78716A] max-w-sm">
          Complete goals on your daily Focus screen to start building your accomplishment history!
        </p>
        {onBackToFocus && (
          <button
            onClick={onBackToFocus}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#DA7756] hover:bg-[#C86446] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Focus</span>
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-0 px-8 py-6 max-w-7xl w-full mx-auto overflow-y-auto custom-scrollbar select-none">
      {/* Top Header & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          {onBackToFocus && (
            <button
              onClick={onBackToFocus}
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716A] hover:text-[#DA7756] transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Focus</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-[#2D2A26]">Completed History</h1>
          <p className="text-xs text-[#78716A] mt-0.5">
            {totalFiltered} goal{totalFiltered === 1 ? '' : 's'} found
            {filter !== 'all' && ` • Filtered`}
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-[#E6DFD5]/50 p-1 rounded-2xl border border-[#E6DFD5]">
            <button
              onClick={() => handleSelectFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'today'
                  ? 'bg-white text-[#2D2A26] shadow-xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleSelectFilter('yesterday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'yesterday'
                  ? 'bg-white text-[#2D2A26] shadow-xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handleSelectFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#2D2A26] shadow-xs'
                  : 'text-[#78716A] hover:text-[#2D2A26]'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Dedicated In-App Calendar Day Picker Popover */}
          <CalendarPopover
            selectedDate={filter === 'custom' ? customDate : ''}
            onSelectDate={(dateStr) => {
              setCustomDate(dateStr);
              setFilter('custom');
              setCurrentPage(1);
            }}
            onClearDate={() => {
              setCustomDate('');
              setFilter('all');
              setCurrentPage(1);
            }}
            completedDates={completedDates}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {filteredGoals.length === 0 ? (
        /* Empty Filter State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F0E8] border border-[#E6DFD5] flex items-center justify-center text-[#78716A]/60 mb-3">
            <Calendar className="w-6 h-6 text-[#DA7756]" />
          </div>
          <h3 className="text-base font-semibold text-[#2D2A26] mb-1">
            No goals completed for this selection
          </h3>
          <p className="text-xs text-[#78716A] mb-4">
            Try choosing a different timeframe or browse all-time accomplishments.
          </p>
          <button
            onClick={() => handleSelectFilter('all')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] text-xs font-semibold text-[#DA7756] hover:text-[#C86446] transition-colors cursor-pointer shadow-2xs"
          >
            Show All Time Goals
          </button>
        </div>
      ) : (
        /* Grouped Goal Cards */
        <div className="space-y-8 pb-6">
          {groupedGoals.map((group) => (
            <section key={group.dateKey} className="space-y-4">
              {/* Day Header Banner */}
              <div className="flex items-center gap-2 pb-2 border-b border-[#E6DFD5]">
                <Calendar className="w-4 h-4 text-[#DA7756]" />
                <h2 className="text-xs uppercase tracking-wider font-semibold text-[#78716A]">
                  {group.displayDate}
                </h2>
                <span className="text-xs text-[#78716A]/50 font-normal">
                  ({group.goals.length})
                </span>
              </div>

              {/* Grid of Completed Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {group.goals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative group p-5 rounded-2xl bg-[#F0F4F1]/90 border border-[#6E8B74]/30 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6E8B74]/15 text-[#6E8B74] text-xs font-semibold">
                            <Sparkles className="w-3 h-3" />
                            <span>Done</span>
                          </div>
                          {goal.completedAt && (
                            <div className="flex items-center gap-1 text-[11px] text-[#78716A]/70 font-medium">
                              <Clock className="w-3 h-3 text-[#78716A]/50" />
                              <span>{formatTime(goal.completedAt)}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-base font-semibold text-[#2D2A26] leading-snug">
                          {goal.title || 'Untitled Goal'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#6E8B74]/15 flex items-center justify-between">
                        <span className="text-[11px] text-[#78716A]/60 font-medium italic">
                          Saved in history
                        </span>
                        <button
                          onClick={() => onDeleteCompletedGoal(goal.id)}
                          className="p-1.5 text-[#78716A]/50 hover:text-red-500 hover:bg-white rounded-xl transition-colors cursor-pointer"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Pagination Bar (50 items per page) */}
      {totalFiltered > ITEMS_PER_PAGE && (
        <div className="mt-6 pt-4 pb-8 border-t border-[#E6DFD5] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <span className="text-xs text-[#78716A] font-medium">
            Showing{' '}
            <span className="font-semibold text-[#2D2A26]">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalFiltered)}
            </span>{' '}
            of <span className="font-semibold text-[#2D2A26]">{totalFiltered}</span> goals
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                currentPage === 1
                  ? 'border-[#E6DFD5]/50 text-[#78716A]/40 bg-[#F5F0E8]/50 cursor-not-allowed'
                  : 'border-[#E6DFD5] bg-white text-[#78716A] hover:text-[#2D2A26] hover:bg-[#FAF7F2] cursor-pointer shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-2 text-xs font-semibold text-[#78716A]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                currentPage === totalPages
                  ? 'border-[#E6DFD5]/50 text-[#78716A]/40 bg-[#F5F0E8]/50 cursor-not-allowed'
                  : 'border-[#E6DFD5] bg-white text-[#78716A] hover:text-[#2D2A26] hover:bg-[#FAF7F2] cursor-pointer shadow-2xs'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
