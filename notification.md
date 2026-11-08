# Notification System Specification 🔔

> Comprehensive technical and architectural guide for the on-device focus reminder system in **The Three Things**.

---

## 📌 Architecture & Design Philosophy

The notification system in **The Three Things** is designed to provide peaceful, periodic touchpoints that gently reconnect the user to their top 3 daily priorities without creating digital fatigue, urgency anxiety, or noise.

### 🔒 Core Design Principles

1. **Quiet & Mindful Cadence:**
   - Notifications are calm focus inquiries (*e.g., "Take a gentle breath. What are your 3 priorities right now?"*), not urgent push alerts or guilt-inducing gamification pings.
   - Reminders operate on an intentional cadence chosen by the user: `15 mins`, `30 mins`, `45 mins`, `1 hr`, or a tailored `custom` duration.
2. **Offline-First & Serverless:**
   - The app has no backend servers, no Firebase Cloud Messaging (FCM) dependencies, and sends zero telemetry over the network.
   - All notifications are generated, scheduled, and delivered purely on-device via Android's native `AlarmManager`.
3. **Respectful Lifecycle Management:**
   - Disabling notifications immediately cancels all pending scheduled alarms on the device.
   - Rescheduling clears previous queued alarm slots before registering the new sequence to eliminate duplicate triggers.
4. **Resilient Doze-Mode Execution:**
   - Notifications leverage Android's `allowWhileIdle: true` alarm flag to ensure reliable delivery even when the screen is locked and the device is in low-power Doze mode.

---

## 🗂️ Component & Data Architecture

```
src/
├── types/
│   └── index.ts                 # ReminderFrequency & NotificationSettings definitions
├── utils/
│   └── notifications.ts         # Native channel initialization, queue scheduler, permission handlers
├── components/
│   └── SettingsView.tsx         # Master toggle, stepped cadence slider, custom interval input, test trigger
└── App.tsx                      # Root startup effect that initializes channels and refreshes scheduled reminders
android/
└── app/src/main/
    └── AndroidManifest.xml      # Required Android permissions (POST_NOTIFICATIONS, VIBRATE, alarms)
```

### 1. TypeScript Data Models

Defined in [`src/types/index.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/types/index.ts):

```typescript
export type ReminderFrequency = '15m' | '30m' | '45m' | '1h' | 'custom';

export interface NotificationSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
  customMinutes?: number; // Integer (5–360), active when frequency === 'custom'
}

export interface AppSettings {
  notifications: NotificationSettings;
}
```

### 2. Local Storage Persistence

Notification settings persist synchronously in `localStorage` under the key:

```typescript
const SETTINGS_STORAGE_KEY = 'the_three_things_settings';
```

Default fallback configuration:

```typescript
export const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: false,
    frequency: '30m',
    customMinutes: 20,
  },
};
```

---

## ⚙️ Technical Implementation & Android Mechanics

### 1. Native Plugin & Manifest Configuration

Local notifications are powered by the official `@capacitor/local-notifications` plugin.

#### Android Manifest Declarations
Declared in [`android/app/src/main/AndroidManifest.xml`](file:///c:/Users/GGPC/Desktop/todaysthree/android/app/src/main/AndroidManifest.xml):

```xml
<!-- Notifications & Alarm Permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

- `POST_NOTIFICATIONS`: Mandatory runtime permission requirement on Android 13+ (API level 33+).
- `SCHEDULE_EXACT_ALARM`: Enables exact timing precision for reminder intervals.
- `RECEIVE_BOOT_COMPLETED`: Preserves and re-registers pending alarms across device reboots.

### 2. Notification Channel Setup

