import { z } from 'zod';
import { VALIDATION } from '@/utils/constants';

export const commentSchema = z.object({
  message: z
    .string()
    .trim()
    .min(VALIDATION.comment.min, 'Comment cannot be empty')
    .max(
      VALIDATION.comment.max,
      `Comment must be at most ${VALIDATION.comment.max} characters`,
    ),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
