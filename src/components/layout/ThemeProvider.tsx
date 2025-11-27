import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { colors, radii, shadows, transitions, type ThemeName } from '../../lib/design-tokens';
import { cn } from '../../lib/cn';
import { Button } from '../ui/button';

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'hk-theme';

function triggerSparkles() {
  if (typeof document === 'undefined') {
    return;
  }

  const container = document.createElement('div');
  container.className = 'theme-sparkles';

  for (let i = 0; i < 24; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'theme-sparkles__particle';
    particle.style.setProperty('--spark-x', `${Math.random() * 200 - 100}px`);
    particle.style.setProperty('--spark-y', `${Math.random() * 140 - 70}px`);
    particle.style.setProperty('--spark-rot', `${Math.random() * 360}deg`);
    container.appendChild(particle);
  }

  document.body.appendChild(container);

  window.setTimeout(() => {
    container.remove();
  }, 300);
}

function getInitialTheme(defaultTheme: ThemeName, storageKey: string): ThemeName {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey) as ThemeName | null;
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return defaultTheme;
}

function applyThemeVariables(theme: ThemeName) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const palette = colors[theme];

  root.style.setProperty('--color-base', palette.base);
  root.style.setProperty('--color-surface', palette.surface);
  root.style.setProperty('--color-text', palette.text);
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--color-muted', palette.muted);
  root.style.setProperty('--color-muted-foreground', palette.mutedForeground);
  root.style.setProperty('--color-border', palette.border);
  root.style.setProperty('--color-ring', palette.ring);

  root.style.setProperty('--background', palette.base);
  root.style.setProperty('--foreground', palette.text);
  root.style.setProperty('--card', palette.surface);
  root.style.setProperty('--card-foreground', palette.text);
  root.style.setProperty('--popover', palette.surface);
  root.style.setProperty('--popover-foreground', palette.text);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--muted-foreground', palette.mutedForeground);
  root.style.setProperty('--border', palette.border);
  root.style.setProperty('--input', palette.border);
  root.style.setProperty('--secondary', palette.surface);
  root.style.setProperty('--secondary-foreground', palette.text);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty(
    '--accent-foreground',
    theme === 'dark' ? colors.dark.base : colors.light.text,
  );
  root.style.setProperty('--primary', palette.accent);
  root.style.setProperty(
    '--primary-foreground',
    theme === 'dark' ? colors.dark.base : colors.light.text,
  );
  root.style.setProperty('--ring', palette.ring);
  root.style.setProperty('--destructive', '0 62% 50%');
  root.style.setProperty(
    '--destructive-foreground',
    theme === 'dark' ? colors.dark.text : '210 40% 98%',
  );

  Object.entries(radii).forEach(([token, value]) => {
    root.style.setProperty(`--radius-${token}`, value);
  });
  root.style.setProperty('--radius', radii.md);

  Object.entries(shadows).forEach(([token, value]) => {
    root.style.setProperty(`--shadow-${token}`, value);
  });

  Object.entries(transitions).forEach(([token, value]) => {
    root.style.setProperty(`--transition-${token}`, value);
  });
}

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeName>(() => {
    const initialTheme = getInitialTheme(defaultTheme, storageKey);

    if (typeof window !== 'undefined') {
      applyThemeVariables(initialTheme);
      const root = document.documentElement;
      root.dataset.theme = initialTheme;
      root.classList.toggle('dark', initialTheme === 'dark');
      root.style.setProperty('color-scheme', initialTheme);
    }

    return initialTheme;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    applyThemeVariables(theme);
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty('color-scheme', theme);
    window.localStorage.setItem(storageKey, theme);
  }, [storageKey, theme]);

  const setTheme = React.useCallback((nextTheme: ThemeName) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      triggerSparkles();
      return next;
    });
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export const ThemeToggle: React.FC<React.ComponentProps<typeof Button>> = ({
  className,
  ...props
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-pressed={isDark}
      aria-label={`Activate ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      className={cn('relative', className)}
      {...props}
    >
      <Sun className="pointer-events-none size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="pointer-events-none absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
