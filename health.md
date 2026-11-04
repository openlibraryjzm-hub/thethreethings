# Health View Specification 🌿

> Comprehensive technical and architectural guide for the **Health** tab in **The Three Things**.

---

## 📌 Architecture & Design Philosophy

The **Health** tab provides an intentional, present-moment reminder space focused on essential personal care: hydration, dental hygiene, and mindful freshness.

Unlike traditional habit trackers, this screen is intentionally **untracked**. It rejects streaks, backlogs, and guilt. Users are never prompted to "catch up" on items missed earlier. Instead, it serves solely as a peaceful touchpoint for the exact moment the user looks at the screen.

### 🔒 Core Design Principles

1. **Pure Present-Moment Orientation:**
   - No historical archive logging, streak tallies, or overdue backlog prompts.
   - Checked states are ephemeral to the current session or moment, freeing the user from tracking fatigue.
2. **Dynamic Time-of-Day Context:**
   - Automatically determines the current phase of the day (*morning*, *afternoon*, *evening*) directly from the device's local system clock.
   - Adapts both the primary serif greeting and the active set of care items accordingly.
3. **Time-Aware Item Filtering:**
   - **Morning & Evening:** Displays all 4 foundational care rituals (**Toothbrush**, **Mouth Wash**, **Glass of Water**, **Tooth Floss**).
   - **Afternoon:** Gracefully collapses to the 2 midday essentials (**Toothbrush**, **Glass of Water**).
4. **Balanced Responsive Composition:**
   - Morning/Evening automatically expands into a 4-card grid (`grid-cols-2 md:grid-cols-4`).
   - Afternoon collapses into a centered, spacious 2-card layout (`max-w-xl grid-cols-1 sm:grid-cols-2`).
5. **Warm Stationery Visual Integrity:**
   - Follows the app's established paper aesthetic tokens: warm cream canvas (`#FAF7F2`), subtle warm dividers (`#E6DFD5`), charcoal text (`#2D2A26`), terracotta accent (`#DA7756`), and soft sage (`#6E8B74`) for completed states.

---

## 🗂️ Component Structure

```
src/
├── types/
│   └── index.ts               # ActiveView ('focus' | 'completed' | 'media' | 'health')
├── components/
│   ├── Header.tsx             # Navigation bar including the Health tab button
│   └── HealthView.tsx         # Complete Health tab view and dynamic vector cards
└── utils/
    └── sound.ts               # Web Audio API harmonic completion chimes
```

---

## 🕒 Time Detection & Greeting Mechanics

The greeting and visible cards update automatically without requiring manual user toggles.

### 1. Clock Detection Algorithm

```typescript
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const determineTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours(); // Local 24-hour device time (0–23)
  if (hour >= 5 && hour < 12) return 'morning';    // 5:00 AM – 11:59 AM
  if (hour >= 12 && hour < 17) return 'afternoon'; // 12:00 PM – 4:59 PM
  return 'evening';                                // 5:00 PM – 4:59 AM
};
```

### 2. Autonomous Background Polling
A lightweight 60-second `setInterval` polls `determineTimeOfDay()`. If the user leaves the application open across a day-phase boundary (e.g., crossing from 11:59 AM into 12:00 PM), the layout transitions smoothly in real time without a page reload.

### 3. Greeting Representation

| Phase | Time Window | Greeting Header | Leading Icon |
| :--- | :--- | :--- | :--- |
| **Morning** | `05:00 – 11:59` | `Good morning` | `<Sun className="text-[#DA7756]" />` |
| **Afternoon** | `12:00 – 16:59` | `Good afternoon` | `<SunMedium className="text-[#DA7756]" />` |
| **Evening** | `17:00 – 04:59` | `Good evening` | `<Moon className="text-[#6E8B74]" />` |

---

## 🃏 Reminder Cards Specification

Each care reminder is rendered as a clean tactile card containing an inline vector SVG illustration, title, hint, and completion indicator.

```typescript
interface ReminderItem {
  id: string;
  name: string;
  hint: string;
  type: 'toothbrush' | 'water' | 'mouthwash' | 'floss';
  showInAfternoon: boolean;
}
```

### Item Catalog

1. **Toothbrush (`type: 'toothbrush'`):**
   - **Visibility:** Always visible (Morning, Afternoon, Evening).
   - **Hint:** `"Gentle 2-minute clean"`
   - **Artwork:** Ergonomic toothbrush with textured grip, rose gold/terracotta collar, and multi-tier bristle tufts.
2. **Glass of Water (`type: 'water'`):**
   - **Visibility:** Always visible (Morning, Afternoon, Evening).
   - **Hint:** `"Cool, fresh hydration"`
   - **Artwork:** Fluted drinking tumbler filled with refreshing water, wave meniscus, and gentle bubble particles.
3. **Mouth Wash (`type: 'mouthwash'`):**
   - **Visibility:** Morning & Evening only (hidden in Afternoon).
   - **Hint:** `"30-second rinse"`
   - **Artwork:** Minimalist apothecary bottle with measuring cap, neck ring, and minty liquid reservoir.
4. **Tooth Floss (`type: 'floss'`):**
   - **Visibility:** Morning & Evening only (hidden in Afternoon).
   - **Hint:** `"Clean between each tooth"`
   - **Artwork:** Smooth pebble-style dispenser with flip cap, viewing spool window, and pulled floss strand.

---

## ⚡ Interaction & Acoustic Feedback

1. **Single-Click Toggle:**
   - Clicking anywhere on an item card toggles its checked state for the current session.
   - Playing the synthesized acoustic chime (`playCompletionSound()`).
2. **Celebratory Completion:**
   - When all visible items for the current day-phase are marked done, a celebratory confetti burst fires (`canvas-confetti`) using brand palette tones: `['#DA7756', '#6E8B74', '#FAF7F2', '#3B82F6']`.
3. **Peaceful Reset:**
   - A discreet **Clear** button appears when any item is checked, allowing the user to reset the cards back to uncompleted with one tap.

---

## 🎨 Visual Design Tokens Reference

| Role | Token / Value | CSS / Tailwind Class | Application |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#FAF7F2` | `bg-[#FAF7F2]` | Page canvas background |
| **Card Surface** | `#FFFFFF` | `bg-white` | Active reminder card background |
| **Card Border** | `#E6DFD5` | `border-[#E6DFD5]` | Card borders and divider lines |
| **Checked Surface** | `#F0F4F1` to `#FFFFFF` | `bg-gradient-to-b from-[#F0F4F1] to-white` | Checked card highlight gradient |
| **Checked Border** | `#6E8B74`/50 | `border-[#6E8B74]/50` | Border on completed item |
| **Primary Text** | `#2D2A26` | `text-[#2D2A26]` | Primary titles and headings |
| **Muted Text** | `#78716A` | `text-[#78716A]` | Subtitles, hints, and timestamps |
| **Accent Terracotta** | `#DA7756` | `text-[#DA7756]` | Morning sun and brand highlights |
| **Accent Sage** | `#6E8B74` | `text-[#6E8B74]` | Evening moon and completion icons |

---

## 💡 Guidelines for Developers & Future Agents

1. **Preserve Untracked Simplicity:** Never attach a persistent database log, streak counter, or "past due" notification to this view. The architectural requirement is zero tracking friction.
2. **Preserve Time Filter Rules:** Mouthwash and floss must strictly hide in the afternoon (`12:00 – 16:59`). Always verify grid symmetry when modifying the card collection.
3. **No External Image Assets:** All item graphics are authored in pure code using self-contained vector SVGs to ensure crisp rendering at any desktop DPI and zero asset loading delay.
