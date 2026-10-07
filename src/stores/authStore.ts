import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '@/services/auth.api';
import { normalizeRole } from '@/types/auth';
import { debugAuth } from '@/utils/debug';
import type { AuthCredentials, RegisterResponse, Role } from '@/types/auth';

export interface AuthState {
  token: string | null;
  role: Role | null;
  username: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<RegisterResponse | null>;
  logout: () => void;
}

interface PersistedAuthSlice {
  token?: AuthState['token'];
  role?: unknown;
  username?: AuthState['username'];
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      username: null,
      login: async (credentials) => {
        const auth = await authService.login(credentials);
        debugAuth('login response', { username: auth.username, role: auth.role });
        const role = normalizeRole(auth.role);
        debugAuth('login role normalized', { from: auth.role, to: role });
        set({ token: auth.token, role, username: auth.username });
      },
      register: async (credentials) => {
        const auth = await authService.register(credentials);
        debugAuth('register response', { username: auth.username, role: auth.role });
        if (auth.token) {
          const role = normalizeRole(auth.role);
          debugAuth('register role normalized', { from: auth.role, to: role });
          set({ token: auth.token, role, username: auth.username });
          return null;
        }
        return auth;
      },
      logout: () => {
        set({ token: null, role: null, username: null });
        // Remove the persisted session so a refresh after logout stays
        // logged out. ProtectedRoute then blocks all guarded pages.
        void useAuthStore.persist.clearStorage();
      },
    }),
    {
      name: 'ticket_desk',
      version: 1,
      // Repairs roles persisted before normalization existed (e.g. "MANAGER").
      migrate: (persistedState) => {
        const previous = persistedState as PersistedAuthSlice | undefined;
        if (!previous) {
          return previous as unknown as AuthState;
        }
        const role = normalizeRole(previous.role);
        debugAuth('migrated persisted role', { from: previous.role, to: role });
        return { ...previous, role } as AuthState;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        username: state.username,
      }),
    },
  ),
);