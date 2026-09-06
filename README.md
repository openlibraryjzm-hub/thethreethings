# The Three Things 🎯

> A minimalist daily focus space for setting up to 3 daily goals, tracking progress, and archiving accomplishments.

---

## 🤖 Agent & Developer Onboarding Guide

Welcome! This documentation is designed for AI coding assistants and developers collaborating on **The Three Things**.

---

## 🎨 App Visuals, Design System & Aesthetic Philosophy

**The Three Things** is designed to feel calm, tactile, and intentional — like a beautiful physical desk paper pad rather than a busy digital dashboard.

### 🎨 Color Palette Tokens
| Token Role | Hex Code | Tailwind / CSS Class | Description |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FAF7F2` | `bg-[#FAF7F2]` | Soft warm cream; reduces eye strain compared to pure white |
| **Header & Surface** | `#F5F0E8` | `bg-[#F5F0E8]` | Slightly deeper cream for header bars and container backgrounds |
| **Primary Text** | `#2D2A26` | `text-[#2D2A26]` | Warm charcoal/dark brown; softer contrast than `#000000` |
| **Muted Text** | `#78716A` | `text-[#78716A]` | Earthy warm taupe for subtitles, labels, and timestamps |
| **Borders & Dividers** | `#E6DFD5` | `border-[#E6DFD5]` | Subtle warm divider lines |
| **Primary Accent** | `#DA7756` | `text-[#DA7756]`, `bg-[#DA7756]` | Terracotta / Warm Coral for branding, main actions, and callouts |
| **Primary Hover** | `#C86446` | `hover:bg-[#C86446]` | Deeper terracotta for active button states |
| **Primary Tint** | `#FDF3EF` | `bg-[#FDF3EF]` | Soft terracotta background tint for badges & active states |
| **Success / Done** | `#6E8B74` | `text-[#6E8B74]`, `bg-[#F0F4F1]` | Muted Sage Green for completed goal states and done badges |

---

### ✒️ Typography & Spacing Guidelines
1. **Brand & Index Numerals (`font-serif-accent` / Italic Serif):**
   - Goal card numbers (`01`, `02`, `03`) and the main logo use a stylized italic serif font (`font-serif-accent italic font-bold text-[#DA7756]/80`).
2. **Body & Controls:**
   - Clean, modern sans-serif typeface for input textareas, buttons, and subheadings.
3. **Corner Radii & Shapes:**
   - Goal Cards: `rounded-3xl` (24px - 32px rounded corners) for an organic, tactile paper-card feel.
   - Buttons & Badges: `rounded-2xl` or `rounded-full` pill buttons.
   - Text Inputs: Unbordered, borderless auto-resizing textareas that blend seamlessly into the card background.

---

### ✨ Motion & Micro-Interactions
- **Framer Motion Transitions:**
  - Card layout shifts use `AnimatePresence` with `mode="popLayout"` for smooth entry, deletion, and slot updates.
  - Tactile button feedback: `whileHover={{ scale: 1.01 }}` and `whileTap={{ scale: 0.98 }}`.
- **Celebration Feedback:**
  - Completing a goal fires a warm particle confetti burst (`canvas-confetti`) using brand colors (`['#DA7756', '#6E8B74', '#F5F0E8', '#C86446']`).

---

### 📐 Layout Architecture
- **Single-Screen Focus Space:**
  - The viewport is constrained to `h-screen w-screen overflow-hidden select-none` to prevent accidental text selection or awkward window scrollbars.
  - Main 3-goal cards stretch dynamically across 3 columns (`grid grid-cols-1 md:grid-cols-3`).

---

## 🛠️ Tech Stack & Dependencies

- **UI Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 + Lucide React icons
- **Animations & Effects:** Framer Motion + Canvas Confetti
- **Desktop Application Wrapper:** Tauri v2 (Rust backend wrapper)
- **State Persistence:** Synchronous `localStorage` serialization

---

## 📁 Directory Structure & File Map

```
the-three-things/
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Top bar with logo, "One day at a time" badge, and view tabs (Focus vs Completed)
│   │   ├── GoalCard.tsx       # Focus screen 3-card grid item (auto-resizing text, completion confetti)
│   │   └── CompletedView.tsx  # Completed history page (grouped by day, grid layout, delete action)
│   ├── types/
│   │   └── index.ts           # Goal and AppState TypeScript interfaces
│   ├── styles/
│   │   └── globals.css        # Tailwind CSS import & global styles
│   ├── App.tsx                # App root: state management, local storage persistence, view switching
│   └── main.tsx               # React DOM entry point
├── src-tauri/                 # Tauri v2 Desktop configuration & Rust source files
│   ├── tauri.conf.json        # Window dimensions, app title, bundle config
│   └── Cargo.toml             # Rust dependencies
├── package.json               # NPM scripts & dependencies
└── README.md                  # This file
```

---

## 🔑 Data Models & State Schema

Defined in [`src/types/index.ts`](file:///c:/Users/jodyn/Desktop/the%20three%20things/src/types/index.ts):

```typescript
export interface Goal {
  id: string;          // Unique ID (e.g. 'goal-1' or 'goal-1725684000000')
  title: string;       // Text content of the goal
  isCompleted: boolean;// Goal completion status
  completedAt?: number;// Unix timestamp (ms) when completed
}

export interface AppState {
  goals: Goal[];             // Current active goal slots (max 3)
  completedHistory: Goal[];  // Log of all completed goals over time
  totalCompletedCount: number;// Running tally of completed goals
}
```

### 💾 Persistence Mechanism
- State is saved in `localStorage` under key `'the_three_things_app_state_v3'`.
- Whenever `state` changes, `useEffect` in [`App.tsx`](file:///c:/Users/jodyn/Desktop/the%20three%20things/src/App.tsx) automatically serializes it to JSON.

---

## 🖥️ Views & Key Components

### 1. `Header.tsx`
- Located at top of the app.
- Contains the brand title (**The Three Things**), target icon pill (**One day at a time**), and tab switcher buttons (**Focus** / **Completed**).

### 2. `GoalCard.tsx`
- Used in the **Focus View**.
- Renders up to 3 cards.
- Auto-resizing textarea to fit multi-line goal titles smoothly.
- **Complete Goal** button fires a warm-toned confetti celebration and appends the goal to `completedHistory`.

### 3. `CompletedView.tsx`
- Used in the **Completed View**.
- Groups completed tasks in reverse chronological order by day headers (e.g., *"Today — Sep 7, 2026"*).
- Renders cards in a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
- Displays completion timestamps (e.g. *2:45 PM*) and a trash icon button to permanently delete history items.

---

## ⚡ Development & Build Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite web development server (`http://localhost:1420`) |
| `npm run tauri dev` | Launch the app inside the native Tauri desktop window in dev mode |
| `npm run build` | Run TypeScript type checks (`tsc`) & production build (`vite build`) |
| `npm run preview` | Preview production build locally |

---

## 💡 Guidelines for AI Agents Working on this Project

1. **Maintain Design Palette:** Stick strictly to the warm cream/terracotta/sage color scheme. Avoid default harsh blues or dark mode toggles that break the paper-like aesthetic.
2. **Strict Limit of 3 Goals:** The Focus screen hard limits active slots to 3 (`state.goals.length <= 3`).
3. **Always Run Type Checks:** Before finishing a task, run `npm run build` (`tsc && vite build`) to guarantee type safety and clean imports.
