import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { NotificationSettings } from '../types';

export const NOTIFICATION_CHANNEL_ID = 'three_things_focus';
export const TEST_NOTIFICATION_ID = 9999;
export const REMINDER_BATCH_BASE_ID = 2000;
export const REMINDER_BATCH_COUNT = 40; // Rolling queue of scheduled future notifications

const MINDFUL_PROMPTS = [
  'Take a gentle breath. What are your 3 priorities right now?',
  'Focus check-in: Are you working on what matters most today?',
  'One day at a time. Take a brief pause and realign with your focus.',
  'How is your energy? Take a moment to check in with your 3 things.',
  'Stay intentional. Celebrate any small progress you have made today.',
];

/**
 * Converts frequency setting into minutes
 */
export function getFrequencyMinutes(settings: NotificationSettings): number {
  switch (settings.frequency) {
    case '15m':
      return 15;
    case '30m':
      return 30;
    case '45m':
      return 45;
    case '1h':
      return 60;
    case 'custom':
      return Math.max(1, Math.min(1440, settings.customMinutes || 20));
    default:
      return 30;
  }
}

/**
 * Formats frequency for human-readable display
 */
export function formatFrequencyLabel(settings: NotificationSettings): string {
  switch (settings.frequency) {
    case '15m':
      return 'Every 15 minutes';
    case '30m':
      return 'Every 30 minutes';
    case '45m':
      return 'Every 45 minutes';
    case '1h':
      return 'Every 1 hour';
    case 'custom':
      const mins = settings.customMinutes || 20;
      return mins === 60 ? 'Every 1 hour' : `Every ${mins} minutes`;
    default:
      return 'Every 30 minutes';
  }
}

/**
 * Initialize native notification channel (Android 8.0+)
 */
export async function initializeNotificationChannel(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: 'Focus Reminders',
      description: 'Periodic minimalist nudges to stay aligned with your 3 things.',
      importance: 4, // High importance (heads-up banner and sound)
      visibility: 1, // Public on lockscreen
      vibration: true,
      lights: true,
      lightColor: '#DA7756',
    });
  } catch (err) {
    console.warn('Could not create notification channel:', err);
  }
}

/**
 * Check whether notification permission has been granted
 */
export async function checkNotificationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }

  // Web Browser fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return 'prompt';
  }

  return 'denied';
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await initializeNotificationChannel();
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (err) {
      console.error('Error requesting native notification permission:', err);
      return false;
    }
  }

  // Web fallback
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Cancels all pending batch reminders
 */
export async function cancelAllReminders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const idsToCancel = [];
    // Cancel legacy IDs as well as all batch IDs
    idsToCancel.push({ id: 1001 });
    idsToCancel.push({ id: 1002 });
    for (let i = 0; i < REMINDER_BATCH_COUNT + 10; i++) {
      idsToCancel.push({ id: REMINDER_BATCH_BASE_ID + i });
    }
    await LocalNotifications.cancel({ notifications: idsToCancel });
  } catch (err) {
    console.warn('Failed to cancel reminders:', err);
  }
}

/**
 * Schedules recurring interval reminders based on user selection
 */
export async function syncScheduledReminders(settings: NotificationSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await initializeNotificationChannel();
    await cancelAllReminders();

    if (!settings.enabled) {
      return;
    }

    const intervalMinutes = getFrequencyMinutes(settings);
    const intervalMs = intervalMinutes * 60 * 1000;
    const now = Date.now();

    const notificationsToSchedule = [];

    for (let i = 0; i < REMINDER_BATCH_COUNT; i++) {
      const fireTime = new Date(now + (i + 1) * intervalMs);
      const prompt = MINDFUL_PROMPTS[i % MINDFUL_PROMPTS.length];

      notificationsToSchedule.push({
        id: REMINDER_BATCH_BASE_ID + i,
        title: 'The Three Things 🎯',
        body: prompt,
        channelId: NOTIFICATION_CHANNEL_ID,
        schedule: {
          at: fireTime,
          allowWhileIdle: true,
        },
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule,
      });
    }
  } catch (err) {
    console.error('Failed to schedule periodic reminders:', err);
  }
}

/**
 * Fires a test notification in 2 seconds to verify permissions, sound & banner
 */
export async function sendTestNotification(): Promise<boolean> {
  const isGranted = (await checkNotificationPermission()) === 'granted';
  if (!isGranted) {
    const requested = await requestNotificationPermission();
    if (!requested) return false;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await initializeNotificationChannel();
      const fireDate = new Date(Date.now() + 2500); // 2.5 seconds from now

      await LocalNotifications.schedule({
        notifications: [
          {
            id: TEST_NOTIFICATION_ID,
            title: 'The Three Things 🎯',
            body: 'Focus reminders are active! Periodic check-ins will arrive on schedule.',
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: {
              at: fireDate,
              allowWhileIdle: true,
            },
          },
        ],
      });
      return true;
    } catch (err) {
      console.error('Failed to schedule native test notification:', err);
      return false;
    }
  }

  // Web Browser fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    setTimeout(() => {
      new Notification('The Three Things 🎯', {
        body: 'Focus reminders are active! (Web Notification Preview)',
        icon: '/favicon.ico',
      });
    }, 1500);
    return true;
  }

  return false;
}
