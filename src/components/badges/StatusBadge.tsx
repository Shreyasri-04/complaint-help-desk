import { Chip } from '@mui/material';
import { TICKET_STATUS_META } from '@/utils/constants';
import type { TicketStatus } from '@/types/ticket';

export function StatusBadge({ status }: { status?: TicketStatus }) {
  if (!status) {
    return <Chip label="—" size="small" />;
  }
  const meta = TICKET_STATUS_META[status];
  return <Chip label={meta.label} color={meta.color} size="small" />;
}