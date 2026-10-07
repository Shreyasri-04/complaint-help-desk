export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CLOSED: 'CLOSED',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority = (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

export interface Comment {
  id?: number;
  ticketId?: number;
  author?: string;
  message: string;
  createdDate?: string;
}

export interface CommentPayload {
  message: string;
}

export interface Ticket {
  id?: number;
  subject: string;
  description?: string;
  priority: TicketPriority;
  categoryId: number;
  categoryName?: string;
  status?: TicketStatus;
  username?: string;
  createdBy?: string;
  createdDate?: string;
  slaDeadline?: string;
  breached?: boolean;
  comments?: Comment[];
}

export interface TicketPayload {
  subject: string;
  description: string;
  priority: TicketPriority;
  categoryId: number;
  status?: TicketStatus;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
}