import type { ReactNode } from 'react';
import { PageLoader } from '@/components/common/PageLoader';
import { AccessDenied } from '@/pages/errors/AccessDenied';
import { useAuth, useAuthHydrated } from '@/context/useAuth';
import { debugAuth } from '@/utils/debug';
import type { Role } from '@/types/auth';

interface RoleRouteProps {
  /** Backend roles allowed here, e.g. `allowedRoles={[ROLE_MANAGER]}`. */
  allowedRoles: Role[];
  children: ReactNode;
}

/**
 * RBAC route guard. Renders the 403 page inline when the role is missing or
 * not listed — never a silent redirect, never a blank screen. Shows a loader
 * until the persisted session rehydrates, so a refresh can never deny on an
 * empty store. Note: this gate is UX-only; real enforcement happens
 * backend-side per request (@PreAuthorize on the endpoints).
 */
export function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { role } = useAuth();
  const hydrated = useAuthHydrated();

  if (!hydrated) {
    return <PageLoader />;
  }

  const isAllowed = role != null && allowedRoles.includes(role);
  debugAuth('RoleRoute', { role, allowedRoles, allowed: isAllowed });

  if (!isAllowed) {
    return <AccessDenied />;
  } 

  return <>{children}</>;
}
