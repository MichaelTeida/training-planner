export type ThemeId = 'onyx' | 'chalk' | 'titanium' | 'nordic' | 'ivory' | 'studio';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  dotColor: string;
  accent: string;
  isDark: boolean;
}

export const THEMES: ThemeDefinition[] = [
  { id: 'onyx', name: 'Onyx Crimson', dotColor: '#e5484d', accent: '#e5484d', isDark: true },
  { id: 'chalk', name: 'Mono Chalk', dotColor: '#f4f4f6', accent: '#f4f4f6', isDark: true },
  { id: 'titanium', name: 'Titanium Blue', dotColor: '#3b82f6', accent: '#3b82f6', isDark: true },
  { id: 'nordic', name: 'Nordic Forest', dotColor: '#22c55e', accent: '#22c55e', isDark: true },
  { id: 'ivory', name: 'Ivory Crimson', dotColor: '#e5484d', accent: '#e5484d', isDark: false },
  { id: 'studio', name: 'Studio Slate', dotColor: '#2563eb', accent: '#2563eb', isDark: false }
];

export const THEME_STORAGE_KEY = 'training_planner_theme_v1';

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'onyx' || saved === 'chalk' || saved === 'titanium' || saved === 'nordic' || saved === 'ivory' || saved === 'studio') {
      return saved;
    }
  } catch { /* noop */ }
  return 'onyx';
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch { /* noop */ }
}
