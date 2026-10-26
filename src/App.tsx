import React, { useState, useEffect } from 'react';
import { Goal, AppState } from './types';
import { Header } from './components/Header';
import { GoalCard } from './components/GoalCard';
import { CompletedView } from './components/CompletedView';

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

// Always enforce exactly 3 goal slots
const ensureThreeGoals = (goals: Goal[]): Goal[] => {
  const result = [...goals];
  while (result.length < 3) {
    result.push({
      id: `goal-${result.length + 1}`,
      title: '',
      isCompleted: false,
    });
  }
  return result.slice(0, 3);
};

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'focus' | 'completed'>('focus');

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const loadedGoals = Array.isArray(parsed.goals) ? parsed.goals : defaultGoals;
        return {
          goals: ensureThreeGoals(loadedGoals),
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
      // Generate a distinct unique ID for every completed archive entry
      // so completing any slot accumulates an unlimited accomplishment history
      const uniqueCompletedId = `completed-${completedTimestamp}-${Math.random().toString(36).slice(2, 8)}`;
      const completedGoalItem: Goal = {
        ...targetGoal,
        id: uniqueCompletedId,
        isCompleted: true,
        completedAt: completedTimestamp,
      };

      return {
        ...prev,
        totalCompletedCount: prev.totalCompletedCount + 1,
        goals: prev.goals.map((g) =>
          g.id === id ? { ...g, isCompleted: true, completedAt: completedTimestamp } : g
        ),
        // Prepend to history without overwriting previous accomplishments
        completedHistory: [completedGoalItem, ...prev.completedHistory],
      };
    });
  };

  const handleDeleteCompletedGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      completedHistory: prev.completedHistory.filter((g) => g.id !== id),
    }));
  };

  // Wipes card contents back to blank without ever removing the card slot
  const handleClearGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, title: '', isCompleted: false, completedAt: undefined } : g
      ),
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
        /* Main Focus Screen Content: Fixed 3 Goal Cards */
        <main className="flex-1 min-h-0 px-8 py-6 flex flex-col justify-center max-w-7xl w-full mx-auto overflow-hidden">
          {/* Section Subtitle */}
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-xs uppercase tracking-widest text-[#78716A] font-semibold">
              Today's 3 Things
            </p>
            <span className="text-xs text-[#78716A]/70 font-medium italic">
              Focus on what matters today
            </span>
          </div>

          {/* Fixed 3 Goal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100%-2rem)] items-stretch">
            {state.goals.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={idx}
                onUpdateGoal={handleUpdateGoal}
                onCompleteGoal={handleCompleteGoal}
                onClearGoal={handleClearGoal}
              />
            ))}
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
