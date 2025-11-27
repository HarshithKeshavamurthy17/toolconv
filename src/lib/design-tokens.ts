export type ThemeName = 'light' | 'dark';

export const colors: Record<ThemeName, Record<string, string>> = {
  light: {
    base: '210 40% 98%',
    surface: '210 40% 96%',
    text: '222 47% 11%',
    accent: '188 86% 53%',
    muted: '214 32% 92%',
    mutedForeground: '222 16% 40%',
    border: '214 32% 86%',
    ring: '188 86% 53%',
  },
  dark: {
    base: '213 29% 6%',
    surface: '212 36% 9%',
    text: '216 12% 91%',
    accent: '188 86% 53%',
    muted: '215 28% 17%',
    mutedForeground: '217 15% 65%',
    border: '217 23% 20%',
    ring: '188 86% 53%',
  },
};

export const radii = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
};

export const shadows = {
  sm: '0 1px 2px rgba(15, 23, 32, 0.08)',
  md: '0 8px 20px rgba(15, 23, 32, 0.18)',
  lg: '0 18px 48px rgba(11, 15, 20, 0.35)',
};

export const transitions = {
  fast: '120ms ease',
  base: '160ms ease',
  slow: '260ms ease',
};

