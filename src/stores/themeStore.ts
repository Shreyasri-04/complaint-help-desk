import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

export const THEME_MODE_STORAGE_KEY = 'ticket_desk_theme_mode';

export interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleMode: () =>
        set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: THEME_MODE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);