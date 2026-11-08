# Pain Points View Specification ⛰️

> Comprehensive technical and architectural guide for the **Pain Points** tab in **The Three Things**.

---

## 📌 Architecture & Design Philosophy

The **Pain Points** tab serves as a calm, quick-glance thought cloud for persistent life friction, chronic background tasks, and unaddressed discomfort.

Unlike traditional task managers that treat every item as an immediate checkable checkbox, this space operates as a **reference reservoir**:
- It is **not** an interactive task tracker or duplicate goal system.
- It is a reflective holding space designed for users to glance at when deciding what to pull into their **3 daily Focus goals**.

### 🔒 Core Design Principles

1. **Quick-Glance Word Cloud:**
   - Instead of an endless vertical card stack, keywords are confined within an organic, bounded cloud chamber.
   - Varied typographic scale and palette tones give natural visual hierarchy without artificial complexity.
2. **Strict Character Constraint (`MAX_CHAR_LIMIT = 26`):**
   - Inputs enforce a hard 26-character ceiling with a live monospace counter.
   - Prevents users from writing multi-line project plans or long sentence goals, keeping entries limited to punchy friction keywords (*e.g., "Bad Sleep Routine", "Neck & Posture Ache", "Tax Paperwork"*).
3. **Glance-and-Feed Relationship with Focus View:**
   - **Pain Points:** Unlimited, long-term reservoir of nagging background friction.
   - **Focus View:** Strictly 3 daily actionable priority slots.
   - Users browse their Pain Points cloud in the morning, choose what matters most, and translate it into a daily Focus card.
4. **Zero-Tracking Friction & Deliberate Removal:**
   - Items carry no due dates, priority tags, progress percentages, or backlog guilt.
   - Entries sit cleanly as pure typography on the chamber canvas without boxy capsule borders or persistent '×' buttons.
   - A dedicated "Remove" mode lets users intentionally select one or more handled words and confirm their removal in a single calm step.
5. **Stationery Visual Integrity:**
   - Follows the app's established paper aesthetic tokens: warm cream canvas (`#FAF7F2`), subtle warm dividers (`#E6DFD5`), charcoal text (`#2D2A26`), terracotta accent (`#DA7756`), and soft sage (`#6E8B74`).

---

## 🗂️ Component & Data Architecture

```
src/
├── types/
│   └── index.ts               # PainPoint & ActiveView ('painpoints')
├── components/
│   ├── Header.tsx             # Navigation bar item with Mountain icon
│   └── PainPointsView.tsx     # Bounded word cloud chamber and input bar
└── (Local Storage)
    └── the_three_things_pain_points_v5 # Synchronous persistent JSON array
```

### 1. TypeScript Data Model

