/**
 * Reusable validation patterns and checks.
 * No messages here — copy lives in VALIDATION_MESSAGES (utils/messages.ts),
 * composition lives in the schema modules.
 */

export const USERNAME_PATTERN = {
  startLetter: /^[A-Za-z]/,
  allowedChars: /^[A-Za-z0-9_]+$/,
  consecutiveUnderscore: /_{2,}/,
  trailingUnderscore: /_$/,
  whitespace: /\s/,
} as const;

export const PASSWORD_PATTERN = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
  whitespace: /\s/,
  repeat: /(.)\1{3,}/i,
} as const;

/** Exact (case-insensitive) matches that are always rejected. */
export const COMMON_WEAK_PASSWORDS = [
  'password',
  'passw0rd',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'letmein',
  'welcome',
  'admin',
  'administrator',
];

/**
 * Longer weak tokens also rejected as substrings (case-insensitive), e.g.
 * "Qwerty1!" or "abc123456!". Short tokens like "admin" stay exact-match
 * only to avoid false positives inside otherwise strong passwords.
 */
export const COMMON_WEAK_SUBSTRINGS = COMMON_WEAK_PASSWORDS.filter(
  (word) => word.length >= 6,
);

export const KEYBOARD_ROWS = ['qwerty', 'qwertz', 'azerty', 'asdf', 'zxcv'];

export function isCommonPassword(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    COMMON_WEAK_PASSWORDS.includes(lower) ||
    COMMON_WEAK_SUBSTRINGS.some((word) => lower.includes(word))
  );
}

/**
 * Detects ascending/descending runs of 4+ letters/digits ("abcd", "4321")
 * and common keyboard-row fragments ("qwer", "asdf").
 */
export function hasSequentialRun(value: string): boolean {
  const lower = value.toLowerCase();
  const RUN = 4;
  for (let i = 0; i + RUN <= lower.length; i++) {
    const slice = lower.slice(i, i + RUN);
    if (!/^[a-z0-9]+$/.test(slice)) {
      continue;
    }
    let ascending = true;
    let descending = true;
    for (let j = 1; j < slice.length; j++) {
      if (slice.charCodeAt(j) !== slice.charCodeAt(j - 1) + 1) {
        ascending = false;
      }
      if (slice.charCodeAt(j) !== slice.charCodeAt(j - 1) - 1) {
        descending = false;
      }
    }
    if (ascending || descending) {
      return true;
    }
  }
  return KEYBOARD_ROWS.some((row) => lower.includes(row));
}
