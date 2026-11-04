export type ActiveView = 'focus' | 'completed' | 'media' | 'health' | 'tip' | 'support';

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: number;
}

export interface AppState {
  goals: Goal[];
  completedHistory: Goal[];
  totalCompletedCount: number;
}
