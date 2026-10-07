import { useState } from 'react';
import type { FormEvent } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { SendOutlined as SendIcon } from '@mui/icons-material';
import { CommentList } from '@/components/common/CommentList';
import { commentSchema } from '@/schemas/commentSchema';
import { VALIDATION } from '@/utils/constants';
import { MESSAGES } from '@/utils/messages';
import type { Comment } from '@/types/ticket';

interface CommentBoxProps {
  comments: Comment[];
  onAddComment: (message: string) => Promise<boolean>;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

export function CommentBox({
  comments,
  onAddComment,
  loading = false,
  disabled = false,
  placeholder = MESSAGES.comment.placeholder,
  label = 'Add a comment',
}: CommentBoxProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isDisabled = disabled || loading;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isDisabled) {
      return;
    }

    const parsed = commentSchema.safeParse({ message });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.message?.[0] ?? 'Invalid comment');
      return;
    }

    setError('');
    const added = await onAddComment(parsed.data.message);
    if (added) {
      setMessage('');
    }
  };

  return (
    <Stack spacing={2.5}>
      <CommentList comments={comments} />

      <Stack component="form" onSubmit={handleSubmit} spacing={1.5} noValidate>
        <TextField
          label={label}
          placeholder={placeholder}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (error) {
              setError('');
            }
          }}
          fullWidth
          multiline
          minRows={2}
          disabled={isDisabled}
          error={Boolean(error)}
          helperText={error}
          slotProps={{ htmlInput: { maxLength: VALIDATION.comment.max } }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={isDisabled || message.trim().length === 0}
          >
            {loading ? 'Posting…' : 'Post comment'}
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
}
