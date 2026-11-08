import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Goal, AppState, ActiveView } from './types';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { Header } from './components/Header';
import { GoalCard } from './components/GoalCard';
import { CompletedView } from './components/CompletedView';
import { PainPointsView } from './components/PainPointsView';
import { MediaView } from './components/MediaView';
import { HealthView } from './components/HealthView';
import { TipView } from './components/TipView';
import { SettingsView, getStoredSettings } from './components/SettingsView';
import { syncScheduledReminders } from './utils/notifications';

const STORAGE_KEY = 'the_three_things_app_state_v3';

// Rotating daily mindful tip topics (24-hour cycle)
const TIP_TOPICS = [
  'shame',
  'anxiety',
  'overwhelm',
  'resistance',
  'perfectionism',
  'momentum',
  'burnout',
];

const getTodaysTipTopic = (): string => {
  const now = new Date();
  const dayIndex = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / (1000 * 60 * 60 * 24)
  );
  return TIP_TOPICS[Math.abs(dayIndex) % TIP_TOPICS.length];
};

const MAIN_TABS: ActiveView[] = ['focus', 'painpoints', 'media', 'health', 'settings'];

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
  const todayTipTopic = useMemo(() => getTodaysTipTopic(), []);

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

  // Sync scheduled notifications on startup
  useEffect(() => {
    const currentSettings = getStoredSettings();
    if (currentSettings.notifications.enabled) {
      syncScheduledReminders(currentSettings.notifications);
    }
  }, []);

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

  const activeTabIndex = MAIN_TABS.indexOf(activeView);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    startTime: number;
    lock: 'undecided' | 'horizontal' | 'vertical' | 'ignored';
  } | null>(null);

  // Sync carousel track transform whenever activeTabIndex updates (e.g. from navbar clicks or links)
  useEffect(() => {
    if (carouselTrackRef.current && activeTabIndex >= 0) {
      carouselTrackRef.current.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
      carouselTrackRef.current.style.transform = `translateX(-${activeTabIndex * 100}%)`;
    }
  }, [activeTabIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only single touch
    if (e.touches.length !== 1) {
      touchStateRef.current = null;
      return;
    }

    const touch = e.touches[0];
    const target = e.target as HTMLElement | null;

    // Strict guard against sliders, drag handles, text inputs
    if (
      target &&
      target.closest(
        'input, textarea, select, [type="range"], [data-no-swipe="true"], [role="slider"]'
      )
    ) {
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        startTime: Date.now(),
        lock: 'ignored',
      };
      return;
    }

    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      startTime: Date.now(),
      lock: 'undecided',
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const state = touchStateRef.current;
    if (!state || state.lock === 'ignored' || state.lock === 'vertical') {
      return;
    }

    if (e.touches.length !== 1) {
      state.lock = 'ignored';
      if (carouselTrackRef.current && activeTabIndex >= 0) {
        carouselTrackRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        carouselTrackRef.current.style.transform = `translateX(-${activeTabIndex * 100}%)`;
      }
      return;
    }

    const touch = e.touches[0];
    state.currentX = touch.clientX;
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    // Disambiguation
    if (state.lock === 'undecided') {
      const distance = Math.hypot(deltaX, deltaY);
      if (distance > 8) {
        // If vertical movement is dominant, lock to vertical scroll so page scrolling is completely natural
        if (Math.abs(deltaY) >= Math.abs(deltaX) * 0.85) {
          state.lock = 'vertical';
          return;
        } else if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          state.lock = 'horizontal';
          // Disable CSS transitions during active drag for instant 1:1 response
          if (carouselTrackRef.current) {
            carouselTrackRef.current.style.transition = 'none';
          }
        }
      }
    }

    if (state.lock === 'horizontal' && carouselTrackRef.current && activeTabIndex >= 0) {
      let offset = deltaX;
      // Overdrag rubberbanding at outer boundaries
      if (
        (activeTabIndex === 0 && deltaX > 0) ||
        (activeTabIndex === MAIN_TABS.length - 1 && deltaX < 0)
      ) {
        offset = deltaX * 0.25;
      }

      carouselTrackRef.current.style.transform = `translateX(calc(-${activeTabIndex * 100}% + ${offset}px))`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const state = touchStateRef.current;
    touchStateRef.current = null;

    if (!state || state.lock !== 'horizontal') {
      return;
    }

    const touch = e.changedTouches[0];
    const finalX = touch ? touch.clientX : state.currentX;
    const deltaX = finalX - state.startX;
    const deltaTime = Math.max(1, Date.now() - state.startTime);
    const velocity = deltaX / deltaTime; // px/ms

    const track = carouselTrackRef.current;
    if (!track || activeTabIndex < 0) return;

    // Restore smooth spring animation
    track.style.transition = 'transform 0.32s cubic-bezier(0.25, 1, 0.5, 1)';

    const trackWidth = track.clientWidth || window.innerWidth || 360;
    const commitThreshold = trackWidth * 0.22; // ~22% screen width or brisk flick

    let newIndex = activeTabIndex;

    if (deltaX < -commitThreshold || velocity < -0.35) {
      // Swiped Left -> advance
      if (activeTabIndex < MAIN_TABS.length - 1) {
        newIndex = activeTabIndex + 1;
      }
    } else if (deltaX > commitThreshold || velocity > 0.35) {
      // Swiped Right -> go back
      if (activeTabIndex > 0) {
        newIndex = activeTabIndex - 1;
      }
    }

    // Set position and active view
    track.style.transform = `translateX(-${newIndex * 100}%)`;
    if (newIndex !== activeTabIndex) {
      setActiveView(MAIN_TABS[newIndex]);
    }
  };

  const handleTouchCancel = () => {
    touchStateRef.current = null;
    if (carouselTrackRef.current && activeTabIndex >= 0) {
      carouselTrackRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
      carouselTrackRef.current.style.transform = `translateX(-${activeTabIndex * 100}%)`;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-[#FAF7F2] text-[#2D2A26] overflow-hidden select-none">
      {/* Top Header with View Switcher */}
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        completedCount={state.completedHistory.length}
      />

      {/* View Rendering: Sub-views (Completed & Tip) or 1:1 Interactive Main Carousel */}
      {activeView === 'completed' ? (
        <CompletedView
          completedHistory={state.completedHistory}
          onDeleteCompletedGoal={handleDeleteCompletedGoal}
          onBackToFocus={() => setActiveView('focus')}
        />
      ) : activeView === 'tip' ? (
        <TipView
          onBackToFocus={() => setActiveView('focus')}
          topic={todayTipTopic}
        />
      ) : (
        <div
          className="flex-1 min-h-0 w-full overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        >
          <div
            ref={carouselTrackRef}
            className="flex h-full w-full will-change-transform"
            style={{
              transform: `translateX(-${Math.max(0, activeTabIndex) * 100}%)`,
              transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* Page 0: Focus View */}
            <div className="w-full h-full flex-shrink-0 overflow-hidden flex flex-col">
              <main className="flex-1 min-h-0 px-4 md:px-8 py-4 md:py-6 flex flex-col justify-start md:justify-center max-w-7xl w-full mx-auto overflow-y-auto md:overflow-hidden">
                {/* Section Subheader: Daily Tip Link & Completed Counter */}
                <div className="flex items-center justify-between mb-4 px-2 flex-wrap gap-2">
                  <button
                    onClick={() => setActiveView('tip')}
                    className="group inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6DFD5]/40 hover:bg-[#E6DFD5]/80 border border-[#E6DFD5] text-xs text-[#78716A] hover:text-[#2D2A26] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                    title="Read today's mindful tip"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-[#DA7756]" />
                    <span className="font-medium">
                      Today's tip about <strong className="font-semibold text-[#2D2A26]">{todayTipTopic}</strong>
                    </span>
                    <span className="text-[#DA7756] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>
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
            </div>

            {/* Page 1: Points View (Pain Points & Media Desires) */}
            <div className="w-full h-full flex-shrink-0 overflow-hidden flex flex-col">
              <PainPointsView onNavigate={setActiveView} />
            </div>

            {/* Page 2: Media View */}
            <div className="w-full h-full flex-shrink-0 overflow-hidden flex flex-col">
              <MediaView />
            </div>

            {/* Page 3: Health View */}
            <div className="w-full h-full flex-shrink-0 overflow-hidden flex flex-col">
              <HealthView />
            </div>

            {/* Page 4: Settings View */}
            <div className="w-full h-full flex-shrink-0 overflow-hidden flex flex-col">
              <SettingsView />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
