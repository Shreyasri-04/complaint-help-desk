/**
 * Dev-only auth diagnostics. All calls are no-ops in production builds, so
 * these can stay in the codebase permanently without leaking internals.
 */
export function debugAuth(...args: unknown[]): void {
  if (import.meta.env.DEV) {
    console.debug('[auth]', ...args);
  }
}
