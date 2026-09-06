import React from 'react';
import { Goal } from '../types';
import { CheckCircle2, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompletedViewProps {
  completedHistory: Goal[];
  onDeleteCompletedGoal: (id: string) => void;
}

interface GroupedGoals {
  dateKey: string;
  displayDate: string;
  goals: Goal[];
}

export const CompletedView: React.FC<CompletedViewProps> = ({
  completedHistory,
  onDeleteCompletedGoal,
}) => {
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

  // Group goals by date
  const groupedGoals: GroupedGoals[] = React.useMemo(() => {
    const map = new Map<string, { displayDate: string; goals: Goal[] }>();

    // Process goals (newest completedAt first)
    const sorted = [...completedHistory].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    sorted.forEach((goal) => {
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
  }, [completedHistory]);

  if (completedHistory.length === 0) {
    return (
      <main className="flex-1 px-8 py-12 flex flex-col items-center justify-center max-w-7xl w-full mx-auto text-center select-none">
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
      </main>
    );
  }

  return (
    <main className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto overflow-y-auto custom-scrollbar select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2D2A26]">Completed History</h1>
          <p className="text-xs text-[#78716A] mt-0.5">
            {completedHistory.length} total goal{completedHistory.length === 1 ? '' : 's'} completed
          </p>
        </div>
      </div>

      <div className="space-y-8 pb-8">
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
                        className="p-1.5 text-[#78716A]/50 hover:text-red-500 hover:bg-white rounded-xl transition-colors"
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
    </main>
  );
};
