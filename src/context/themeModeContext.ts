import { useShallow } from 'zustand/react/shallow';
import { useThemeStore } from '@/stores/themeStore';
import type { ThemeMode } from '@/stores/themeStore';

export { THEME_MODE_STORAGE_KEY } from '@/stores/themeStore';
export type { ThemeMode };

export interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

export function useThemeMode(): ThemeModeContextValue {
  return useThemeStore(
    useShallow((store) => ({ mode: store.mode, toggleMode: store.toggleMode })),
  );
}