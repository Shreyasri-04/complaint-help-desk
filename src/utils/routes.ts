export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forbidden: '/forbidden',
  accessDenied: '/access-denied',
  page403: '/403',
  /** The single shared dashboard for every authenticated role. */
  dashboard: '/dashboard',
  tickets: '/tickets',
  ticketNew: '/tickets/new',
  /** Manager-only list of tickets raised by assigned users. */
  assigned: '/assigned',
  categories: '/categories',
  adminUsers: '/admin/users',
  profile: '/profile',
} as const;

/**
 * Landing page after sign-in. There is exactly one dashboard — role only
 * changes what the dashboard renders, never the URL.
 */
export function defaultRouteForRole(): string {
  return ROUTES.dashboard;
}
