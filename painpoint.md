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
4. **Zero-Tracking Friction:**
   - Items carry no due dates, priority tags, progress percentages, or backlog guilt.
   - Tapping the subtle `×` on any pill immediately dismisses it once handled.
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
Each keyword is mapped to an aesthetic style preset via a string hash function, ensuring its visual appearance remains stable across re-renders:

| Preset Role | Typographic Classes | Text Color | Surface Tint & Border |
| :--- | :--- | :--- | :--- |
| **Hero Serif** | `text-xl sm:text-2xl font-serif-accent italic font-bold` | `#DA7756` (Terracotta) | `bg-[#FDF3EF] border-[#DA7756]/30` |
| **Bold Primary** | `text-sm sm:text-base font-bold` | `#2D2A26` (Charcoal) | `bg-white border-[#E6DFD5]` |
| **Sage Reflection** | `text-base sm:text-lg font-serif-accent italic font-bold` | `#6E8B74` (Sage) | `bg-[#F0F4F1] border-[#6E8B74]/30` |
| **Warm Ochre** | `text-xs sm:text-sm font-semibold` | `#C28B54` (Ochre) | `bg-white border-[#E6DFD5]` |
| **Muted Taupe** | `text-[11px] sm:text-xs font-medium` | `#78716A` (Taupe) | `bg-[#FAF7F2] border-[#E6DFD5]` |
| **Punchy Accent** | `text-lg sm:text-xl font-bold` | `#DA7756` (Terracotta) | `bg-white border-[#DA7756]/30` |

### 3. Rapid-Add Input Bar
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
