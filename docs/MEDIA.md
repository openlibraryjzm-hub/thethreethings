# Media View Specification 🎬

> Comprehensive technical and architectural guide for the **Weekly Media** tab in **The Three Things**.

---

## 📌 Architecture & Design Philosophy

The **Media** tab provides a calm, tactile personal tracker for books, television series, anime, movies, podcasts, and games organized on an editorial **weekly cadence**.

It transitions the app to an intentional 7-day focus. It retains the same warm stationery aesthetic as the **Focus** and **Completed** views, prioritizing visual calm, clear hierarchy, and zero clutter.

### 🔒 Core Design Principles
1. **Saturday–Friday Weekly Cadence:** Weeks follow an unorthodox, lifestyle-first cadence starting on **Saturday** and ending on **Friday**. Saturday and Sunday act as the first 2 weekend kick-off days, followed by Monday through Friday as the remaining 5 weekday completion days (e.g. `Nov 7 – 13, 2026`). Every date in the calendar strictly partitions into one 7-day Saturday–Friday block.
2. **Single Large Hero Card:** The primary Media screen features **one very large card** displaying the active week's curation, keeping focus contained and uncluttered.
3. **Grid of Rectangular Slots:** Inside the large weekly card, media items reside in a responsive grid of sleek rectangular slots (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). Users can expand this grid anytime with `+ Add Media Slot`.
4. **Secondary Heavily-Shrunk Archive Page:** A secondary overview page presents all past and present weeks as compact, heavily shrunk and truncated preview cards, creating an easily scrollable chronological visual timeline.
5. **Full-Fidelity Archived View with Disclaimer:** Clicking any shrunk card in the archive opens that week in full view, complete with a prominent disclaimer banner indicating that the user is browsing historical media logs.
6. **Self-Contained Media Model:** Media completions trigger Web Audio harmonic acoustic chimes and confetti, but remain self-contained within the Media space and do not pollute the primary daily Focus accomplishment history.
7. **Spatial Media Desires Cloud:** For broad backlogs, genres, and wishlist titles without cluttering the active weekly card, users reference the rock-solid **Media Desires Word Cloud** located in the Pain Points tab ([`painpoint.md`](../painpoint.md)).

---

## 🗂️ Component & Storage Structure

```
src/
├── types/
│   └── index.ts               # ActiveView ('focus' | 'completed' | 'media'...), WeeklyMediaCard, WeeklyMediaSlot
├── components/
│   ├── Header.tsx             # Navigation bar including the Media tab button
│   └── MediaView.tsx          # Single large weekly card, rectangular slots grid & all-weeks archive
└── (Local Storage)
    ├── the_three_things_weekly_media_v2   # Persistent JSON serialized weekly media cards
    └── the_three_things_media_cards_v1    # Legacy v1 storage (gracefully migrated on first run)
```

---

## 🌟 The Main Media Page: Large Weekly Card

The main view (`viewMode = 'current'`) renders **one very large card** (`w-full rounded-3xl p-6 md:p-8 bg-white border border-[#E6DFD5] shadow-xs`):

### 1. Card Header & Dual-Mode Controls
- **Left:** Large, borderless Weekly Focus / Theme text input (`text-2xl md:text-3xl font-bold text-[#2D2A26]`). Omits greyed-out suggestion text in favor of an active blinking terracotta typewriter cursor indicator (`animate-pulse`).
- **Right:** 
  - **Date Range Anchor:** Large italic serif accent (`Nov 7 – 13, 2026` in `text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic`).
  - **Dual-Mode & Archive Actions:** Directly below the date:
    - **`Edit` / `Done` Toggle:** Switches between Curated View Mode and Edit Mode.
    - **`All Weeks (X) →`:** Clean text link navigating to the timeline archive.

### 2. Dual-Mode Slot Display
- **Curated View Mode (Default):** Shows **only** the cards you have actually filled out with titles, artwork, or logged days. Empty placeholder cards and the `+ Add Media Slot` button are completely hidden, providing a serene, clutter-free gallery. The 7-day buttons remain fully interactive for daily logging.
- **Edit Mode:** Reveals all cards (both filled and empty ready to be populated), the `+ Add Media Slot` expander, and slot-clearing controls. Clicking `Done` collapses back to the clean Curated View.

