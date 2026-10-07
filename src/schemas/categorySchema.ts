import { z } from 'zod';
import { VALIDATION } from '@/utils/constants';

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(
      VALIDATION.categoryName.max,
      `Name must be at most ${VALIDATION.categoryName.max} characters`,
    ),
  slaHours: z
    .string()
    .min(1, 'SLA hours must be a number')
    .transform((value, ctx) => {
      const parsed = Number(value);
      if (!value.trim() || Number.isNaN(parsed)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SLA hours must be a number' });
        return z.NEVER;
      }
      if (parsed < VALIDATION.slaHours.min || parsed > VALIDATION.slaHours.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `SLA hours must be between ${VALIDATION.slaHours.min} and ${VALIDATION.slaHours.max}`,
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;