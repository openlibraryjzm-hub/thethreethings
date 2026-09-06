import React, { useState, useEffect } from 'react';
import { Goal, AppState } from './types';
import { Header } from './components/Header';
import { GoalCard } from './components/GoalCard';
import { CompletedView } from './components/CompletedView';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'the_three_things_app_state_v3';

const defaultGoals: Goal[] = [
  {
    id: 'goal-1',
    title: '',
    isCompleted: false,
  },
  {
    id: 'goal-2',
    title: '',
    isCompleted: false,
  },
  {
    id: 'goal-3',
    title: '',
    isCompleted: false,
  },
];

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'focus' | 'completed'>('focus');

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          goals: parsed.goals || defaultGoals,
          completedHistory: parsed.completedHistory || [],
          totalCompletedCount: parsed.totalCompletedCount || 0,
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return {
      goals: defaultGoals,
      completedHistory: [],
      totalCompletedCount: 0,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const handleCompleteGoal = (id: string) => {
    setState((prev) => {
      const targetGoal = prev.goals.find((g) => g.id === id);
      if (!targetGoal || targetGoal.isCompleted) return prev;

      const completedTimestamp = Date.now();
      const completedGoalItem: Goal = {
        ...targetGoal,
        isCompleted: true,
        completedAt: completedTimestamp,
      };

      return {
        ...prev,
        totalCompletedCount: prev.totalCompletedCount + 1,
        goals: prev.goals.map((g) =>
          g.id === id ? { ...g, isCompleted: true, completedAt: completedTimestamp } : g
        ),
        // Add to completed history log (avoid duplicates)
        completedHistory: [
          completedGoalItem,
          ...prev.completedHistory.filter((h) => h.id !== id),
        ],
      };
    });
  };

  const handleDeleteCompletedGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      completedHistory: prev.completedHistory.filter((g) => g.id !== id),
    }));
  };

  const handleClearGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, title: '', isCompleted: false } : g
      ),
    }));
  };

  const handleRemoveSlot = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const handleAddSlot = () => {
    if (state.goals.length >= 3) return; // Hard limit 3
    const newId = `goal-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          id: newId,
          title: '',
          isCompleted: false,
        },
      ],
    }));
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-[#FAF7F2] text-[#2D2A26] overflow-hidden select-none">
      {/* Top Header with View Switcher */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        completedCount={state.completedHistory.length}
      />

      {/* Conditional View Rendering */}
      {activeView === 'focus' ? (
        /* Main Focus Screen Content: 3 Prominent Goal Cards */
        <main className="flex-1 px-8 py-6 flex flex-col justify-center max-w-7xl w-full mx-auto overflow-hidden">
          {/* Subtle Section Subtitle */}
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-xs uppercase tracking-widest text-[#78716A] font-semibold">
              Today's 3 Things ({state.goals.length}/3)
            </p>
            <span className="text-xs text-[#78716A]/70 font-medium italic">
              Focus on what matters today
            </span>
          </div>

          {/* The 3 Goal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-2rem)] items-stretch">
            <AnimatePresence mode="popLayout">
              {state.goals.map((goal, idx) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  index={idx}
                  onUpdateGoal={handleUpdateGoal}
                  onCompleteGoal={handleCompleteGoal}
                  onClearGoal={(id) => {
                    if (state.goals.length > 1) {
                      handleRemoveSlot(id);
                    } else {
                      handleClearGoal(id);
                    }
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Add Goal Slot Card if under hard limit of 3 */}
            {state.goals.length < 3 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleAddSlot}
                className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-[#E6DFD5] hover:border-[#DA7756] hover:bg-[#FDF3EF]/40 text-[#78716A] hover:text-[#DA7756] transition-all group h-full cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F5F0E8] group-hover:bg-[#FDF3EF] flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm">Add Goal Slot ({state.goals.length + 1}/3)</span>
                <span className="text-xs text-[#78716A]/60 mt-1">Keep it simple. Up to 3.</span>
              </motion.button>
            )}
          </div>
        </main>
      ) : (
        /* Completed History Screen */
        <CompletedView
          completedHistory={state.completedHistory}
          onDeleteCompletedGoal={handleDeleteCompletedGoal}
        />
      )}
    </div>
  );
};
