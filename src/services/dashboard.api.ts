import { ticketService } from '@/services/ticket.api';
import { TICKET_STATUS } from '@/types/ticket';
import type { Ticket, TicketStatus } from '@/types/ticket';

export interface DashboardStats {
  total: number;
  open: number;
  approved: number;
  rejected: number;
}

export interface DashboardData {
  tickets: Ticket[];
  stats: DashboardStats;
}

function countByStatus(tickets: Ticket[], status: TicketStatus): number {
  return tickets.filter((ticket) => ticket.status === status).length;
}

/** Derives summary counts from a ticket list (pure, reusable). */
export function summarizeTickets(tickets: Ticket[]): DashboardStats {
  return {
    total: tickets.length,
    open: countByStatus(tickets, TICKET_STATUS.OPEN),
    approved: countByStatus(tickets, TICKET_STATUS.APPROVED),
    rejected: countByStatus(tickets, TICKET_STATUS.REJECTED),
  };
}

export const dashboardService = {
  /**
   * Protected dashboard fetch for managers: tickets raised by users under
   * them, plus summary counts. The Bearer token is attached automatically by
   * httpClient's request interceptor; an expired/invalid token triggers the
   * 401 response interceptor (logout + redirect to /login), so callers only
   * handle domain errors via ApiError.
   */
  async getDashboardData(): Promise<DashboardData> {
    const tickets = await ticketService.getManagerTickets();
    return { tickets, stats: summarizeTickets(tickets) };
  },
};
