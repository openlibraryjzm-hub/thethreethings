# Focus View Specification 🎯

> Comprehensive technical and architectural guide for the Focus View and Goal Card interactions in **The Three Things**.

---

## 📌 Architecture & Philosophy

The Focus View is the primary screen of **The Three Things**. It provides a calm, intentional desk-pad experience where users define and complete their 3 core priorities for the day.

### 🔒 The Permanent 3-Card Rule
- **Fixed Slots:** The Focus View always displays exactly three goal cards (`01`, `02`, `03`).
- **No Slot Deletion:** Cards are permanent fixtures. Under no circumstances should a card be deleted, removed from the grid, or require manual creation via an "Add Slot" action.
- **State Normalization:** The app enforces `ensureThreeGoals` on startup, automatically healing any legacy or corrupt local storage states to guarantee 3 permanent slots.

---

## 🗂️ Component Structure

```
src/
├── App.tsx                     # Top-level state and 3-card grid layout
└── components/
    ├── GoalCard.tsx            # Card presentation, input area, and action footer
    └── SlideToComplete.tsx     # Tactile gesture-based slide knob
```

---

## 🃏 GoalCard (`src/components/GoalCard.tsx`)

### 1. Header & Branding
- **Accent Numeral:** Large italic serif numerals (`01`, `02`, `03`) styled with `font-serif-accent text-[#DA7756]/80 italic`.
- **Status Indicator:** Displays uppercase label `CURRENT GOAL` or `COMPLETED`.
- **Card Trash Can Icon:**
  - Placed at the top right of the card.
  - **Behavior:** Clicking the trash icon **only wipes the card contents back to blank** (`title: ''`, `isCompleted: false`). It never removes the card slot.

### 2. Auto-Resizing Text Area & Sub-Goals Separator (`//`)
- When active, an unbordered, background-blended textarea expands smoothly as the user types multi-line goals (`scrollHeight` measurement via `useEffect`).
- Text size: `text-xl font-semibold text-[#2D2A26] placeholder-[#78716A]/40`.
- Auto-focuses immediately when starting a new goal.
- **Sub-Goal Separator (`//`):** Typing `//` divides a card into distinct sub-goals directly in continuous text form (e.g. `brush teeth // make bed`).
  - No permission prompt is required; it activates automatically.
  - Sub-goals remain in natural flowing text layout separated by `//`.
  - Centered floating selection points sit directly above each sub-goal; tapping a point toggles that sub-goal orange to slide-to-complete.
  - Single-clicking anywhere on the text or white space of the card immediately opens normal typing/editing.
  - Empty cards are 100% 1-tap and type immediately without unlocking.
  - Relatable placeholders (`Morning stretch // Brew coffee`, `Finish project draft // Clear inbox`, `20 min walk // Call mom`) educate users on the `//` separator with zero visual clutter.
  - While typing or editing, the bottom slider morphs into a tactile **`[ Done ✓ ]`** button for intuitive, one-tap mobile saving.

### 3. Sub-Goal Selection & Slide Gating
- By default, the slider is **enabled** (`Slide to complete`); sliding it treats all sub-goals together as one full card completion.
- When individual sub-goals are selected via their floating points:
  - The slider dynamically updates to indicate the selection count (e.g. `Slide to complete (1)`).
  - Sliding completes and archives only the selected sub-goals, keeping any unselected ones active in the card.
- Celebration feedback (pentatonic chime + warm confetti) fires on every completion.

### 4. Completed State Presentation
- When completed, the goal title transitions to muted text with a sage strike-through decoration (`line-through decoration-[#6E8B74] decoration-2`).
- A subtle pill badge displays `✨ Completed!` with sage background tint (`bg-[#6E8B74]/15 text-[#6E8B74]`).

---

## 🎚️ Slide to Complete (`src/components/SlideToComplete.tsx`)

To prevent accidental one-click completions from triggering an unearned accomplishment, goal completion requires an intentional sliding gesture.

### 1. State Gating
- **Blank Goal Card:**
  - Disabled state: Knob is muted (`bg-[#E6DFD5] text-[#78716A]/50 cursor-not-allowed`).
  - Label: `"Enter a goal to unlock"`.
  - Non-draggable.
- **Active Goal Card:**
  - Enabled whenever `goal.title.trim()` contains text.
  - Knob turns terracotta (`bg-[#DA7756] hover:bg-[#C86446] text-white cursor-grab`).
  - Default label: `"Slide to complete →"` (completes all sub-goals together if multiple exist).
  - Sub-goal selection label: `"Slide to complete (N) →"` when individual sub-goals are highlighted via their floating points.

### 2. Interaction & Pointer Capture Mechanics
- Uses native pointer capture (`setPointerCapture(e.pointerId)`) on `pointerDown` so dragging remains completely fluid across mouse, touchpads, and touchscreens without losing grip when moving quickly.
- Dynamic measurement of the track width occurs on mount, container resize (`ResizeObserver`), and dynamically on `pointerDown` as a fallback.
- **Progress Tracking:**
  - Dynamic terracotta progress fill follows the knob.
  - Guide text fades away smoothly as the knob advances.
- **Threshold & Spring Physics:**
  - **Completion Threshold:** Reaching `75%` of the track triggers goal completion.
  - **Spring Return:** Releasing before `75%` springs the knob back to origin `0` via a smooth CSS cubic-bezier transition (`cubic-bezier(0.2, 0.8, 0.2, 1)`).

---

## 🔔 Celebration Effects (`src/utils/sound.ts` & `canvas-confetti`)

When a goal completes, two synchronized celebratory effects fire:

### 1. Web Audio API Acoustic Chime
Synthesized completely in code with zero external audio assets or latency:
- **Paper Stamp Thump:** A transient sub-bass sine drop (`130Hz -> 40Hz`) simulating a tactile physical notepad stamp.
- **Arpeggiated Pentatonic Chime:** An acoustic chord progression (`C5`, `E5`, `G5`, `C6`, `E6`) staggered over `240ms` with gentle exponential decay and harmonic richness.
- **Haptic Vibration:** Fires subtle device vibration where supported (`navigator.vibrate`).

### 2. Warm Particle Confetti
- Fires a 50-particle confetti burst via `canvas-confetti` using brand palette tones:
  `['#DA7756', '#6E8B74', '#F5F0E8', '#C86446']`.

---

## 🔄 Post-Completion Dual Actions

Once a goal is completed, the card footer replaces the slider with two side-by-side buttons:

1. **Reset Goal:**
   - **Purpose:** Restores incomplete status while retaining the goal text (ideal for recurring routines or accidental completions).
   - **Style:** Tactile neutral button (`bg-white border-[#E6DFD5] text-[#78716A]`).
2. **New Goal:**
   - **Purpose:** Wipes the slot cleanly to blank and auto-focuses the text input for the next priority, while keeping the completed accomplishment safely archived in history.
   - **Style:** Brand terracotta button (`bg-[#DA7756] hover:bg-[#C86446] text-white`) with a `+` icon.
