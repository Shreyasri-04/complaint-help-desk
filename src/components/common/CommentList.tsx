import { Stack, Typography } from '@mui/material';
import { CommentItem } from '@/components/common/CommentItem';
import { MESSAGES } from '@/utils/messages';
import type { Comment } from '@/types/ticket';

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        {MESSAGES.comment.empty}
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      {comments.map((comment, index) => (
        <CommentItem
          key={comment.id ?? `${comment.createdDate ?? 'comment'}-${index}`}
          comment={comment}
        />
      ))}
    </Stack>
  );
}
