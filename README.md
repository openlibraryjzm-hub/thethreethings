# The Three Things 🎯

> A minimalist daily focus space for setting 3 daily goals, tracking progress, and archiving accomplishments.

---

## 📖 About The Project

**The Three Things** is designed to feel calm, tactile, and intentional — like a physical desk paper pad rather than an overwhelming project management dashboard.

Users focus on setting their top 3 daily priorities on a clean Focus screen. When a goal is accomplished, completing it triggers a tactile gesture, celebratory acoustic feedback, and permanently logs the task into an archive. A dedicated Media tab allows tracking books, shows, and serialized items with artwork and minimalist terminal progress counters.

---

## 🎨 Visual Design System & Aesthetic Tokens

The app uses warm, earthy paper tones to minimize eye strain and evoke physical stationery:

| Token Role | Hex Code | Tailwind / CSS Class | Description |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FAF7F2` | `bg-[#FAF7F2]` | Soft warm cream paper background |
| **Header & Surface** | `#F5F0E8` | `bg-[#F5F0E8]` | Slightly deeper cream for header bars and containers |
| **Primary Text** | `#2D2A26` | `text-[#2D2A26]` | Warm charcoal/dark brown for gentle, soft contrast |
| **Muted Text** | `#78716A` | `text-[#78716A]` | Earthy warm taupe for subtitles, timestamps, and icons |
| **Borders & Dividers** | `#E6DFD5` | `border-[#E6DFD5]` | Subtle warm divider lines |
| **Primary Accent** | `#DA7756` | `text-[#DA7756]`, `bg-[#DA7756]` | Terracotta / Warm Coral for active branding and action buttons |
| **Primary Hover** | `#C86446` | `hover:bg-[#C86446]` | Deeper terracotta for hover and active button states |
| **Primary Tint** | `#FDF3EF` | `bg-[#FDF3EF]` | Soft terracotta background tint for badges & slider tracks |
| **Success / Done** | `#6E8B74` | `text-[#6E8B74]`, `bg-[#F0F4F1]` | Muted Sage Green for completed tasks and badges |

### ✒️ Typography & Radii
- **Accents & Numerals (`font-serif-accent`):** Italic serif typeface (`Instrument Serif` / Georgia) for brand titles and goal numbers (`01`, `02`, `03`).
- **Body & Controls:** Modern sans-serif (`Plus Jakarta Sans`) for inputs and controls.
- **Card Geometry:** `rounded-3xl` (24px–32px) for organic tactile cards; `rounded-2xl` for pills and buttons.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 + Lucide React icons
- **Animations:** Framer Motion
- **Sound Synthesis:** Web Audio API (offline, zero-latency harmonic acoustic chimes)
- **Effects:** Canvas Confetti
- **Desktop Application Wrapper:** Tauri v2 (Rust backend wrapper)
- **Persistence:** Synchronous `localStorage` serialization (`the_three_things_app_state_v3`, `the_three_things_media_cards_v1`)

---

## 📁 Project Structure

```
the-three-things/
├── docs/
│   ├── FOCUS_VIEW.md          # In-depth guide: 3 permanent slots, slide-to-complete, sound & confetti
│   ├── COMPLETED_VIEW.md      # In-depth guide: history archive, filtering, calendar popover, pagination
│   └── MEDIA.md               # In-depth guide: 4 stacked cards, terminal counter, image compression
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Top bar with logo, "One day at a time" badge, and view tabs
│   │   ├── GoalCard.tsx       # Focus screen 3-card grid item with auto-resizing input
│   │   ├── SlideToComplete.tsx# Tactile slide knob preventing accidental completions
│   │   ├── CalendarPopover.tsx# In-app calendar popover with accomplishment activity dots
│   │   ├── CompletedView.tsx  # Completed history page with filtering and 50/page pagination
│   │   ├── PainPointsView.tsx # Physics-based stone cairn stack for persistent life pain points
│   │   ├── HealthView.tsx     # Health screen with dynamic time greeting & untracked care reminders
│   │   ├── TipView.tsx        # Mindful focus tips and guidance
│   │   └── SettingsView.tsx   # Settings screen with focus reminder cadences & backup
│   ├── utils/
│   │   ├── sound.ts           # Web Audio API harmonic chime & tactile stamp sound effect
│   │   ├── confetti.ts        # Celebration confetti with warm color tokens
│   │   └── notifications.ts   # On-device Capacitor local notification queue & channel
│   ├── types/
│   │   └── index.ts           # TypeScript definitions for Goal, AppState, and ActiveView
│   ├── styles/
│   │   └── globals.css        # Tailwind CSS imports, color tokens, and custom scrollbar
│   ├── App.tsx                # Root state management, persistence, and view switching
│   └── main.tsx               # Application entry point
├── src-tauri/                 # Tauri v2 native desktop configuration & Rust files
├── package.json               # NPM scripts & dependencies
├── navbar.md                  # Dedicated context guide for the Header & Navigation bar
├── health.md                  # Dedicated context guide for the Health tab
├── painpoint.md               # Dedicated context guide for the Pain Points tab
├── notification.md            # Dedicated context guide for Focus Notifications & Cadence
├── build.md                   # Dedicated guide for Android APK builds & device deployment
└── README.md                  # This file
```

---

## 🔑 Data Models

Defined in [`src/types/index.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/types/index.ts):

```typescript
export type ActiveView = 'focus' | 'completed' | 'painpoints' | 'health' | 'tip' | 'settings' | 'support' | 'media';

export interface Goal {
  id: string;          // Unique ID (e.g. 'goal-1' on focus screen, or timestamped ID in history)
  title: string;       // Text content of the goal
  isCompleted: boolean;// Goal completion status
  completedAt?: number;// Unix timestamp (ms) when completed
}

export interface AppState {
  goals: Goal[];             // Exactly 3 permanent active goal slots
  completedHistory: Goal[];  // Log of all completed goals over time
  totalCompletedCount: number;// Running tally of completed goals
}

export type ReminderFrequency = '15m' | '30m' | '45m' | '1h' | 'custom';

export interface NotificationSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
  customMinutes?: number;
}

export interface AppSettings {
  notifications: NotificationSettings;
}
```

---

## 📚 View Specifications & Documentation

For detailed functional specifications and component mechanics, refer to the dedicated view guides:

- 🧭 **[Navigation Bar Specification](navbar.md)**
  - Adaptive active label vs. inactive icon-only tab interaction
  - 6-space hierarchy: Focus, Pain Points, Media, Health, Tip, Settings
  - Decoupling of completed history access to preserve 3-card grid isolation
- 🔔 **[Notification System Specification](notification.md)**
  - Quiet on-device focus reminder philosophy and serverless architecture
  - Native Capacitor local notifications, high-importance Android channel, and Doze-mode execution
  - Rolling queue algorithm (40 future alarms) and rotating mindful prompt pool
  - Settings UI: master permission toggle, 5-stop cadence slider (15m, 30m, 45m, 1h, Custom)
- 🎯 **[Focus View Specification](docs/FOCUS_VIEW.md)**
  - Fixed 3-card layout rules
  - Sub-goal separation (`//`), multi-selection, and partial completion mechanics
  - Slide to Complete drag mechanics and threshold physics
  - Sound synthesis & celebration confetti
  - Post-completion actions ("Reset Goal" vs "New Goal")
- 📜 **[Completed View Specification](docs/COMPLETED_VIEW.md)**
  - Decoupled archive data model (unlimited history logging)
  - Timeframe filters: Today, Yesterday, All Time
  - Custom in-app calendar popover with accomplishment activity dots
  - 50-items-per-page pagination and scroll container behavior
- ⛰️ **[Pain Points Specification](painpoint.md)**
  - Confined word cloud chamber with organic typographic scaling
  - Strict 26-character input limit keeping entries punchy and preventing sentence tasks
  - Quick-glance friction reservoir that feeds directly into the 3 daily Focus goals
  - Dedicated Remove mode with multi-select and confirmation to dismiss handled friction
- 🎬 **[Media View Specification](media.md)**
  - Curated editorial Monthly Theme card & 4-slot media queue
  - Enforced locked card dimensions (`h-[230px] md:h-[240px]`) with fixed image frame (`h-[152px] md:h-[162px]`)
  - Tactile slide-to-complete button with warm confetti and acoustic chime feedback
  - Drag-and-drop media artwork upload with client-side canvas compression
- 🌿 **[Health View Specification](health.md)**
  - Dynamic time-of-day greeting (*"Good morning"*, *"Good afternoon"*, *"Good evening"*)
  - Pure present-moment reminder (completely untracked, zero catch-up prompts or streak pressure)
  - 4 tactile vector items: Toothbrush, Glass of Water, Mouth Wash, Tooth Floss
  - Time-aware display rule: Mouth wash and tooth floss appear only in morning and evening; afternoon gracefully collapses to Toothbrush and Glass of Water

---

## ⚡ Development & Build Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the local Vite development server (`http://localhost:1421`) |
| `npm run tauri dev` | Launch the app inside the native Tauri desktop window in dev mode |
| `npm run build` | Run TypeScript type checks (`tsc`) & production build (`vite build`) |
| `npm run preview` | Preview production build locally |
| `npm run build:android` | Build the Android APK (`TheThreeThings.apk`) |

---

## 💡 Guidelines for Developers & AI Assistants

1. **Maintain Palette Integrity:** Strictly use the warm cream (`#FAF7F2`), terracotta (`#DA7756`), and sage (`#6E8B74`) palette. Avoid default cold blues or jarring dark-mode toggles.
2. **Permanent Slots Rules:**
   - Focus screen: exactly 3 cards (`ensureThreeGoals`).
   - Media screen: exactly 4 cards with locked card bounds.
3. **Always Run Type Checks:** Before completing changes, verify build health with `npm run build` (`tsc && vite build`).
