export type ActiveView = 'focus' | 'completed' | 'painpoints' | 'health' | 'tip' | 'settings' | 'support' | 'media';

export type ReminderFrequency = '15m' | '30m' | '45m' | '1h' | 'custom';

export interface NotificationSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
  customMinutes?: number;
}

export interface AppSettings {
  notifications: NotificationSettings;
}

export type DayKey = 'Sa' | 'Su' | 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr';

export interface WeeklyMediaSlot {
  id: string;
  title: string;
  activeDays?: DayKey[]; // Days user consumed/engaged with this media (Sa, Su, Mo, Tu, We, Th, Fr)
  imageUrl?: string;
  goal?: string;         // Optional legacy field
  isCompleted?: boolean; // Derived/legacy completion status
  completedAt?: number;
}

export interface WeeklyMediaCard {
  id: string;          // e.g. 'week-2026-11-07' (Saturday start date)
  year: number;
  weekNumber?: number;
  startDate: string;   // ISO string (Saturday)
  endDate: string;     // ISO string (Friday)
  dateLabel: string;   // e.g. 'Nov 7 – 13, 2026' (Sat–Fri)
  theme?: string;      // Weekly focus or mantra
  slots: WeeklyMediaSlot[];
  createdAt: number;
  updatedAt: number;
}

export interface PainPoint {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: number;
  createdAt: number;
  scale?: number; // Custom font scale factor (default 1.0, range 0.6 to 6.0 / 60% to 600%)
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
