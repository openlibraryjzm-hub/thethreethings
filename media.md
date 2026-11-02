# Media View Specification 🎬

> Comprehensive technical and architectural guide for the **Media** tab in **The Three Things**.

---

## 📌 Architecture & Design Philosophy

The **Media** tab provides a calm, tactile personal tracker for books, television series, anime, movies, podcasts, and other media items.

It follows the same warm stationery design language as the **Focus** and **Completed** views, prioritizing visual calm, clear hierarchy, and zero clutter.

### 🔒 Core Design Principles
1. **Curated Monthly Anchor:** An editorial **Monthly Theme** card heads the view, setting the tone for the user's media consumption each month.
2. **Vertical 4-Card Queue:** Exactly four permanent media cards stacked vertically (`01`, `02`, `03`, `04`).
3. **Fixed Card Dimensions:** Every card enforces a strict locked height (`h-[230px] md:h-[240px]`). Cards never expand, stretch, or change size when artwork is uploaded.
4. **Split 50/50 Architecture:**
   - **Left Half:** Typography, controls, inputs, and tactile actions.
   - **Right Half:** Dedicated artwork / moodboard upload area strictly constrained to the card bounds.
5. **Independent Completion Model:** Completed media items are self-contained within the Media view. They **do not** write to the primary daily Focus accomplishment history or the Completed tab.

---

## 🗂️ Component & Storage Structure

```
src/
├── types/
│   └── index.ts               # ActiveView ('focus' | 'completed' | 'media')
├── components/
│   ├── Header.tsx             # Navigation bar including the Media tab button
│   ├── SlideToComplete.tsx    # Tactile gesture knob component
│   └── MediaView.tsx          # Monthly Theme & 4-card vertical media tracker
└── (Local Storage)
    ├── the_three_things_media_cards_v1    # Persistent JSON serialized media slots
    └── the_three_things_monthly_theme_v1  # Persistent JSON serialized monthly theme
```

---

## 🌟 The Monthly Theme Card

Positioned prominently at the top of the Media view, the Monthly Theme card anchors the user's monthly media curation like a magazine cover or journal chapter header.

### 1. Left Half: Month Anchor & 2-Line Theme Input
- **Month Anchor:** Automatically displays the current month (e.g. `November`) in large italic serif accent (`text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic`).
- **Theme Title Input:** A 2-line auto-wrapping text area in bold charcoal (`text-xl md:text-2xl font-bold text-[#2D2A26]`), allowing the full placeholder prompt and multi-line themes to display naturally.
- **Clear Button:** Top-right trash icon to wipe the theme title back to empty.

### 2. Right Half: Large Cascading Overlapping Circles
- Automatically mirrors the artwork from queue cards `01`, `02`, `03`, and `04` below in real-time.
- Styled as an enlarged overlapping avatar stack directly resting on the card surface (no nested rounded inner box):
  - **Leftmost Circle (Card 01):** 100% fully visible in the foreground (`z-40`).
  - **Subsequent Circles (Cards 02, 03, 04):** Sequentially cascade and overlap beneath with decreasing z-index (`z-30`, `z-20`, `z-10`).
  - **Size & Borders:** Enlarged circles (`w-24 h-24` up to `md:w-32 md:h-32`) with thick cutout borders (`border-4 border-white shadow-lg ring-1 ring-[#DA7756]/15`).
  - When empty, displays a warm paper circle with the serif italic numeral (`01`, `02`, `03`, `04`).
- Read-only visual stack: no manual upload needed on this card.

---

## 🃏 Media Queue Cards (`01` - `04`)

### 1. Left Half: Media Title, Goal & Slide to Complete

#### A. Card Index & Media Title (`Top Left`)
- Large italic serif numerals (`01`, `02`, `03`, `04`) in `font-serif-accent font-bold text-[#DA7756] italic text-3xl md:text-4xl`.
- **Media Title Field:** Placed directly to the right of the numeral in matching prominent orange serif italics (`text-3xl md:text-4xl font-serif-accent font-bold text-[#DA7756] italic`), creating the same visual hierarchy as the Month Theme card. Designed for the overarching media title (e.g. *Severance*, *Dune*, *Elden Ring*).
- Reset slot button (trash icon) to completely wipe the card (media title, goal, artwork, completion).
- When completed, displays a subtle sage badge (`Done ✨`).

