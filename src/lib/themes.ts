export const THEME_IDS = ["blush", "cocoa", "moss", "lilac"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEMES: {
  id: ThemeId;
  label: string;
  line: string;
  swatches: [string, string, string, string];
}[] = [
  {
    id: "blush",
    label: "Blush",
    line: "The shop as it is now. Pink paper, rose buttons, cocoa type.",
    swatches: ["#fff7f9", "#ffe4ee", "#e56b8a", "#6a3148"],
  },
  {
    id: "cocoa",
    label: "Cocoa",
    line: "Warm paper and caramel buttons. Still light, a little quieter.",
    swatches: ["#faf6f2", "#f6eadf", "#c4784a", "#6b3e2e"],
  },
  {
    id: "moss",
    label: "Moss",
    line: "A green studio. Soft paper, deep leaf buttons.",
    swatches: ["#f4faf7", "#e5f3ee", "#3f8f78", "#24574a"],
  },
  {
    id: "lilac",
    label: "Lilac",
    line: "Cool paper with violet buttons. Light from edge to edge.",
    swatches: ["#f8f6fb", "#eee8f8", "#7c6bb5", "#4c3d72"],
  },
];

export function themeId(value: string | undefined | null): ThemeId {
  return THEME_IDS.includes(value as ThemeId) ? (value as ThemeId) : "blush";
}
