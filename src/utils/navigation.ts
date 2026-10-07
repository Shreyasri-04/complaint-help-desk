import type { ComponentType } from 'react';
import AddOutlined from '@mui/icons-material/AddOutlined';
import ConfirmationNumberOutlined from '@mui/icons-material/ConfirmationNumberOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import AssignmentIndOutlined from '@mui/icons-material/AssignmentIndOutlined';
import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from '@/types/auth';
import type { Role } from '@/types/auth';
import { ROUTES } from '@/utils/routes';

/**
 * Configuration-driven sidebar menu — the single place menu items live.
 * The Sidebar filters by the logged-in role; components never hardcode items.
 */
export interface MenuEntry {
  label: string;
  path: string;
  icon: ComponentType;
  allowedRoles: Role[];
}

export const MENU_ITEMS: MenuEntry[] = [
  {
    label: 'Dashboard',
    path: ROUTES.dashboard,
    icon: DashboardOutlined,
    allowedRoles: [ROLE_ADMIN, ROLE_MANAGER, ROLE_USER],
  },
  {
    // USER/MANAGER: own tickets. ADMIN: all tickets (backend-scoped).
    label: 'My Tickets',
    path: ROUTES.tickets,
    icon: ConfirmationNumberOutlined,
    allowedRoles: [ROLE_USER, ROLE_MANAGER],
  },
  {
    label: 'Tickets',
    path: ROUTES.tickets,
    icon: ConfirmationNumberOutlined,
    allowedRoles: [ROLE_ADMIN],
  },
  {
    label: 'Create Ticket',
    path: ROUTES.ticketNew,
    icon: AddOutlined,
    allowedRoles: [ROLE_USER, ROLE_MANAGER],
  },
  {
    label: 'Assigned Tickets',
    path: ROUTES.assigned,
    icon: AssignmentIndOutlined,
    allowedRoles: [ROLE_MANAGER],
  },
  {
    label: 'Users',
    path: ROUTES.adminUsers,
    icon: GroupOutlined,
    allowedRoles: [ROLE_ADMIN],
  },
  {
    label: 'Categories',
    path: ROUTES.categories,
    icon: CategoryOutlined,
    allowedRoles: [ROLE_ADMIN],
  },
  {
    label: 'Profile',
    path: ROUTES.profile,
    icon: PersonOutlined,
    allowedRoles: [ROLE_ADMIN, ROLE_MANAGER, ROLE_USER],
  },
];

/** Menu entries visible to a role (null role sees nothing). */
export function menuForRole(role: Role | null): MenuEntry[] {
  if (role == null) {
    return [];
  }
  return MENU_ITEMS.filter((item) => item.allowedRoles.includes(role));
}
