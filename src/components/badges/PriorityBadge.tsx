import { Chip } from '@mui/material';
import { TICKET_PRIORITY_META } from '@/utils/constants';
import type { TicketPriority } from '@/types/ticket';

export function PriorityBadge({ priority }: { priority?: TicketPriority }) {
  if (!priority) {
    return <Chip label="—" size="small" />;
  }
  const meta = TICKET_PRIORITY_META[priority];
  return <Chip label={meta.label} color={meta.color} size="small" variant="outlined" />;
}