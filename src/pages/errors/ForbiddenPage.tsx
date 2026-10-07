import { AccessDenied } from '@/pages/errors/AccessDenied';

/**
 * Backwards-compatible alias: the `/forbidden` route and RoleRoute
 * historically pointed here. The canonical 403 page is `AccessDenied`.
 */
export function ForbiddenPage() {
  return <AccessDenied />;
}
