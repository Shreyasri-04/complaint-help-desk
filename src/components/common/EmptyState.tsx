import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      {icon ? <Box sx={{ mb: 2, color: 'text.disabled' }}>{icon}</Box> : null}
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}