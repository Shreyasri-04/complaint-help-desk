import { z } from 'zod';
import { VALIDATION } from '@/utils/constants';
import { VALIDATION_MESSAGES } from '@/utils/messages';
import {
  PASSWORD_PATTERN,
  USERNAME_PATTERN,
  hasSequentialRun,
  isCommonPassword,
} from '@/utils/validationRules';

const USERNAME_MIN = VALIDATION.strictUsername.min;
const USERNAME_MAX = VALIDATION.strictUsername.max;
const PASSWORD_MIN = VALIDATION.strictPassword.min;
const PASSWORD_MAX = VALIDATION.strictPassword.max;

const usernameMsg = VALIDATION_MESSAGES.username;
const passwordMsg = VALIDATION_MESSAGES.password;
const confirmMsg = VALIDATION_MESSAGES.confirmPassword;


export const usernameSchema = z
  .string()
  .min(USERNAME_MIN, usernameMsg.min(USERNAME_MIN))
  .max(USERNAME_MAX, usernameMsg.max(USERNAME_MAX))
  .regex(USERNAME_PATTERN.startLetter, usernameMsg.startLetter)
  .refine((value) => !USERNAME_PATTERN.whitespace.test(value), usernameMsg.noSpaces)
  .regex(USERNAME_PATTERN.allowedChars, usernameMsg.validChars)
  .refine(
    (value) => !USERNAME_PATTERN.consecutiveUnderscore.test(value),
    usernameMsg.noConsecutiveUnderscore,
  )
  .refine(
    (value) => !USERNAME_PATTERN.trailingUnderscore.test(value),
    usernameMsg.noTrailingUnderscore,
  );


export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, passwordMsg.min(PASSWORD_MIN))
  .max(PASSWORD_MAX, passwordMsg.max(PASSWORD_MAX))
  .regex(PASSWORD_PATTERN.uppercase, passwordMsg.uppercase)
  .regex(PASSWORD_PATTERN.lowercase, passwordMsg.lowercase)
  .regex(PASSWORD_PATTERN.digit, passwordMsg.number)
  .regex(PASSWORD_PATTERN.special, passwordMsg.special)
  .refine((value) => !PASSWORD_PATTERN.whitespace.test(value), passwordMsg.noSpaces)
  .refine((value) => !isCommonPassword(value), passwordMsg.weak)
  .refine((value) => !PASSWORD_PATTERN.repeat.test(value), passwordMsg.repeating)
  .refine((value) => !hasSequentialRun(value), passwordMsg.sequential);

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, confirmMsg.required),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: confirmMsg.mismatch,
    path: ['confirmPassword'],
  })
  .superRefine((values, ctx) => {
    const name = values.username.trim().toLowerCase();
    if (name.length >= USERNAME_MIN && values.password.toLowerCase().includes(name)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordMsg.containsUsername,
        path: ['password'],
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;


export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, usernameMsg.required)
    .max(VALIDATION.username.max, usernameMsg.max(VALIDATION.username.max)),
  password: z.string().min(1, passwordMsg.required),
});

export type AuthFormValues = z.infer<typeof loginSchema>;

export interface LoginFieldErrors {
  username?: string;
  password?: string;
}

export interface RegisterFieldErrors extends LoginFieldErrors {
  confirmPassword?: string;
}


export function mapZodFieldErrors<TField extends string>(
  error: z.ZodError,
  fields: readonly TField[],
): Partial<Record<TField, string>> {
  const fieldErrors = error.flatten().fieldErrors as Partial<Record<string, string[]>>;
  const mapped: Partial<Record<TField, string>> = {};
  for (const field of fields) {
    const message = fieldErrors[field]?.[0];
    if (message) {
      mapped[field] = message;
    }
  }
  return mapped;
}

const LOGIN_FIELDS = ['username', 'password'] as const;
const REGISTER_FIELDS = ['username', 'password', 'confirmPassword'] as const;


export function validateLoginForm(values: {
  username: string;
  password: string;
}): LoginFieldErrors {
  const parsed = loginSchema.safeParse(values);
  if (parsed.success) {
    return {};
  }
  return mapZodFieldErrors(parsed.error, LOGIN_FIELDS);
}

/**
 * Validates registration values (strength + match + username rules) and
 * returns per-field messages. Same contract as validateLoginForm.
 */
export function validateRegisterForm(values: {
  username: string;
  password: string;
  confirmPassword: string;
}): RegisterFieldErrors {
  const parsed = registerSchema.safeParse(values);
  if (parsed.success) {
    return {};
  }
  return mapZodFieldErrors(parsed.error, REGISTER_FIELDS);
}

export function hasFieldErrors(errors: LoginFieldErrors): boolean {
  return Boolean(errors.username || errors.password);
}

export function hasRegisterFieldErrors(errors: RegisterFieldErrors): boolean {
  return hasFieldErrors(errors) || Boolean(errors.confirmPassword);
}
