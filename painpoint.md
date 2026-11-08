# Spatial Word Cloud Specification ⛰️🎬🧭🔨📻

> Comprehensive technical and architectural guide for the 5-mode **Spatial Word Cloud** view in **The Three Things** (Pain Points, Media Desires, IRL Adventures, Projects, and OOMF).

---

## 📌 Architecture & Design Philosophy

The **Word Cloud** space serves as a calm, quick-glance thought reservoir operating across **five specialized modes**:
1. **⛰️ Pain Points Mode (Friction Cloud):** Long-term life friction, chronic background tasks, and unaddressed discomfort. Designed to glance at when deciding what to pull into your **3 daily Focus goals**.
2. **🎬 Media Desires Mode (Media Backlog Cloud):** A spatial wishlist reservoir for media backlogs — favorite genres, specific games, upcoming anime, classic cinema, books, or podcasts. Designed to stay rock-solid for reference when curating your **Weekly Media card**.
3. **🧭 IRL Adventures Mode (Adventure Reservoir):** Real-world trips, trails to hike, new spots to explore, and memorable offline outings. Designed to pull into your **Focus goals** when planning your weekend or downtime.
4. **🔨 Projects Mode (Side Projects Reservoir):** Side projects, passion ideas, hardware builds, and creative endeavors. A persistent holding ground to draw discrete steps into your daily **Focus goals**.
5. **📻 OOMF Mode (Curated Feeds & Music):** Curation of standout channels, playlists, streamers, and music — aided by companion apps `oomfs.tv` and `oomfit`. Designed to reference alongside the **Weekly Media view**.

Unlike traditional task managers that treat every item as an immediate checkable checkbox with backlog guilt, this space operates as a **reference reservoir**:
- It is **not** an interactive task tracker or duplicate goal system.
- It provides a persistent holding space for long-term reference without cognitive overwhelm.
- All 5 modes feature direct, one-click bridge navigation to their companion screens (**Focus View** for Pain Points, Adventures, and Projects; **Media View** for Media Desires and OOMF).

### 🔒 Core Design Principles

1. **Quick-Glance Word Cloud:**
   - Instead of an endless vertical card stack, keywords are confined within an organic, bounded cloud chamber.
   - Varied typographic scale and palette tones give natural visual hierarchy without artificial complexity.
2. **Strict Character Constraint (`MAX_CHAR_LIMIT = 26`):**
   - Inputs enforce a hard 26-character ceiling with a live monospace counter.
   - Prevents users from writing multi-line project plans or long sentence goals, keeping entries limited to punchy friction, media desire, adventure, or project keywords (*e.g., "Bad Sleep Routine", "Kyoto Trip", "Woodworking Desk", "City Pop Nightdrive"*).
3. **Companion Bridge Links:**
   - **Pain Points, IRL Adventures & Projects Modes:** Displays a prominent `Focus View →` button that instantly switches to the 3-goal Focus dashboard ([`docs/FOCUS_VIEW.md`](docs/FOCUS_VIEW.md)).
   - **Media Desires & OOMF Modes:** Displays a prominent `Media View →` button that instantly switches to the active Weekly Media view ([`media.md`](media.md)).
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
│   └── PainPointsView.tsx     # 5-mode cloud chamber, segmented switcher, and input bar
└── (Local Storage)
    ├── the_three_things_pain_points_v5   # Persistent JSON array for Pain Points
    ├── the_three_things_media_desires_v1 # Persistent JSON array for Media Desires
    ├── the_three_things_adventures_v1    # Persistent JSON array for IRL Adventures
    ├── the_three_things_projects_v1      # Persistent JSON array for Side Projects
    ├── the_three_things_oomf_v1          # Persistent JSON array for OOMF Curation
    └── the_three_things_cloud_mode_v1    # Persistent active cloud mode ('painpoints' | 'media' | 'adventures' | 'projects' | 'oomf')
