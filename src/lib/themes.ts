// ── Theme definitions — 10 palettes ─────────────────────────────
export interface ThemePalette {
  id: string;
  name: string;
  emoji: string;
  primary: string;
  primaryContainer: string;
  primaryFixed: string;
  secondary: string;
  secondaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  inversePrimary: string;
  ring: string;
  heroFrom: string;
  heroMid: string;
  heroTo: string;
  sidebarActive: string;
  accent: string; // CSS hex for direct use
}

export const THEMES: ThemePalette[] = [
  {
    id: "green",
    name: "Emerald",
    emoji: "🌿",
    primary: "#004f34",
    primaryContainer: "#006947",
    primaryFixed: "#9ff4c8",
    secondary: "#006c4a",
    secondaryContainer: "#6cf8bb",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#90e5ba",
    inversePrimary: "#83d7ad",
    ring: "#004f34",
    heroFrom: "#001f10",
    heroMid: "#004433",
    heroTo: "#006947",
    sidebarActive: "#006947",
    accent: "#004f34",
  },
  {
    id: "blue",
    name: "Ocean",
    emoji: "🌊",
    primary: "#0057a8",
    primaryContainer: "#1976d2",
    primaryFixed: "#bbdefb",
    secondary: "#0288d1",
    secondaryContainer: "#b3e5fc",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#e3f2fd",
    inversePrimary: "#90caf9",
    ring: "#0057a8",
    heroFrom: "#001529",
    heroMid: "#003a75",
    heroTo: "#0057a8",
    sidebarActive: "#1976d2",
    accent: "#0057a8",
  },
  {
    id: "purple",
    name: "Violet",
    emoji: "💜",
    primary: "#5b21b6",
    primaryContainer: "#7c3aed",
    primaryFixed: "#ede9fe",
    secondary: "#6d28d9",
    secondaryContainer: "#ddd6fe",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#f5f3ff",
    inversePrimary: "#c4b5fd",
    ring: "#5b21b6",
    heroFrom: "#1e0944",
    heroMid: "#3b1a8c",
    heroTo: "#5b21b6",
    sidebarActive: "#7c3aed",
    accent: "#5b21b6",
  },
  {
    id: "red",
    name: "Crimson",
    emoji: "❤️",
    primary: "#9b1c1c",
    primaryContainer: "#c81e1e",
    primaryFixed: "#fee2e2",
    secondary: "#b91c1c",
    secondaryContainer: "#fecaca",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#fff5f5",
    inversePrimary: "#fca5a5",
    ring: "#9b1c1c",
    heroFrom: "#2d0505",
    heroMid: "#6b0e0e",
    heroTo: "#9b1c1c",
    sidebarActive: "#c81e1e",
    accent: "#9b1c1c",
  },
  {
    id: "orange",
    name: "Sunset",
    emoji: "🍊",
    primary: "#c2410c",
    primaryContainer: "#ea580c",
    primaryFixed: "#ffedd5",
    secondary: "#d97706",
    secondaryContainer: "#fde68a",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#fff7ed",
    inversePrimary: "#fdba74",
    ring: "#c2410c",
    heroFrom: "#2d0f00",
    heroMid: "#7c2d12",
    heroTo: "#c2410c",
    sidebarActive: "#ea580c",
    accent: "#c2410c",
  },
  {
    id: "yellow",
    name: "Gold",
    emoji: "⭐",
    primary: "#92400e",
    primaryContainer: "#b45309",
    primaryFixed: "#fef3c7",
    secondary: "#d97706",
    secondaryContainer: "#fde68a",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#fffbeb",
    inversePrimary: "#fcd34d",
    ring: "#92400e",
    heroFrom: "#1c0f00",
    heroMid: "#4d2b00",
    heroTo: "#92400e",
    sidebarActive: "#b45309",
    accent: "#92400e",
  },
  {
    id: "pink",
    name: "Rose",
    emoji: "🌸",
    primary: "#9d174d",
    primaryContainer: "#be185d",
    primaryFixed: "#fce7f3",
    secondary: "#db2777",
    secondaryContainer: "#fbcfe8",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#fdf2f8",
    inversePrimary: "#f9a8d4",
    ring: "#9d174d",
    heroFrom: "#2d0418",
    heroMid: "#6d1039",
    heroTo: "#9d174d",
    sidebarActive: "#be185d",
    accent: "#9d174d",
  },
  {
    id: "teal",
    name: "Teal",
    emoji: "🩵",
    primary: "#0f766e",
    primaryContainer: "#0d9488",
    primaryFixed: "#ccfbf1",
    secondary: "#0891b2",
    secondaryContainer: "#cffafe",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#f0fdfa",
    inversePrimary: "#5eead4",
    ring: "#0f766e",
    heroFrom: "#012221",
    heroMid: "#094740",
    heroTo: "#0f766e",
    sidebarActive: "#0d9488",
    accent: "#0f766e",
  },
  {
    id: "magenta",
    name: "Magenta",
    emoji: "🪷",
    primary: "#86198f",
    primaryContainer: "#a21caf",
    primaryFixed: "#fae8ff",
    secondary: "#9333ea",
    secondaryContainer: "#f3e8ff",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#fdf4ff",
    inversePrimary: "#e879f9",
    ring: "#86198f",
    heroFrom: "#1e0429",
    heroMid: "#560c64",
    heroTo: "#86198f",
    sidebarActive: "#a21caf",
    accent: "#86198f",
  },
  {
    id: "gray",
    name: "Slate",
    emoji: "🩶",
    primary: "#334155",
    primaryContainer: "#475569",
    primaryFixed: "#e2e8f0",
    secondary: "#64748b",
    secondaryContainer: "#cbd5e1",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#f8fafc",
    inversePrimary: "#94a3b8",
    ring: "#334155",
    heroFrom: "#0f172a",
    heroMid: "#1e293b",
    heroTo: "#334155",
    sidebarActive: "#475569",
    accent: "#334155",
  },
];

// ── Apply theme to :root CSS vars ────────────────────────────────
export function applyTheme(theme: ThemePalette) {
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-container", theme.primaryContainer);
  root.style.setProperty("--primary-fixed", theme.primaryFixed);
  root.style.setProperty("--primary-fixed-dim", theme.inversePrimary);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--secondary-container", theme.secondaryContainer);
  root.style.setProperty("--on-primary", theme.onPrimary);
  root.style.setProperty("--on-primary-container", theme.onPrimaryContainer);
  root.style.setProperty("--inverse-primary", theme.inversePrimary);
  root.style.setProperty("--sidebar-active-border", theme.sidebarActive);
  root.style.setProperty("--accent-500", theme.accent);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--ring", theme.ring);
  root.style.setProperty("--hero-from", theme.heroFrom);
  root.style.setProperty("--hero-mid", theme.heroMid);
  root.style.setProperty("--hero-to", theme.heroTo);
  // Sidebar
  root.style.setProperty("--sidebar-active", `${theme.sidebarActive}20`);
  // tw compat
  root.style.setProperty("--primary-tw", hexToHsl(theme.primary));
  root.style.setProperty("--ring", hexToHsl(theme.ring));
  // Store in localStorage
  localStorage.setItem("rolematch_theme", theme.id);
}

export function getSavedTheme(): ThemePalette {
  const saved = localStorage.getItem("rolematch_theme");
  return THEMES.find(t => t.id === saved) || THEMES[0];
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
