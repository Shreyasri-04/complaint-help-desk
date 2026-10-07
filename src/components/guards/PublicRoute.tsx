import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuth, useAuthHydrated } from '@/context/useAuth';
import { debugAuth } from '@/utils/debug';
import { defaultRouteForRole } from '@/utils/routes';

interface PublicRouteProps {
  children: ReactNode;
}


export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, role } = useAuth();
  const hydrated = useAuthHydrated();
  const location = useLocation();

  if (!hydrated) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from;
    const target = from ?? defaultRouteForRole();
    debugAuth('PublicRoute: already authenticated, redirecting', { role, target });
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
}