Android 8.0+ (API level 26+) requires notification channels. The channel is configured in `initializeNotificationChannel()` within [`src/utils/notifications.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/utils/notifications.ts):

| Parameter | Configuration | Purpose |
| :--- | :--- | :--- |
| **Channel ID** | `'three_things_focus'` | Unique identifier for focus nudges |
| **Name** | `'Focus Reminders'` | Displayed in Android system notification settings |
| **Importance** | `4` (`IMPORTANCE_HIGH`) | Enables heads-up banner display and audio chime |
| **Visibility** | `1` (`VISIBILITY_PUBLIC`) | Displays cleanly on secure lockscreens |
| **Light Color** | `#DA7756` | Terracotta brand color for device LED notification lights |
| **Vibration** | `true` | Haptic pulse to capture attention gently |

### 3. Rolling Queue Scheduling Algorithm

Because Capacitor does not provide an arbitrary sub-hourly interval cron (such as "every 15 minutes"), the app implements a **Rolling Queue of 40 Alarms**:

```
Base ID: 2000 ────────► 2001 ────────► 2002 ────────► ... ────────► 2039
[Now + 1x interval]  [Now + 2x interval] [Now + 3x interval]    [Now + 40x interval]
```

- **Queue Capacity:** Exactly 40 future notification slots (`REMINDER_BATCH_COUNT = 40`).
- **Identifier Range:** Dedicated ID span from `2000` to `2039` prevents ID collisions with test notifications (`9999`) or legacy notifications.
- **Queue Span:**
  - `15m` interval: Covers **10 continuous hours** of active focus nudges.
  - `30m` interval: Covers **20 continuous hours**.
  - `45m` interval: Covers **30 continuous hours**.
  - `1h` interval: Covers **40 continuous hours**.
- **Automatic Queue Refresh:** Every time the user opens the app or changes notification settings, `App.tsx` calls `syncScheduledReminders()` to refresh the queue forward from the current timestamp.

### 4. Mindful Rotating Copy Pool

Rather than repeating an identical sentence that becomes invisible to the user over time, notifications draw round-robin from a calibrated pool of 5 quiet prompts:

```typescript
const MINDFUL_PROMPTS = [
  'Take a gentle breath. What are your 3 priorities right now?',
  'Focus check-in: Are you working on what matters most today?',
  'One day at a time. Take a brief pause and realign with your focus.',
  'How is your energy? Take a moment to check in with your 3 things.',
  'Stay intentional. Celebrate any small progress you have made today.',
];
```

### 5. Instant Test Notification

To verify audio, vibration, and banner permissions on real hardware without waiting for a scheduled interval, users can trigger `sendTestNotification()`:
- Schedules a single test notification with ID `9999` firing **2.5 seconds** into the future.
- If permission has not been granted yet, it automatically triggers the native permission prompt.
- In desktop browsers, falls back gracefully to `new Notification()` API with 1.5s delay.

---

## 🎨 UI & User Experience

The notification controls live within the **Settings** view (`activeView === 'settings'`), accessible via the `<Settings />` tab in the top navigation bar.

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Focus Reminders                           [ Toggle: ON ] │
│ Gentle periodic nudges to stay connected to your priorities │
├─────────────────────────────────────────────────────────────┤
│ REMINDER CADENCE                         [ Every 30 minutes ]│
│                                                             │
│ ───●─────────────────────────────────────────────────────── │
│ [ 15 mins ] [ 30 mins ] [ 45 mins ] [ 1 hr ] [ Custom ]    │
│                                                             │
│ (If Custom): Set custom interval: [ 20 ] minutes            │
├─────────────────────────────────────────────────────────────┤
│ Want to preview how nudges appear?     [ Test Notification ]│
└─────────────────────────────────────────────────────────────┘
```

### 1. Master Toggle
- A clean pill toggle styled with the primary terracotta token (`#DA7756`).
- When toggled ON for the first time, prompts for device permissions.
- When toggled OFF, clears all scheduled alarms and collapses interactive controls into a disabled state.

### 2. Stepped Cadence Slider
- Range slider input (`min="0"`, `max="4"`, `step="1"`).
- Synced dual-control: Users can drag the slider thumb **or** tap any of the 5 discrete step pills (`15 mins`, `30 mins`, `45 mins`, `1 hr`, `Custom`) directly.
- Active pill displays in solid terracotta (`bg-[#DA7756] text-white`).

### 3. Custom Minute Input
- Automatically revealed via Framer Motion height expansion when `custom` is selected.
- Number input clamped between **5 minutes** and **360 minutes** (6 hours) to prevent battery drain from sub-minute polling while allowing extended focus sessions.

---

## 🤖 AI Agent Onboarding & Invariant Rules

When maintaining or extending the notification system, follow these invariants:

1. **Maintain In-App Isolation:**
   - Do **not** introduce third-party push notification SDKs (Firebase, OneSignal) or cloud push relays. All scheduling must remain strictly local and private to the device.
2. **Preserve Alarm ID Boundaries:**
   - Reserve IDs `2000` to `2049` strictly for periodic reminder queue slots.
   - Reserve ID `9999` strictly for manual test notifications.
   - Never use random integer IDs, as untracked IDs cannot be cleanly cancelled when the user disables notifications.
3. **Always Sync Alarms in `App.tsx`:**
   - Whenever modifying the application startup cycle in `App.tsx`, preserve the mount effect that calls `syncScheduledReminders()` if notifications are enabled. This ensures the 40-notification rolling window stays replenished.
4. **Stationery Aesthetic Tokens:**
   - Maintain the paper token palette: Canvas (`#FAF7F2`), Container surface (`#F5F0E8`), Dividers (`#E6DFD5`), Text (`#2D2A26`), Muted (`#78716A`), and Terracotta accent (`#DA7756`).
