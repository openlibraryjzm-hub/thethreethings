export type ActiveView = 'focus' | 'completed' | 'painpoints' | 'health' | 'tip' | 'support' | 'media';

export interface PainPoint {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: number;
  createdAt: number;
}

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
