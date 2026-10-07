import { ROLE_ADMIN, ROLE_MANAGER, ROLE_USER } from '@/types/auth';
import type { Role } from '@/types/auth';

export interface EmployeeProfile {
  employeeId: string;
  phoneNumber: string;
  designation: string;
  email: string;
  projectManager: string;
  reportingManager: string;
  hrManager: string;
}

/**
 * Hardcoded employee details per role (frontend-only placeholder — no API,
 * no backend, no database). Single source of truth: components select the
 * entry by the authenticated role from the auth store, never inline strings.
 */
export const EMPLOYEE_PROFILES: Record<Role, EmployeeProfile> = {
  [ROLE_USER]: {
    employeeId: 'EMP001',
    phoneNumber: '9876543210',
    designation: 'Software Engineer',
    email: 'user@company.com',
    projectManager: 'Manager One',
    reportingManager: 'Manager One',
    hrManager: 'HR One',
  },
  [ROLE_MANAGER]: {
    employeeId: 'EMP002',
    phoneNumber: '9876543211',
    designation: 'Project Manager',
    email: 'manager@company.com',
    projectManager: 'Senior Manager',
    reportingManager: 'Senior Manager',
    hrManager: 'HR One',
  },
  [ROLE_ADMIN]: {
    employeeId: 'EMP003',
    phoneNumber: '9876543212',
    designation: 'Admin',
    email: 'admin@company.com',
    projectManager: 'Management',
    reportingManager: 'Management',
    hrManager: 'HR One',
  },
};

/** Hardcoded profile for a role (falls back to USER when role is unknown). */
export function employeeProfileForRole(role: Role | null): EmployeeProfile {
  if (role != null && role in EMPLOYEE_PROFILES) {
    return EMPLOYEE_PROFILES[role];
  }
  return EMPLOYEE_PROFILES[ROLE_USER];
}
