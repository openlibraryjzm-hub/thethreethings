import React, { useState, useEffect } from 'react';
import { Goal, AppState, ActiveView } from './types';
import { CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { GoalCard } from './components/GoalCard';
import { CompletedView } from './components/CompletedView';
import { PainPointsView } from './components/PainPointsView';
import { MediaView } from './components/MediaView';
import { HealthView } from './components/HealthView';
import { TipView } from './components/TipView';
import { SupportView } from './components/SupportView';

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
  const [activeView, setActiveView] = useState<ActiveView>('focus');

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

  const handleCompleteGoal = (
    id: string,
    completedSubGoals?: string[],
    remainingTitle?: string
  ) => {
    setState((prev) => {
      const targetGoal = prev.goals.find((g) => g.id === id);
      if (!targetGoal || targetGoal.isCompleted) return prev;

      const completedTimestamp = Date.now();

      // Handle sub-goals completion when '//' separator was used
      if (completedSubGoals && completedSubGoals.length > 0) {
        const newCompletedHistoryItems: Goal[] = completedSubGoals.map((subTitle, idx) => ({
          id: `completed-${completedTimestamp}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
          title: subTitle,
          isCompleted: true,
          completedAt: completedTimestamp + idx,
        }));

        const hasRemaining = typeof remainingTitle === 'string' && remainingTitle.trim().length > 0;

        return {
          ...prev,
          totalCompletedCount: prev.totalCompletedCount + completedSubGoals.length,
          goals: prev.goals.map((g) => {
            if (g.id !== id) return g;
            if (hasRemaining) {
              // Unselected sub-goals remain active in the card slot
              return {
                ...g,
                title: remainingTitle.trim(),
                isCompleted: false,
                completedAt: undefined,
              };
            } else {
              // All sub-goals completed: slot is fully completed
              return {
                ...g,
                isCompleted: true,
                completedAt: completedTimestamp,
              };
            }
          }),
          completedHistory: [...newCompletedHistoryItems, ...prev.completedHistory],
        };
      }

      // Standard single goal completion
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
        <main className="flex-1 min-h-0 px-4 md:px-8 py-4 md:py-6 flex flex-col justify-start md:justify-center max-w-7xl w-full mx-auto overflow-y-auto md:overflow-hidden">
          {/* Section Subtitle & Completed Counter */}
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-xs uppercase tracking-widest text-[#78716A] font-semibold">
              Today's 3 Things
            </p>
            <button
              onClick={() => setActiveView('completed')}
              className="group inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6DFD5]/40 hover:bg-[#E6DFD5]/80 border border-[#E6DFD5] text-xs text-[#78716A] hover:text-[#2D2A26] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="View all completed goals in history"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6E8B74]" />
              <span className="font-medium">
                <strong className="font-semibold text-[#2D2A26]">{state.completedHistory.length}</strong>{' '}
                {state.completedHistory.length === 1 ? 'goal' : 'goals'} completed
              </span>
              <span className="text-[#DA7756] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                · View all →
              </span>
            </button>
          </div>

          {/* Fixed 3 Goal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[calc(100%-2rem)] items-stretch">
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
      ) : activeView === 'completed' ? (
        /* Completed History Screen */
        <CompletedView
          completedHistory={state.completedHistory}
          onDeleteCompletedGoal={handleDeleteCompletedGoal}
          onBackToFocus={() => setActiveView('focus')}
        />
      ) : activeView === 'painpoints' ? (
        /* Pain Points Screen */
        <PainPointsView />
      ) : activeView === 'media' ? (
        /* Media Screen */
        <MediaView />
      ) : activeView === 'health' ? (
        /* Health Screen */
        <HealthView />
      ) : activeView === 'tip' ? (
        /* Tip Placeholder Screen */
        <TipView />
      ) : (
        /* Support Placeholder Screen */
        <SupportView />
      )}
    </div>
  );
};
