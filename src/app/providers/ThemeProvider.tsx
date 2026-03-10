import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useMemo, useState, createContext, useContext } from 'react';

const ColorModeContext = createContext({ toggle: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary:   { main: '#6C63FF', light: '#9C94FF', dark: '#4A42CC' },
          success:   { main: '#22C55E' },
          warning:   { main: '#F59E0B' },
          error:     { main: '#EF4444' },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0F0F1A',
            paper:   mode === 'light' ? '#FFFFFF'  : '#1A1A2E',
          },
        },
        typography: {
          fontFamily: "'Inter', 'Roboto', sans-serif",
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 10,
                padding: '8px 20px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06)',
                borderRadius: 16,
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                '& .MuiTableCell-root': {
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: mode === 'light' ? '#64748B' : '#94A3B8',
                  backgroundColor: mode === 'light' ? '#F1F5F9' : '#1E293B',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 600, borderRadius: 8 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ toggle: () => setMode(m => m === 'light' ? 'dark' : 'light') }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
