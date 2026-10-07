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

/** Which backend ticket list backs a dashboard section. */
export type TicketSource = 'own' | 'manager' | 'all';

function fetchFor(source: TicketSource) {
  return source === 'manager' ? ticketService.getManagerTickets : ticketService.list;
}

/** Counts from page metadata only (`size: 1`) — never fetches the dataset. */
async function countByStatus(source: TicketSource, status?: TicketStatus): Promise<number> {
  const page = await fetchFor(source)({
    page: 0,
    size: 1,
    ...(status ? { status } : {}),
  });
  return page.totalElements;
}

/** Derives summary counts from a ticket list (pure, reusable). */
export function summarizeTickets(tickets: Ticket[]): DashboardStats {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === TICKET_STATUS.OPEN).length,
    approved: tickets.filter((ticket) => ticket.status === TICKET_STATUS.APPROVED).length,
    rejected: tickets.filter((ticket) => ticket.status === TICKET_STATUS.REJECTED).length,
  };
}

export const dashboardService = {
  /**
   * Dashboard stats from page metadata (four `size: 1` requests) — the full
   * ticket dataset is never transferred. The Bearer token is attached
   * automatically by httpClient's request interceptor; an expired/invalid
   * token triggers the 401 response interceptor (logout + redirect to
   * /login), so callers only handle domain errors via ApiError.
   */
  async getTicketStats(source: TicketSource): Promise<DashboardStats> {
    const [total, open, approved, rejected] = await Promise.all([
      countByStatus(source),
      countByStatus(source, TICKET_STATUS.OPEN),
      countByStatus(source, TICKET_STATUS.APPROVED),
      countByStatus(source, TICKET_STATUS.REJECTED),
    ]);
    return { total, open, approved, rejected };
  },

  /** Most recent tickets: first page only (used for dashboard previews). */
  async getRecentTickets(source: TicketSource, size: number): Promise<Ticket[]> {
    const page = await fetchFor(source)({ page: 0, size });
    return page.content;
  },

  /**
   * Manager dashboard data: stats (metadata) plus a recent-tickets preview.
   * Tables elsewhere fetch their own pages via `ticketService`.
   */
  async getDashboardData(): Promise<DashboardData> {
    const [stats, tickets] = await Promise.all([
      dashboardService.getTicketStats('manager'),
      dashboardService.getRecentTickets('manager', 5),
    ]);
    return { tickets, stats };
  },
};
