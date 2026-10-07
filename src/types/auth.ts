export const ROLE_ADMIN = 'ROLE_ADMIN';
export const ROLE_MANAGER = 'ROLE_MANAGER';
export const ROLE_USER = 'ROLE_USER';

export type Role = typeof ROLE_ADMIN | typeof ROLE_MANAGER | typeof ROLE_USER;

/**
 * Normalizes a role value received from the backend.
 * Accepts "MANAGER", "role_manager", " ROLE_USER ", etc. and maps them to the
 * canonical "ROLE_*" form. Returns null for missing/empty values so guards can
 * explicitly deny instead of crashing on undefined.
 */
export function normalizeRole(value: unknown): Role | null {
  if (typeof value !== 'string') {
    return null;
  }
  const upper = value.trim().toUpperCase();
  if (!upper) {
    return null;
  }
  const normalized = upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
  if (
    normalized === ROLE_ADMIN ||
    normalized === ROLE_MANAGER ||
    normalized === ROLE_USER
  ) {
    return normalized;
  }
  // Unknown but non-empty role: preserve it (still a valid session for
  // token-guarded pages) so future roles don't hard-lock users out.
  return normalized as Role;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: Role;
  issuedAt?: string;
  expiresAt?: string;
}

/**
 * What POST /auth/register returns (no session): a plain user payload.
 * `token` stays optional so the store can branch on "did we get a session?".
 */
export interface RegisterResponse {
  token?: string;
  username: string;
  role: Role;
}

export interface AuthCredentials {
  username: string;
  password: string;
}