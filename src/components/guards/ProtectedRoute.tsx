import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageLoader } from '@/components/common/PageLoader';
import { useAuth, useAuthHydrated } from '@/context/useAuth';
import { debugAuth } from '@/utils/debug';
import { ROUTES } from '@/utils/routes';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const hydrated = useAuthHydrated();
  const location = useLocation();

  if (!hydrated) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    debugAuth('ProtectedRoute: unauthenticated, redirecting to login');
    const from = location.pathname + location.search;
    return <Navigate to={ROUTES.login} state={{ from }} replace />;
  }

  return <>{children}</>;
}
