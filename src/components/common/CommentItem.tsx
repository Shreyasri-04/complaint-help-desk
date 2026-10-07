import { Avatar, Box, Stack, Typography } from '@mui/material';
import { formatDateTime } from '@/utils/format';
import type { Comment } from '@/types/ticket';

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const author = comment.author ?? 'Unknown';
  const initial = author.charAt(0).toUpperCase();

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Avatar
        sx={{ width: 32, height: 32, fontSize: 14, fontWeight: 700, bgcolor: 'primary.main' }}
      >
        {initial}
      </Avatar>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'baseline', flexWrap: 'wrap', rowGap: 0.25 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(comment.createdDate)}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {comment.message}
        </Typography>
      </Box>
    </Stack>
  );
}
