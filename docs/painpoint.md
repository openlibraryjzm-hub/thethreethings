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

1. **Spatial Word Cloud Spacing & Organic Reflow:**
   - Keywords wrap and cluster organically within the bounded cloud chamber on the shared paper canvas without boxy card borders.
   - Natural visual hierarchy flows from typography, spacing, scale, and radiant glow.
2. **Star-Governed Scale & Rising Heat Glow (1 to 5 Stars):**
   - Users do not manually select arbitrary font sizes via sliders or handles; **size is determined directly by the 5-star heat level**.
   - As star level rises, words dynamically scale up in physical presence and radiate increasing color and glow:
     - **1 Star (Dim):** `0.75x` (75% scale), dim soft taupe (`text-[#78716A]/50`), low opacity (55%), quiet background simmer.
     - **2 Stars (Mild):** `1.20x` (120% scale), mild earthy charcoal (`text-[#645E57]`), clear baseline presence.
     - **3 Stars (Moderate):** `1.90x` (190% scale), deep charcoal (`text-[#2D2A26]`), active daily priority.
     - **4 Stars (High Heat):** `3.00x` (300% scale), vibrant terracotta-orange (`text-[#DA7756]`), ambient warm glow.
     - **5 Stars (Five-Alarm Fire 🔥):** `4.50x` (450% scale), blazing crimson (`text-[#DC2626]`), dual fiery radiant aura, and pulsating flame icon.
3. **Strict Character Constraint (`MAX_CHAR_LIMIT = 26`):**
   - Inputs enforce a hard 26-character ceiling with a live monospace counter.
   - Keeps entries punchy, ensuring even 5-star hero keywords (scaled up to 450%) fit harmoniously within the spatial cloud chamber.
4. **Companion Bridge Links:**
   - **Pain Points, IRL Adventures & Projects Modes:** Displays a prominent `Focus View →` button that instantly switches to the 3-goal Focus dashboard ([`FOCUS_VIEW.md`](FOCUS_VIEW.md)).
   - **Media Desires & OOMF Modes:** Displays a prominent `Media View →` button that instantly switches to the active Weekly Media view ([`media.md`](media.md)).
5. **Deliberate Removal Mode:**
   - A dedicated "Remove" mode lets users intentionally select one or more handled words and confirm their removal in a single calm step.
6. **Stationery Visual Integrity:**
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
  id: string;          // Timestamped unique identifier (e.g. 'pain-...', 'media-...', etc.)
  title: string;       // Keyword string (strictly <= 26 characters)
  isCompleted: boolean;// Completion flag
  createdAt: number;   // Creation timestamp in ms
  scale?: number;      // Font scale factor derived from 5-star intensity (0.75x to 4.5x)
  intensity?: number;  // 5-Star heat level (1 = dim, 2 = mild, 3 = moderate, 4 = high, 5 = five-alarm fire 🔥)
}
```

---

## ☁️ Word Cloud Engine & Mechanics

### 1. Spatial Cloud Chamber & Infinite Scroll Canvas
- Designed as an infinite scrolling paper surface (`min-h-[320px] max-h-[520px] sm:max-h-[600px]`):
  - Uses an outer scroll container (`flex flex-col overflow-y-auto overscroll-contain custom-scrollbar`) paired with an inner content wrapper (`w-full my-auto flex flex-wrap items-center justify-center content-start gap-2.5 sm:gap-4 py-2`).
  - **Auto-Centering When Light:** When total entries fit within the chamber, `my-auto` vertically centers the words organically.
  - **Infinite Scroll Without Top-Clipping:** When overcrowded, `margin-top: auto` collapses to 0, anchoring the first entries at `scrollTop: 0`. Words scroll downwards infinitely with zero entries lost to negative scroll space.
  - Words wrap and cluster organically, adapting responsively across viewports with proportional font scaling.

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
  - In **Pain Points**, **IRL Adventures**, and **Projects** modes: renders `Focus View →` linking to [`FOCUS_VIEW.md`](FOCUS_VIEW.md).
  - In **Media Desires** and **OOMF** modes: renders `Media View →` linking to [`media.md`](media.md).

### 4. Star-Governed Scale & Heat Glow System
Instead of manual sliders or drag knobs, each word's scale, color, and glow are set by its 5-star heat level:

| Star Level | Scale Factor | Font Weight | Text Color | Glow & Effects |
| :--- | :--- | :--- | :--- | :--- |
| **1 Star (Dim)** | `0.75x` (75%) | Normal | `text-[#78716A]/50` | None (dimmed background simmer) |
| **2 Stars (Mild)** | `1.20x` (120%) | Medium | `text-[#645E57]` | None (clean baseline presence) |
| **3 Stars (Moderate)** | `1.90x` (190%) | Bold | `text-[#2D2A26]` | `drop-shadow-[0_1px_2px_rgba(45,42,38,0.18)]` |
| **4 Stars (High Heat)** | `3.00x` (300%) | ExtraBold | `text-[#DA7756]` | `drop-shadow-[0_2px_12px_rgba(218,119,86,0.45)]` |
| **5 Stars (Five-Alarm Fire)** | `4.50x` (450%) | Black | `text-[#DC2626]` | Dual-layer crimson aura + pulsating flame 🔥 |

### 5. Docked 5-Star Toolbar
- Tapping any word in the cloud selects it and reveals a docked 5-star toolbar at the bottom of the chamber.
- Users tap star 1, 2, 3, 4, or 5 to instantly adjust heat intensity, reflowing the cloud in real time.
- Clicking **Done** or tapping the chamber canvas deselects the word.

### 6. Deliberate Removal Mode
- Toggling the **Remove** button reveals a removal toolbar.
- Users click or tap any word to mark it for removal (renders with a circular indicator, strikethrough, and red tint).
- Options to "Select all" / "Deselect all" enable quick bulk management.
- The **Confirm (N)** button permanently clears the selected items from the active cloud.

### 7. Rapid-Add Input Bar
- Positioned directly above the cloud chamber.
- Includes a live monospace character counter (`{inputVal.length}/{MAX_CHAR_LIMIT}`) that turns red when within 5 characters of the limit.
- Submitting appends the keyword with default 3-star intensity (1.9x scale), clears the input, and re-focuses for rapid entry.
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
   - Cloud words feature generous touch padding and smooth hover scaling (`hover:scale-105`), making selection natural and comfortable.
   - Star buttons carry `data-no-swipe="true"` so interactions don't accidentally trigger horizontal tab-switching swipe navigation.
4. **Soft Keyboard Safety:**
   - The confined chamber height prevents the input bar from being pushed off-screen when the Android software keyboard opens.

---

## 💡 Guidelines for Developers & AI Assistants

1. **Preserve Star-Governed Sizing:** Sizing is strictly determined by the 5-star level (`INTENSITY_CONFIG`), keeping the visual hierarchy coherent and preventing manual arbitrary sizes.
2. **Preserve Spatial Word Cloud Spacing:** Keep the organic flex-wrap layout and shared canvas background.
3. **Preserve Independent Storage:** Keep cloud modes isolated in their respective keys (`the_three_things_pain_points_v5`, `the_three_things_media_desires_v1`, `the_three_things_adventures_v1`, `the_three_things_projects_v1`, `the_three_things_oomf_v1`).
4. **Maintain the Companion Bridge Links:** Always ensure the mode buttons connect cleanly to `focus` and `media` views via `onNavigate`.
5. **Always Run Type Checks:** When modifying types or components, verify build health via `npm run build` (`tsc && vite build`).
