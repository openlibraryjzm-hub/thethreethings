# Navigation Bar Specification 🧭

> Comprehensive architectural and technical specification for the top navigation bar, view routing, and dynamic tab interactions in **The Three Things**.

---

## 📌 Architecture & Design Philosophy

The navigation bar sits anchored at the top of the application viewport. It embodies the project's physical stationery aesthetic: tactile, quiet, and unobtrusive.

Rather than crowding the interface with heavy menus or permanently expanded labels, the navigation bar uses an **adaptive label layout**: only the currently selected space reveals its text label, while inactive spaces remain compact, icon-only indicators.

---

## 🗂️ Component & Data Architecture

```
src/
├── types/
│   └── index.ts               # ActiveView ('focus' | 'completed' | 'painpoints' | 'media' | 'health' | 'tip' | 'settings')
├── components/
│   ├── Header.tsx             # Segmented navigation bar across 5 primary spaces
│   ├── CompletedView.tsx      # Archive view accessed via Focus view subheader (decoupled from navbar)
│   └── TipView.tsx            # Mindful tip view accessed via Focus view subheader (decoupled from navbar)
└── App.tsx                    # Root view routing, 1:1 touch drag carousel, and state distribution
```

### 1. View Type Definition

Defined in [`src/types/index.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/types/index.ts):

```typescript
export type ActiveView = 'focus' | 'completed' | 'painpoints' | 'health' | 'tip' | 'settings' | 'support' | 'media';
```

### 2. Header Component Interface

Defined in [`src/components/Header.tsx`](file:///c:/Users/GGPC/Desktop/todaysthree/src/components/Header.tsx):

```typescript
interface HeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  completedCount?: number;
}
```

---

## 🧭 Navigation Catalog & Tab Order

The navigation bar presents 5 core spaces in fixed left-to-right order:

| Index | Space | View ID | Icon Component | Semantics & Purpose |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Focus** | `'focus'` | `<Rows3 />` | Primary desk-pad with exactly 3 daily goal cards (`01`, `02`, `03`). |
| **2** | **Points** | `'painpoints'` | `<Mountain />` | 5-mode spatial word cloud (Pain Points, Media Desires, IRL Adventures, Projects, OOMF). |
| **3** | **Media** | `'media'` | `<Film />` | Saturday–Friday weekly media curation, rectangular slots, and all-weeks archive. |
| **4** | **Health** | `'health'` | `<Apple />` | Untracked, time-aware daily self-care rituals (morning/afternoon/evening). |
| **5** | **Settings** | `'settings'` | `<Settings />` | Focus reminder cadence, on-device notification controls, local backup/import, and project appreciation. |

---

## ⚡ Active vs. Inactive Adaptive Label Interaction

To prevent visual clutter across the 5 tabs, the navigation bar implements an adaptive pill interaction pattern:

### 1. Active Tab State
- **Visuals:** Pure white elevated background (`bg-white text-[#2D2A26] shadow-xs px-3.5 py-1.5`).
- **Content:** Brand icon + visible text label (`<span>{label}</span>`).
- **Behavior:** Clearly signals current spatial orientation.

### 2. Inactive Tab State
- **Visuals:** Transparent background with warm hover tint (`text-[#78716A] hover:text-[#2D2A26] hover:bg-white/40 px-2.5 py-1.5`).
- **Content:** Icon-only (text label is omitted from DOM).
- **Accessibility:** Retains full accessibility with `aria-label={label}` and native tooltip `title={label}`.

### 3. Motion & Transition
- State switching is orchestrated via Framer Motion's `<AnimatePresence>`:
  ```tsx
  <AnimatePresence initial={false}>
    {isActive && (
      <motion.span
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 'auto' }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="overflow-hidden whitespace-nowrap"
      >
        {label}
      </motion.span>
    )}
  </AnimatePresence>
  ```
- **Result:** Tabs expand and collapse horizontally with smooth spring kinetics rather than harsh abrupt jumps.

---

## 📱 1:1 Interactive Mobile Page Carousel

The 5 main views (`Focus`, `Points`, `Media`, `Health`, `Settings`) sit in a continuous horizontal viewport reel with real-time 1:1 finger tracking:
- **1:1 Finger Tracking & Peeking:** As you drag left or right, the adjacent screen physically slides into view under your finger in real time, allowing you to preview the next screen before committing.
- **Cancelable Gesture:** Releasing before the 22% width threshold (or dragging back) smoothly springs the current screen back into place via cubic-bezier physics with zero abrupt jumps.
- **Velocity & Flick Snapping:** Dragging past 22% or flicking with velocity snaps smoothly into the destination screen and synchronizes the active top navbar tab.
- **Overdrag Rubberbanding:** Dragging past the first (`Focus`) or last (`Settings`) screen applies gentle damping resistance (`deltaX * 0.25`) and bounces back on release.

### 🔒 Gesture Safety & Conflict Protection
To prevent accidental page switches when interacting with on-screen components:
1. **Vertical Scroll Immunity:** A two-phase disambiguator checks the first 8px of movement. If vertical motion is dominant, the gesture locks to native vertical scrolling so page scrolling is completely natural.
2. **`SlideToComplete` Gating:** The Goal Card completion slider carries `data-no-swipe="true"` and pointer capture, preventing page movement while sliding to complete a goal.
3. **Word Cloud Sliders & Resizing:** In the Points view, the word cloud scale slider (`input[type="range"]`), the tactile corner resize knob, and 2-finger pinch gestures are strictly ignored.
4. **Settings & Calendar Pickers:** The notification cadence slider and calendar popover carry `data-no-swipe="true"`.
5. **Text Editing:** Standard text typing and cursor movement in `<input>` and `<textarea>` elements are exempted from swipe triggers.

---

## 🔒 Architectural Rule: Focus Sub-View Decoupling (Completed & Tips)

Both the **Completed View** (`'completed'`) and **Tips View** (`'tip'`) are subsets of the Focus View and are intentionally **not** present in the top navigation bar.

### Rationale & Mechanism
1. **Grid Isolation Safeguard:**
   - On the Focus screen, goals are displayed in a CSS grid (`grid-cols-1 md:grid-cols-3`).
   - The sub-view entry points are positioned strictly in the **Focus view subheader** outside of the card grid:
     ```tsx
     {/* Left: Daily Mindful Tip link */}
     <button onClick={() => setActiveView('tip')}>
       <Lightbulb className="text-[#DA7756]" />
       <span>Today's tip about {topic} →</span>
     </button>

     {/* Right: Completed History counter link */}
     <button onClick={() => setActiveView('completed')}>
       <CheckCircle2 className="text-[#6E8B74]" />
       <span>{count} goals completed · View all →</span>
     </button>
     ```
   - This ensures the Focus screen always contains exactly 3 card children—rendering 3 horizontal cards on desktop and 3 vertically stacked cards on mobile without grid pollution.
2. **Neutral Header State:**
   - When viewing `'completed'` or `'tip'`, none of the 5 top-level header tabs are highlighted (`activeView !== tab.id`). All 5 tabs remain in their quiet icon-only mode.
   - Returning to the Focus view is supported through the `"← Back to Focus"` action inside [`CompletedView.tsx`](file:///c:/Users/GGPC/Desktop/todaysthree/src/components/CompletedView.tsx) and [`TipView.tsx`](file:///c:/Users/GGPC/Desktop/todaysthree/src/components/TipView.tsx) or by clicking the Focus icon in the top header.

---

## 🎨 Visual Tokens & Styling Specifications

| Element | CSS Classes / Tokens | Notes |
| :--- | :--- | :--- |
| **Header Surface** | `bg-[#F5F0E8]/80 backdrop-blur-md border-b border-[#E6DFD5]` | Warm paper tint with frosted glass blur, right-aligned on desktop and centered on mobile. |
| **Segmented Track** | `w-full max-w-md sm:w-auto bg-[#E6DFD5]/50 p-1 rounded-2xl border border-[#E6DFD5]` | Outer pill container framing the 5 tabs. Full-width on mobile, right-aligned capsule on desktop. |
| **Active Tab Pill** | `bg-white text-[#2D2A26] shadow-xs px-3 sm:px-3.5` | Tactile white paper elevation with icon and smoothly animated label. |
| **Inactive Tab** | `text-[#78716A] hover:text-[#2D2A26] hover:bg-white/40 px-2 sm:px-2.5 flex-1 sm:flex-initial` | Icon-only, evenly distributed on mobile. |
| **Icon Sizing** | `w-3.5 h-3.5 text-[#DA7756]` | Consistent 14px bounding box across all tabs. |

---

## 📱 Responsive Layout Rules

- **Header Alignment & Padding:** `px-3 sm:px-8 py-3 sm:py-4`
  - Eliminates left-aligned branding text to give the entire width to the 5 navigation tabs on mobile.
  - On desktop, the navigation capsule is anchored to the right (`sm:justify-end`) for an ergonomic control bar aesthetic.
  - On mobile, the track spans the full available width (`w-full max-w-md`) with equal flex distribution (`flex-1`), preventing cramping and ensuring generous touch targets.

---

## 💡 Guidelines for Developers & AI Assistants

1. **Maintain Tab Order:** If adding or adjusting tabs, maintain the logical progression from core productivity (`Focus`) through reference reservoirs (`Points`) and lifestyle (`Media`, `Health`) to configuration (`Settings`).
2. **Never Re-introduce Completed or Tips to the Top Bar:** Both sub-views belong strictly as in-context reflection links on the Focus screen.
3. **Preserve Adaptive Label Mechanism:** Every navigation item added to `NAV_ITEMS` must support the active label / inactive icon-only contract to avoid overloading the header width.
4. **Preserve Swipe Gesture Safety:** When adding new interactive components, apply `data-no-swipe="true"` to sliders, pickers, knobs, or custom gesture handlers so they do not conflict with the 1:1 page drag carousel.
5. **Always Verify Type Checks:** After modifying tabs or `ActiveView`, verify clean build health via `npm run build` (`tsc && vite build`).
