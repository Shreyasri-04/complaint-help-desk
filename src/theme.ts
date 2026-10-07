import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { ThemeMode } from '@/context/themeModeContext';

const focusGlow = (alpha: string) => `0 0 0 4px ${alpha}`;

export const createAppTheme = (mode: ThemeMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' },
      secondary: { main: '#334155' },
      success: { main: '#16a34a' },
      warning: { main: '#d97706' },
      error: { main: '#dc2626' },
      background:
        mode === 'light'
          ? { default: '#f1f5f9', paper: '#ffffff' }
          : { default: '#0b1120', paper: '#16213a' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.45)',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? 'rgba(37,99,235,0.55)' : 'rgba(96,165,250,0.55)',
            },
            '&.Mui-focused': {
              boxShadow:
                mode === 'light' ? focusGlow('rgba(37,99,235,0.16)') : focusGlow('rgba(96,165,250,0.2)'),
            },
            '&.Mui-error.Mui-focused': {
              boxShadow:
                mode === 'light' ? focusGlow('rgba(220,38,38,0.12)') : focusGlow('rgba(248,113,113,0.18)'),
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 500 },
        },
      },
      MuiCheckbox: {
        defaultProps: { size: 'small' },
      },
    },
  });