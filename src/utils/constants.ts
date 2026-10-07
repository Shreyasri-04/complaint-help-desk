import type { ChipProps } from '@mui/material/Chip';
import { TICKET_PRIORITY, TICKET_STATUS } from '@/types/ticket';
import type { TicketPriority, TicketStatus } from '@/types/ticket';

type ChipColor = NonNullable<ChipProps['color']>;

export const ALL_STATUSES: TicketStatus[] = Object.values(TICKET_STATUS);
export const ALL_PRIORITIES: TicketPriority[] = Object.values(TICKET_PRIORITY);

/** Backend page size for all paginated tables (backend pages are 0-based). */
export const DEFAULT_PAGE_SIZE = 10;

export const TICKET_STATUS_META: Record<TicketStatus, { label: string; color: ChipColor }> = {
  [TICKET_STATUS.OPEN]: { label: 'Open', color: 'info' },
  [TICKET_STATUS.IN_PROGRESS]: { label: 'In Progress', color: 'warning' },
  [TICKET_STATUS.APPROVED]: { label: 'Approved', color: 'success' },
  [TICKET_STATUS.REJECTED]: { label: 'Rejected', color: 'error' },
  [TICKET_STATUS.CLOSED]: { label: 'Closed', color: 'success' },
};

export const TICKET_PRIORITY_META: Record<TicketPriority, { label: string; color: ChipColor }> = {
  [TICKET_PRIORITY.LOW]: { label: 'Low', color: 'default' },
  [TICKET_PRIORITY.MEDIUM]: { label: 'Medium', color: 'warning' },
  [TICKET_PRIORITY.HIGH]: { label: 'High', color: 'error' },
};

export const STATUS_TRANSITIONS: Partial<Record<TicketStatus, TicketStatus>> = {
  [TICKET_STATUS.OPEN]: TICKET_STATUS.IN_PROGRESS,
  [TICKET_STATUS.IN_PROGRESS]: TICKET_STATUS.CLOSED,
};

export const VALIDATION = {
  username: { min: 3, max: 50 },
  password: { min: 6, max: 100 },
  strictUsername: { min: 3, max: 20 },
  strictPassword: { min: 8, max: 32 },
  categoryName: { max: 100 },
  slaHours: { min: 1, max: 8760 },
  subject: { max: 255 },
  description: { max: 4000 },
  comment: { min: 1, max: 1000 },
} as const;