### 3. Responsive Grid of Rectangular Slots
Arranged in an airy responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`):

#### A. Rectangular Artwork Upload / Poster Header (`h-[145px] md:h-[150px]`)
- Fixed aspect ratio frame with `object-cover` styling.
- **Empty State:** Subtle paper-cream canvas with terracotta upload icon and `Drop Artwork` prompt. Supports click-to-pick and drag-and-drop.
- **Uploaded State:** Crisp artwork display with frosted hover actions (`Replace` and `Remove`).
- **Client-Side Compression:** Images are compressed via canvas to lightweight JPEG (`quality: 0.82`, max dimension 960px) to safeguard `localStorage` storage limits.

#### B. Media Title & Borderless Day Buttons
- **Media Title Field:** Bold charcoal input (`font-bold text-[#2D2A26]`) for overarching title (e.g. *Severance*, *Dune*, *Three-Body Problem*) with quick trash reset.
- **7 Horizontally Aligned Day Buttons:** A clean, borderless typographic strip with buttons for each day in Saturday–Friday order:
  - `Sa`, `Su`, `Mo`, `Tu`, `We`, `Th`, `Fr`
  - Inactive days are displayed in calm, muted taupe typography.
  - Active (logged) days feature larger, prominent bold orange text (`text-[#DA7756]`).
  - Clicking any day marks that day as completed with a tactile acoustic chime ([`playCompletionSound()`](../src/utils/sound.ts)). Completing all 7 days triggers celebratory confetti.

#### C. Dynamic "+ Add Media Slot" Button
- Positioned at the end of the rectangular grid as a dashed container matching slot geometry.
- Allows users to expand the week's queue from the default 6 slots to any custom number of slots.

---

## 🗄️ Secondary Page: All Weeks Archive

Accessed via the `All Weeks →` button in the header (`viewMode = 'all-weeks'`):

### 1. Editorial Header Bar
- **Back Navigation:** `← Back to Current Week` link for instant return.
- **Archive Title:** `All Weeks Archive` with total week tally badge.
- **Description:** Concise guidance explaining the timeline and navigation.

### 2. Heavily Shrunk / Truncated Cards Grid
Displays all weeks in a dense, easily scrollable responsive grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`):
- **Fixed Shrunk Dimensions:** Compact fixed height (`h-[210px]`) allowing dozens of weeks to be scanned rapidly.
- **Visuals:**
  - **Date Range:** Serif italic week dates (`font-serif-accent font-bold text-base md:text-lg`).
  - **Current Badge:** Highlighted terracotta pill for the active calendar week.
  - **Truncated Theme:** 1-line italic snippet of the week's theme/mantra.
  - **Miniature Artwork Mosaic:** A compact row of up to 4 micro-thumbnails displaying the cover artwork from that week's logged media.
  - **Completion Progress:** Sage completion ratio indicator (`X/Y done`).
  - **Hover Kinetics:** Subtle lift (`hover:-translate-y-1 hover:shadow-md`) and `View card →` reveal.
- **Click Interaction:** Clicking any shrunk card opens that week in **Full View** with the archive disclaimer.

---

## 📜 Archived Week Full View

When viewing any past week (`viewMode = 'archived'`):

### 1. Prominent Archive Disclaimer Banner
Anchored at the top of the screen before the large card:
- Warm paper cream container (`bg-[#F5F0E8] border border-[#E6DFD5] rounded-2xl p-4 shadow-2xs`).
- **Notice:** Displays `<History />` icon with copy:
  > *"Archived Week View · You are viewing past weekly media. Any adjustments made here update this historical entry."*
- **Quick Return Actions:**
  - `← All Weeks` button to jump back to the archive grid.
  - `Jump to This Week →` button to instantly switch back to the active calendar week.

### 2. Full-Fidelity Large Card
Renders the exact large card layout for that selected week, enabling full inspection of past artwork posters, notes, titles, and completion logs.

---

## 🔑 Data Models

Defined in [`src/types/index.ts`](../src/types/index.ts):

```typescript
export type DayKey = 'Sa' | 'Su' | 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr';

export interface WeeklyMediaSlot {
  id: string;          // Unique slot identifier
  title: string;       // Media title (e.g. 'Severance', 'Dune')
  activeDays?: DayKey[]; // Days logged: Sa, Su, Mo, Tu, We, Th, Fr
  imageUrl?: string;   // Base64 compressed artwork
  completedAt?: number;// Unix timestamp when completed
}

export interface WeeklyMediaCard {
  id: string;          // e.g. 'week-2026-11-07' (Saturday start date)
  year: number;        // e.g. 2026
  weekNumber?: number; // Week number reference
  startDate: string;   // ISO string (Saturday)
  endDate: string;     // ISO string (Friday)
  dateLabel: string;   // Formatted range (e.g. 'Nov 7 – 13, 2026')
  theme?: string;      // Weekly focus or mantra
  slots: WeeklyMediaSlot[];
  createdAt: number;
  updatedAt: number;
}
```

---

## 🎨 Visual Design Tokens Reference

| Role | Color Token | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Large Card Surface** | `#FFFFFF` | `bg-white` | Primary weekly card container |
| **Slot Surface (Active)** | `#FAF7F2` | `bg-[#FAF7F2]` | Active rectangular slot background |
| **Slot Surface (Done)** | `#F0F4F1`/90 | `bg-[#F0F4F1]/90` | Completed rectangular slot background |
| **Card & Slot Borders** | `#E6DFD5` | `border-[#E6DFD5]` | Warm dividers and outer borders |
| **Weekly Accent Date** | `#DA7756` | `font-serif-accent text-[#DA7756] italic` | Large serif italic date range |
| **Current Week Badge** | `#DA7756` / `#FDF3EF` | `text-[#DA7756] bg-[#FDF3EF]` | Active week indicator |
| **Completed Badge** | `#6E8B74` / `#F0F4F1` | `text-[#6E8B74] bg-[#F0F4F1]` | Completed counter and status tags |
| **Primary Button** | `#DA7756` / `#C86446` | `bg-[#DA7756] hover:bg-[#C86446]` | Tactile completion & New Goal buttons |
