import { z } from 'zod';
import { TICKET_PRIORITY } from '@/types/ticket';
import { VALIDATION } from '@/utils/constants';

export const ticketFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, 'Subject is required')
    .max(
      VALIDATION.subject.max,
      `Subject must be at most ${VALIDATION.subject.max} characters`,
    ),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(
      VALIDATION.description.max,
      `Description must be at most ${VALIDATION.description.max} characters`,
    ),
  categoryId: z
    .string()
    .min(1, 'Category is required')
    .transform((value, ctx) => {
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Category is required' });
        return z.NEVER;
      }
      return parsed;
    }),
  priority: z.enum([TICKET_PRIORITY.LOW, TICKET_PRIORITY.MEDIUM, TICKET_PRIORITY.HIGH]),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;