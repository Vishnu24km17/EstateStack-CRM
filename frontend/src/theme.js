import { createTheme } from '@mui/material/styles'

export const luxuryTheme = (mode = 'light', primaryColor = '#1a237e') => {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: primaryColor,
        light: isDark ? '#4a4a8a' : '#3949ab',
        dark: isDark ? '#0a0a2a' : '#0d1445',
      },
      secondary: {
        main: '#c9a84c', // Gold
        light: '#d4b95e',
        dark: '#b8973a',
      },
      accent: {
        gold: '#c9a84c',
        goldLight: '#f4e8c1',
        goldDark: '#a6852a',
      },
      background: {
        default: isDark ? '#0a0a0f' : '#f8f6f2',
        paper: isDark ? '#14141e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f5f0e8' : '#1a1a1a',
        secondary: isDark ? '#a89f8f' : '#5a5a5a',
      },
    },
    typography: {
      fontFamily:
        '"Playfair Display", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 600,
      },
      h5: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 500,
      },
      h6: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 500,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.06)',
            backdropFilter: isDark ? 'blur(10px)' : 'none',
            background: isDark ? 'rgba(20,20,30,0.85)' : '#ffffff',
            border: isDark
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(0,0,0,0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(20,20,30,0.85)' : '#ffffff',
            backdropFilter: isDark ? 'blur(10px)' : 'none',
            border: isDark
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(0,0,0,0.04)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? 'rgba(10,10,15,0.9)'
              : 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
            },
          },
        },
      },
    },
  })
}
