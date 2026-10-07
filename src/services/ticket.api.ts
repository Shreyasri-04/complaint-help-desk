import { httpClient } from '@/api/httpClient';
import { unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
import { toPaginatedResponse } from '@/types/api';
import type { BackendPage, PageRequest, PaginatedResponse } from '@/types/api';
import type {
  Comment,
  CommentPayload,
  Ticket,
  TicketFilters,
  TicketPayload,
  TicketPriority,
  TicketStatus,
} from '@/types/ticket';

/** Wire shapes inside the backend's ApiResponse envelope. */
export interface BackendTicket {
  id: number;
  subject: string;
  description?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  createdDate?: string | null;
  slaDeadline?: string | null;
  breached?: boolean | null;
  categoryId: number;
  categoryName?: string | null;
  createdByUsername?: string | null;
}

interface BackendComment {
  id: number;
  message: string;
  ticketId: number;
  createdByUsername?: string | null;
  createdAt?: string | null;
}

export function toTicket(raw: BackendTicket): Ticket {
  return {
    id: raw.id,
    subject: raw.subject,
    description: raw.description ?? undefined,
    priority: raw.priority,
    categoryId: raw.categoryId,
    categoryName: raw.categoryName ?? undefined,
    status: raw.status,
    username: raw.createdByUsername ?? undefined,
    createdBy: raw.createdByUsername ?? undefined,
    createdDate: raw.createdDate ?? undefined,
    slaDeadline: raw.slaDeadline ?? undefined,
    breached: raw.breached ?? undefined,
  };
}

function toComment(raw: BackendComment): Comment {
  return {
    id: raw.id,
    ticketId: raw.ticketId,
    author: raw.createdByUsername ?? undefined,
    message: raw.message,
    createdDate: raw.createdAt ?? undefined,
  };
}

function ticketParams(request?: TicketListRequest): Record<string, string> {
  const params: Record<string, string> = {};
  if (request?.status) {
    params.status = request.status;
  }
  if (request?.priority) {
    params.priority = request.priority;
  }
  if (request != null) {
    params.page = String(request.page);
    params.size = String(request.size);
  }
  return params;
}

/** Paginated ticket query: filters plus the backend 0-based page. */
export interface TicketListRequest extends TicketFilters, PageRequest {}

function toTicketPage(raw: BackendPage<BackendTicket>): PaginatedResponse<Ticket> {
  const page = toPaginatedResponse(raw);
  return { ...page, content: page.content.map(toTicket) };
}

export const ticketService = {
  /** Server-side paginated list (`GET /api/tickets?page=&size=`). */
  list(request: TicketListRequest): Promise<PaginatedResponse<Ticket>> {
    return httpClient
      .get<ApiResponse<BackendPage<BackendTicket>>>('/api/tickets', {
        params: ticketParams(request),
      })
      .then((res) => toTicketPage(unwrapEnvelope(res)));
  },

  /** Server-side paginated assigned-tickets list (`GET /api/tickets/manager`). */
  getManagerTickets(request: TicketListRequest): Promise<PaginatedResponse<Ticket>> {
    return httpClient
      .get<ApiResponse<BackendPage<BackendTicket>>>('/api/tickets/manager', {
        params: ticketParams(request),
      })
      .then((res) => toTicketPage(unwrapEnvelope(res)));
  },

  getById(id: number): Promise<Ticket> {
    return httpClient
      .get<ApiResponse<BackendTicket>>(`/api/tickets/${id}`)
      .then((res) => toTicket(unwrapEnvelope(res)));
  },

  approveTicket(id: number): Promise<Ticket> {
    return httpClient
      .put<ApiResponse<BackendTicket>>(`/api/tickets/${id}/approve`)
      .then((res) => toTicket(unwrapEnvelope(res)));
  },

  rejectTicket(id: number): Promise<Ticket> {
    return httpClient
      .put<ApiResponse<BackendTicket>>(`/api/tickets/${id}/reject`)
      .then((res) => toTicket(unwrapEnvelope(res)));
  },

  getComments(ticketId: number): Promise<Comment[]> {
    return httpClient
      .get<ApiResponse<BackendComment[]>>(`/api/tickets/${ticketId}/comments`)
      .then((res) => unwrapEnvelope(res).map(toComment));
  },

  addComment(ticketId: number, message: string): Promise<Comment> {
    const payload: CommentPayload = { message };
    return httpClient
      .post<ApiResponse<BackendComment>>(`/api/tickets/${ticketId}/comments`, payload)
      .then((res) => toComment(unwrapEnvelope(res)));
  },

  create(payload: TicketPayload): Promise<Ticket> {
    return httpClient
      .post<ApiResponse<BackendTicket>>('/api/tickets', payload)
      .then((res) => toTicket(unwrapEnvelope(res)));
  },

  update(id: number, payload: TicketPayload): Promise<Ticket> {
    return httpClient
      .put<ApiResponse<BackendTicket>>(`/api/tickets/${id}`, payload)
      .then((res) => toTicket(unwrapEnvelope(res)));
  },

  delete(id: number): Promise<void> {
    return httpClient
      .delete<ApiResponse<unknown>>(`/api/tickets/${id}`)
      .then(() => undefined);
  },
};
