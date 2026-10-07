import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { PublicRoute } from '@/components/guards/PublicRoute';
import { RoleRoute } from '@/components/guards/RoleRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { AccessDenied } from '@/pages/errors/AccessDenied';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { TicketListPage } from '@/pages/tickets/TicketListPage';
import { ROUTES } from '@/utils/routes';
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from '@/types/auth';

const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const TicketDetailPage = lazy(() =>
  import('@/pages/tickets/TicketDetailPage').then((module) => ({ default: module.TicketDetailPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/categories/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
);
const CategoryDetailPage = lazy(() =>
  import('@/pages/categories/CategoryDetailPage').then((module) => ({ default: module.CategoryDetailPage })),
);
const ManagerDashboard = lazy(() =>
  import('@/pages/tickets/ManagerDashboard').then((module) => ({ default: module.ManagerDashboard })),
);
const TeamPage = lazy(() =>
  import('@/pages/admin/TeamPage').then((module) => ({ default: module.TeamPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
      <CircularProgress />
    </Box>
  );
}

function withSuspense(element: ReactElement) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function App() {
  return (
    <Routes>
      {/* Public: auth pages redirect to the dashboard when already signed in. */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path={ROUTES.accessDenied} element={<AccessDenied />} />
      <Route path={ROUTES.page403} element={<AccessDenied />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* The single shared dashboard for every role. */}
        <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="dashboard" element={withSuspense(<DashboardPage />)} />
        <Route path="tickets" element={withSuspense(<TicketListPage />)} />
        <Route
          path="tickets/new"
          element={
            <RoleRoute allowedRoles={[ROLE_USER, ROLE_MANAGER]}>
              <TicketListPage autoCreate />
            </RoleRoute>
          }
        />
        <Route path="tickets/:id" element={withSuspense(<TicketDetailPage />)} />
        <Route
          path="assigned"
          element={
            <RoleRoute allowedRoles={[ROLE_MANAGER]}>
              {withSuspense(<ManagerDashboard />)}
            </RoleRoute>
          }
        />
        <Route
          path="categories"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<CategoriesPage />)}
            </RoleRoute>
          }
        />
        <Route
          path="categories/:id"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<CategoryDetailPage />)}
            </RoleRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <RoleRoute allowedRoles={[ROLE_ADMIN]}>
              {withSuspense(<TeamPage />)}
            </RoleRoute>
          }
        />
        <Route path="profile" element={withSuspense(<ProfilePage />)} />
        {/* Legacy paths: redirect to the single dashboard instead of forking per role. */}
        <Route path="manager-dashboard" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="admin" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
