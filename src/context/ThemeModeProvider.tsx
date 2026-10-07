import type { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useThemeStore } from '@/stores/themeStore';
import { createAppTheme } from '@/theme';

interface ThemeModeProviderProps {
  children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const mode = useThemeStore((store) => store.mode);
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}