#### B. Goal Textarea (`Center`)
- Auto-wrapping 2-line textarea in bold charcoal matching the Month Theme card (`text-xl md:text-2xl font-bold text-[#2D2A26] leading-snug resize-none`).
- Placeholder: `What is your goal?`.
- Provides spacious multi-line room for goal descriptions without clipping.
- When completed, shows goal text with sage strike-through decoration (`line-through decoration-[#6E8B74] decoration-2 text-[#2D2A26]/70`).

#### C. Slide to Complete (`Footer`)
- Uses the same tactile `SlideToComplete` gesture knob as the Focus view:
  - Enabled when a goal or media title is entered (`Slide to complete →`).
  - 75% drag threshold triggers completion with arpeggiated acoustic chime (`playCompletionSound()`) and palette-toned confetti.
- **Post-Completion Action:**
  - **New Goal:** A single full-width terracotta button that clears the specific goal text and resets completion status while **preserving the media title and right-half artwork**, making it seamless to track sequential goals (e.g., episode by episode) for the same media item. Resetting the entire slot and artwork is performed via the header trash icon.

---

### 2. Right Half: Media Artwork Upload Area

#### A. Strict Image Containment
- Contained within `relative rounded-2xl border-2 border-dashed overflow-hidden`.
- Uses `absolute inset-0 w-full h-full` and `object-cover rounded-2xl` for the image element.
- **Key Invariant:** The upload box is strictly locked to its previous dimensions (`h-[152px] md:h-[162px] w-full`) vertically centered in the taller card, ensuring that increasing card height to accommodate the goal textarea and slider never alters or expands artwork dimensions.

#### B. Empty State & Upload
- Enlarged terracotta upload icon with scale-up hover physics.
- Supports both click-to-pick and drag-and-drop.
- Automatic client-side canvas compression to JPEG (`quality: 0.82`, max dimension 1000px).
- Hover frosted overlay with **Replace** and **Remove**.

---

## 🔑 Data Models

### TypeScript Definitions

```typescript
export interface MonthlyThemeData {
  theme: string;       // e.g. "90s Cyberpunk & Neo-Noir"
  notes: string;       // e.g. "Catching up on classic retro animation"
  imageUrl?: string;   // Base64 data URL of compressed moodboard
}

export interface MediaCardItem {
  id: string;          // e.g. 'media-card-1'
  indexLabel: string;  // '01', '02', '03', '04'
  mediaTitle: string;  // Title of overarching media (e.g. 'Severance', 'Dune')
  title: string;       // Specific goal (e.g. 'Watch 1 episode', 'Beat xyz level')
  isCompleted: boolean;// True when user slides to complete
  imageUrl?: string;   // Base64 data URL of compressed image
}
```

---

## 🎨 Visual Design Tokens Reference

| Role | Color Token | Class | Usage |
| :--- | :--- | :--- | :--- |
| **Theme Card Surface**| Gradient `#FFFDF9` to `#F5EFE6` | `bg-gradient-to-br ...` | Monthly theme card background |
| **Card Surface** | `#FFFFFF` | `bg-white` | Active media card background |
| **Card Completed** | `#F0F4F1`/90 | `bg-[#F0F4F1]/90` | Completed media card background |
| **Card Border** | `#E6DFD5` | `border-[#E6DFD5]` | Card borders and dividers |
| **Title Text** | `#2D2A26` | `text-[#2D2A26]` | Primary bold title |
| **Month / Index** | `#DA7756` | `font-serif-accent text-[#DA7756]` | Large serif italic numerals and month |
| **Slider Knob** | `#DA7756` | `bg-[#DA7756]` | Slide to complete knob |
| **Completed Badge**| `#6E8B74` | `text-[#6E8B74] bg-[#6E8B74]/15` | Completed status badge |
