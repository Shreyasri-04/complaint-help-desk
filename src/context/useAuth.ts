import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from '@/types/auth';
import { debugAuth } from '@/utils/debug';
import type { AuthCredentials, RegisterResponse, Role } from '@/types/auth';

export interface AuthState {
  token: string | null;
  role: Role | null;
  username: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isUser: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<RegisterResponse | null>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const auth = useAuthStore(
    useShallow((store) => ({
      token: store.token,
      role: store.role,
      username: store.username,
      isAuthenticated: store.token !== null,
      isAdmin: store.role === ROLE_ADMIN,
      isManager: store.role === ROLE_MANAGER,
      isUser: store.role === ROLE_USER,
      login: store.login,
      register: store.register,
      logout: store.logout,
    })),
  );
  debugAuth('useAuth', {
    username: auth.username,
    role: auth.role,
    isAuthenticated: auth.isAuthenticated,
    isManager: auth.isManager,
  });
  return auth;
}

/**
 * True once the persisted session has been rehydrated into the store.
 * Guards must wait for this before denying access, otherwise a refresh can
 * briefly see an empty store and wrongly redirect to login/403.
 */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) {
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  return hydrated;
}