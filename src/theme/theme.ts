import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#7C6AF7',
        light: '#9D8FF9',
        dark: '#5A47E0',
      },
      secondary: {
        main: '#F5A623',
      },
      background: isDark
        ? { default: '#0F0F1A', paper: '#1A1A2E' }
        : { default: '#F4F4F8', paper: '#FFFFFF' },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#0F0F1A' : '#FFFFFF',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

export default createAppTheme('dark');