Defined in [`src/types/index.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/types/index.ts):

```typescript
export interface PainPoint {
  id: string;          // Timestamped unique identifier (e.g. 'pain-1730835000000-abcde')
  title: string;       // Friction keyword (strictly <= 26 characters)
  isCompleted: boolean;// Completion flag
  createdAt: number;   // Creation timestamp in ms
  scale?: number;      // Custom font scale factor (default 1.0, range 0.6 to 2.5)
}
```

---

## ☁️ Word Cloud Engine & Mechanics

### 1. Bounded Cloud Chamber
- Confined to a designated vertical envelope (`min-h-[300px] max-h-[460px]`).
- Styled as an elevated paper surface:
  ```tsx
  className="relative w-full min-h-[300px] max-h-[460px] rounded-3xl border border-[#E6DFD5] bg-gradient-to-b from-[#FAF7F2] to-[#F5F0E8]/70 p-4 sm:p-6 flex flex-wrap items-center justify-center content-center gap-2 sm:gap-3 overflow-y-auto custom-scrollbar shadow-2xs shrink-0 select-none"
  ```
- Words wrap and cluster organically in the center of the chamber, adapting responsively across both mobile and desktop viewports without overflowing.

### 2. Deterministic Typographic Variation
Each keyword is mapped to an aesthetic style preset via a string hash function, ensuring its visual appearance remains stable across re-renders without heavy pill wrappers:

| Preset Role | Typographic Classes | Text Color |
| :--- | :--- | :--- |
| **Hero Serif** | `text-xl sm:text-2xl font-serif-accent italic font-bold` | `#DA7756` (Terracotta) |
| **Bold Primary** | `text-sm sm:text-base font-bold` | `#2D2A26` (Charcoal) |
| **Sage Reflection** | `text-base sm:text-lg font-serif-accent italic font-bold` | `#6E8B74` (Sage) |
| **Warm Ochre** | `text-xs sm:text-sm font-semibold` | `#C28B54` (Ochre) |
| **Muted Taupe** | `text-[11px] sm:text-xs font-medium` | `#78716A` (Taupe) |
| **Punchy Accent** | `text-lg sm:text-xl font-bold` | `#DA7756` (Terracotta) |
| **Charcoal Serif** | `text-sm sm:text-base font-serif-accent italic font-bold` | `#3D3833` (Charcoal) |

### 3. Pinch Gesturing & Drag-to-Resize Mechanics
Each word can be sized individually across a dynamic scale spectrum (`0.6x` to `6.0x` / `60%` to `600%`), naturally reflowing neighboring words in the cloud chamber:
- **Mobile Standard Pinch Gesturing:**
  - Non-passive touch listeners intercept two-finger pinch events (`e.touches.length === 2`) directly on any word or in the chamber canvas.
  - Automatically cancels default browser-level viewport zoom via `e.preventDefault()`.
  - Calculates pinch ratio dynamically (`currentDist / initialDist`) and scales the target word fluidly in real-time.
- **Direct Drag Handle (Desktop & Mobile):**
  - Tapping any word selects it and displays a tactile terracotta resize knob (`MoveDiagonal2`).
  - Dragging outward (right / up) expands the word; dragging inward (left / down) shrinks it.
  - Supports unified pointer events for mouse cursor and single-finger dragging.
- **Precision Docked Slider:**
  - When a word is active, a tactile precision toolbar appears with live percentage readouts (`%`), discrete step buttons (`−` / `+`), and a smooth slider track.
- **Persistent Scales:**
  - Each word's custom scale factor is persisted into `localStorage` (`the_three_things_pain_points_v5`).

### 4. Deliberate Removal Mode
- Toggling the **Remove** button reveals a removal toolbar.
- Users click or tap any word to mark it for removal (renders with a circular indicator, strikethrough, and red tint).
- Options to "Select all" / "Deselect all" enable quick bulk management.
- The **Confirm (N)** button permanently clears the selected items from the cloud.

### 5. Rapid-Add Input Bar
- Positioned directly above the cloud chamber.
- Includes a live monospace character counter (`{inputVal.length}/{MAX_CHAR_LIMIT}`) that turns red when within 5 characters of the limit.
- Submitting appends the keyword to the cloud, clears the input, and re-focuses for rapid entry.
- Automatic case-insensitive duplicate prevention protects the cloud from redundant entries.

---

## 🎨 Visual Design Tokens Reference

| Role | Token / Value | CSS / Tailwind Class | Application |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#FAF7F2` | `bg-[#FAF7F2]` | Page canvas background |
| **Chamber Surface** | Gradient `#FAF7F2` to `#F5EFE6` | `bg-gradient-to-b ...` | Word cloud background |
| **Chamber Border** | `#E6DFD5` | `border-[#E6DFD5]` | Chamber boundary line |
| **Primary Accent** | `#DA7756` | `text-[#DA7756]`, `bg-[#DA7756]` | Brand terracotta highlights & buttons |
| **Sage Accent** | `#6E8B74` | `text-[#6E8B74]`, `bg-[#F0F4F1]` | Calming green text and badges |
| **Charcoal Text** | `#2D2A26` | `text-[#2D2A26]` | Primary word cloud text |
| **Muted Text** | `#78716A` | `text-[#78716A]` | Subtitles, counters, and dismiss icons |

---

## 📱 Mobile Layout & Responsive Behavior

1. **Top Anchoring:**
   - `<main>` container uses `justify-start` rather than fixed `justify-center`, guaranteeing the header, mindful prompt banner, and input bar are anchored at the top on small mobile screens without negative-scroll clipping.
2. **Compact Vertical Padding:**
   - Outer container padding scales between `px-4 py-3.5` on mobile and `px-8 py-6` on desktop.
3. **Touch Targets:**
   - Cloud pills feature generous touch padding (`py-1.5 px-3.5` to `py-2 px-4`) and smooth hover scaling (`hover:scale-105`), making dismissal with a finger natural and comfortable.
4. **Soft Keyboard Safety:**
   - The confined chamber height prevents the input bar from being pushed off-screen when the Android software keyboard opens.

---

## 💡 Guidelines for Developers & AI Assistants

1. **Preserve the Character Limit:** Never expand the input into a multi-line textarea or remove `MAX_CHAR_LIMIT`. The constraint is essential to prevent users from mistaking this space for a daily task list.
2. **Do Not Re-introduce Card Complexities:** Pain points are intentionally lightweight thought pills. Do not re-attach slide-to-complete knobs, sub-goal splitters, or multi-step action menus to this view.
3. **Maintain the Focus View Bridge:** The architectural role of Pain Points is strictly upstream of the Focus view. It is a contemplative parking lot that feeds into the daily 3 goals.
4. **Always Run Type Checks:** When modifying types or components, verify build health via `npm run build` (`tsc && vite build`).
