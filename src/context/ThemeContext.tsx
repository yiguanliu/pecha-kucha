import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from '../theme/theme';

type Mode = 'light' | 'dark';

interface ThemeContextValue {
  mode: Mode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  toggleTheme: () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('theme-mode') as Mode) ?? 'dark';
  });

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme-mode', next);
      return next;
    });
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
