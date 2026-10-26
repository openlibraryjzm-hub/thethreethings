# Completed View Specification 📜

> Comprehensive technical and architectural guide for the Completed History View, filtering, calendar navigation, and pagination in **The Three Things**.

---

## 📌 Architecture & Purpose

The Completed View acts as a permanent accomplishment log. Every completed goal is archived with its completion timestamp, allowing users to reflect on their daily focus momentum over time.

---

## 🗂️ Component Structure

```
src/
├── App.tsx                     # History state management and delete handler
└── components/
    ├── CompletedView.tsx       # Main history layout, filtering, grouping, and pagination
    └── CalendarPopover.tsx     # Custom in-app month calendar with accomplishment activity dots
```

---

## 🔑 Data Architecture & Decoupling

In [`src/App.tsx`](file:///c:/Users/GGPC/Desktop/todaysthree/src/App.tsx), completed goals are decoupled from card slot IDs:

```typescript
// When completing any slot (1, 2, or 3):
const uniqueCompletedId = `completed-${completedTimestamp}-${Math.random().toString(36).slice(2, 8)}`;
const completedGoalItem: Goal = {
  ...targetGoal,
  id: uniqueCompletedId,
  isCompleted: true,
  completedAt: completedTimestamp,
};
```

- **Unlimited Accomplishment History:** Every completed task receives its own unique ID. Slots can be completed and refreshed repeatedly without overwriting previous accomplishments in the archive.
- **Independent Deletion:** Deleting an item from history only removes that specific historical entry (`onDeleteCompletedGoal(id)`).

---

## 🔍 Timeframe Filtering

Users can filter accomplishments using a dedicated segmented toolbar:

### 1. Preset Filters
- **Today:** Filters tasks completed on the current calendar date (`d.getDate() === now.getDate()`).
- **Yesterday:** Filters tasks completed on yesterday's calendar date.
- **All Time:** Displays the complete historical log across all days.

### 2. Custom Day Calendar Popover (`CalendarPopover.tsx`)
Because native `<input type="date">` shadow-DOM popups are often suppressed or inaccessible in Tauri / WebView2 window frames, the app uses a custom in-app calendar popover:
- **Month Navigation:** Move backward and forward between months with `<` and `>` arrow buttons.
- **Accomplishment Activity Dots:** Each day cell checks a `Set<string>` of completed dates. Any day with completed accomplishments renders a subtle sage activity dot (`bg-[#6E8B74]`) below the number.
- **"Today" Shortcut:** Quickly jumps back to the current day.
- **Clear Action:** A dedicated `✕` button on the pill and in the popover resets the custom date filter back to All Time.
- **Outside-Click Dismiss:** Safely closes the popover when clicking anywhere outside.

### 3. Filtered Empty State
If the user selects a timeframe with zero completed items, a tailored empty state appears with a `"Show All Time Goals"` button to quickly return to the full archive.

---

## 📄 50-Item Pagination System

To keep rendering performance smooth and avoid endless scrolling:

- **Constraint:** Hard-limited to **50 items per page** (`ITEMS_PER_PAGE = 50`).
- **Date Grouping:** The 50 items displayed on the active page are grouped under chronological day header banners (e.g., `Today — Mon, Oct 26, 2026`).
- **Pagination Controls:**
  - Range summary: `Showing 1–50 of 124 goals`.
  - `Previous` and `Next` buttons with disabled boundaries.
  - Page indicator: `Page 1 of 3`.
- **Auto-Clamping:** Switching filters or deleting the last item on a page automatically clamps `currentPage` to `Math.max(1, totalPages)`.

---

## 🖥️ Layout & Scrolling Behavior

- **Flexbox Containment:** `<main className="flex-1 min-h-0 ...">` ensures vertical scrolling is properly contained within the application viewport without expanding beyond window height.
- **Warm Scrollbar (`.custom-scrollbar`):**
  - While other screens maintain a zero-scroll look, the Completed View displays a refined 6px scrollbar.
  - Track: transparent.
  - Thumb: warm divider tone (`#E6DFD5`) with terracotta hover state (`#DA7756`).
