/**
 * Sub-goal utility functions for parsing and managing multiple goals in a single card.
 * Goals can be split using '//' as a separator (e.g., "brush teeth // make bed").
 */

/**
 * Splits a goal title by the '//' separator into trimmed sub-goals.
 * Empty or whitespace-only segments are discarded.
 */
export const parseSubGoals = (title: string): string[] => {
  if (!title || !title.includes('//')) return [];
  return title
    .split('//')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * Checks if a goal title contains multiple sub-goals (at least 2 non-empty items).
 */
export const hasMultipleSubGoals = (title: string): boolean => {
  return parseSubGoals(title).length >= 2;
};
