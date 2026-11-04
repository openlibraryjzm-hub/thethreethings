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
│   └── index.ts               # ActiveView ('focus' | 'completed' | 'media' | 'health' | 'tip' | 'support')
├── components/
│   ├── Header.tsx             # Fixed top bar with brand mark, motto pill, and segmented navigation
│   └── CompletedView.tsx      # Archive view accessed via Focus view subheader (decoupled from navbar)
└── App.tsx                    # Root view routing and state distribution
```

### 1. View Type Definition

Defined in [`src/types/index.ts`](file:///c:/Users/GGPC/Desktop/todaysthree/src/types/index.ts):

```typescript
export type ActiveView = 'focus' | 'completed' | 'media' | 'health' | 'tip' | 'support';
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
| **2** | **Media** | `'media'` | `<Gamepad2 />` | 4-card media tracker queue, monthly editorial theme, and terminal counters. |
| **3** | **Health** | `'health'` | `<Apple />` | Untracked, time-aware daily self-care rituals (morning/afternoon/evening). |
| **4** | **Tip** | `'tip'` | `<Lightbulb />` | Mindful focus advice, daily productivity reflections, and inspiration. |
| **5** | **Support** | `'support'` | `<Heart />` | Project appreciation, creator support links, and feedback channels. |

---

## ⚡ Active vs. Inactive Adaptive Label Interaction

To prevent visual clutter across 5 tabs, the navigation bar implements an adaptive pill interaction pattern:

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

## 🔒 Architectural Rule: Completed View Decoupling

The **Completed View** (`'completed'`) is intentionally **not** present in the top navigation bar.

### Rationale & Mechanism
1. **Grid Isolation Safeguard:**
   - On the Focus screen, goals are displayed in a CSS grid (`grid-cols-1 md:grid-cols-3`).
   - The completed archive entry point is positioned strictly in the **Focus view subheader** outside of the card grid:
     ```tsx
     <button onClick={() => setActiveView('completed')}>
       <CheckCircle2 className="text-[#6E8B74]" />
       <span>{count} goals completed · View all →</span>
     </button>
     ```
   - This ensures the Focus screen always contains exactly 3 card children—rendering 3 horizontal cards on desktop and 3 vertically stacked cards on mobile without grid pollution.
2. **Neutral Header State:**
   - When viewing `'completed'`, none of the 5 top-level header tabs are highlighted (`activeView !== tab.id`). All 5 tabs remain in their quiet icon-only mode.
   - Returning to the Focus view is supported through the `"← Back to Focus"` action inside [`CompletedView.tsx`](file:///c:/Users/GGPC/Desktop/todaysthree/src/components/CompletedView.tsx) or by clicking the Focus icon in the top header.

---

## 🎨 Visual Tokens & Styling Specifications

| Element | CSS Classes / Tokens | Notes |
| :--- | :--- | :--- |
| **Header Surface** | `bg-[#F5F0E8]/80 backdrop-blur-md border-b border-[#E6DFD5]` | Warm paper tint with frosted glass blur. |
| **Brand Title** | `font-serif-accent italic text-[#DA7756] text-xl md:text-2xl` | Georgia / Instrument Serif wordmark. |
| **Motto Pill** | `bg-[#E6DFD5]/60 text-[#78716A] text-xs px-2.5 py-1 rounded-full` | *"One day at a time"* with `<Target />` icon. Hidden on extra-small mobile viewports. |
| **Segmented Track** | `bg-[#E6DFD5]/50 p-1 rounded-2xl border border-[#E6DFD5]` | Outer pill container framing the tab buttons. |
| **Icon Sizing** | `w-3.5 h-3.5 text-[#DA7756]` | Consistent 14px bounding box across all tabs. |

---

## 📱 Responsive Layout Rules

- **Header Padding:** `px-4 md:px-8 py-3.5 md:py-4`
  - Mobile devices use tighter `px-4` padding to keep the brand mark and 5 tabs comfortably on one line without horizontal overflow.
  - Desktop uses generous `px-8` padding for an airy editorial feel.
- **Brand Subtitle Suppression:** `hidden sm:inline-flex`
  - The *"One day at a time"* badge automatically collapses on viewports smaller than 640px, giving full priority to the brand title and the 5 navigation tabs.

---

## 💡 Guidelines for Developers & AI Assistants

1. **Maintain Tab Order:** If adding or adjusting tabs, maintain the logical progression from core productivity (`Focus`) through lifestyle (`Media`, `Health`) to external resources (`Tip`, `Support`).
2. **Never Re-introduce Completed to the Top Bar:** The archive belongs strictly as an in-context reflection link on the Focus screen.
3. **Preserve Adaptive Label Mechanism:** Every new navigation item added to `NAV_ITEMS` must support the active label / inactive icon-only contract to avoid overloading the header width.
4. **Always Verify Type Checks:** After modifying tabs or `ActiveView`, verify clean build health via `npm run build` (`tsc && vite build`).