```

### 1. TypeScript Data Model

Defined in [`src/types/index.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/types/index.ts) and [`src/components/PainPointsView.tsx`](file:///c:/Users/GGPC/Desktop/todaysthree/src/components/PainPointsView.tsx):

```typescript
export type CloudMode = 'painpoints' | 'media' | 'adventures' | 'projects' | 'oomf';

export interface PainPoint {
  id: string;          // Timestamped unique identifier (e.g. 'pain-...', 'media-...', 'adv-...', etc.)
  title: string;       // Keyword string (strictly <= 26 characters)
  isCompleted: boolean;// Completion flag
  createdAt: number;   // Creation timestamp in ms
  scale?: number;      // Custom font scale factor (default 1.0, range 0.6 to 6.0)
}
```

---

## ☁️ Word Cloud Engine & Mechanics

### 1. Bounded Cloud Chamber
- Confined to a designated vertical envelope (`min-h-[300px] max-h-[460px]`).
- Styled as an elevated paper surface:
  ```tsx
  className="relative w-full min-h-[300px] max-h-[460px] rounded-3xl border border-[#E6DFD5] bg-gradient-to-b from-[#FAF7F2] to-[#F5F0E8]/70 p-4 sm:p-6 flex flex-wrap items-center justify-center content-center gap-2.5 sm:gap-4 overflow-y-auto custom-scrollbar shadow-2xs shrink-0 select-none"
  ```
- Words wrap and cluster organically in the center of the chamber, adapting responsively across both mobile and desktop viewports without overflowing.

### 2. Five-Mode Segmented Control
- A tactile paper segmented control with smooth spring expansion:
  - **Active Tab:** Displays both its icon and full text label with an animated entrance (`AnimatePresence`).
  - **Inactive Tabs:** Show only their icon with hover highlights and full tooltip/aria labels, compacting the entire 5-item bar so it fits cleanly across mobile and desktop screens without horizontal truncation.
  - Modes:
    - **⛰️ Pain Points:** Nagging life friction & background tasks.
    - **🎬 Media Desires:** Rock-solid media backlog of games, genres, shows, and books.
    - **🧭 IRL Adventures:** Real-world trips, trails to hike, and offline spots.
    - **🔨 Projects:** Passion projects, hardware builds, and creative ideas.
    - **📻 OOMF:** Channels, playlists, and music aided by `oomfs.tv` and `oomfit`.
- Switching modes safely resets active selection states and persists the preferred mode.

### 3. Direct Screen Bridge Buttons
- Direct navigation pill in the header action cluster:
  - In **Pain Points**, **IRL Adventures**, and **Projects** modes: renders `Focus View →` linking to [`docs/FOCUS_VIEW.md`](docs/FOCUS_VIEW.md).
  - In **Media Desires** and **OOMF** modes: renders `Media View →` linking to [`media.md`](media.md).

### 4. Deterministic Typographic Variation
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

### 5. Pinch Gesturing & Drag-to-Resize Mechanics
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
  - Each word's custom scale factor is persisted into its respective `localStorage` bucket.

### 6. Deliberate Removal Mode
- Toggling the **Remove** button reveals a removal toolbar.
- Users click or tap any word to mark it for removal (renders with a circular indicator, strikethrough, and red tint).
- Options to "Select all" / "Deselect all" enable quick bulk management.
- The **Confirm (N)** button permanently clears the selected items from the active cloud.

### 7. Rapid-Add Input Bar
- Positioned directly above the cloud chamber.
- Includes a live monospace character counter (`{inputVal.length}/{MAX_CHAR_LIMIT}`) that turns red when within 5 characters of the limit.
- Context-aware placeholder:
  - In Pain Points mode: `"Name a friction keyword (e.g. Neck Ache, Tax Delay)..."`
  - In Media Desires mode: `"Name a media desire (e.g. Cozy Indies, Elden Ring, Sci-Fi)..."`
  - In IRL Adventures mode: `"Name an adventure (e.g. Coastal Hike, Kyoto Trip)..."`
  - In Projects mode: `"Name a project (e.g. Portfolio v2, Woodworking Desk)..."`
  - In OOMF mode: `"Name an OOMF item (e.g. Deep Work Ambient, Tech Essays)..."`
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
3. **Touch Targets & Non-Interference:**
   - Cloud words feature generous touch padding and smooth hover scaling (`hover:scale-105`), making selection and resizing natural and comfortable.
   - Sliders and interactive handles carry `data-no-swipe="true"` so interactions don't accidentally trigger horizontal tab-switching swipe navigation.
4. **Soft Keyboard Safety:**
   - The confined chamber height prevents the input bar from being pushed off-screen when the Android software keyboard opens.

---

## 💡 Guidelines for Developers & AI Assistants

1. **Preserve the Character Limit:** Never expand the input into a multi-line textarea or remove `MAX_CHAR_LIMIT`. The constraint is essential to prevent users from mistaking this space for a daily task list.
2. **Preserve Independent Storage:** Never merge the cloud modes into a single shared array in local storage. Keep them isolated in their respective keys (`the_three_things_pain_points_v5`, `the_three_things_media_desires_v1`, `the_three_things_adventures_v1`, `the_three_things_projects_v1`, `the_three_things_oomf_v1`).
3. **Maintain the Companion Bridge Links:** Always ensure the mode buttons connect cleanly to `focus` and `media` views via `onNavigate`.
4. **Always Run Type Checks:** When modifying types or components, verify build health via `npm run build` (`tsc && vite build`).
