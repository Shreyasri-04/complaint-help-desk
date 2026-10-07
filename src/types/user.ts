import type { Role } from '@/types/auth';

/** Mirrors backend UserResponse: {id, username, role, managerId, managerUsername, enabled}. */
export interface User {
  id: number;
  username: string;
  role: Role;
  managerId?: number | null;
  managerUsername?: string | null;
  /** Account status. Optional because older payloads may omit it (treated as enabled). */
  enabled?: boolean | null;
}

export interface UserPayload {
  username: string;
  password: string;
  role: Role;
  managerId?: number | null;
}
