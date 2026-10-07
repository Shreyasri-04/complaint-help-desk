import { Box, Chip } from '@mui/material';
import { formatDateTime } from '@/utils/format';

interface SlaBadgeProps {
  deadline?: string;
  breached?: boolean;
}

export function SlaBadge({ deadline, breached = false }: SlaBadgeProps) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {breached ? (
        <Chip label="BREACHED" color="error" size="small" sx={{ fontWeight: 700 }} />
      ) : (
        <Chip label="OK" color="success" size="small" sx={{ fontWeight: 700 }} />
      )}
      <Box component="span" sx={{ typography: 'body2' }}>
        {formatDateTime(deadline)}
      </Box>
    </Box>
  );
}