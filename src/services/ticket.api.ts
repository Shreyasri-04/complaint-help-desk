import { httpClient } from '@/api/httpClient';
import { unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
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

function ticketParams(filters?: TicketFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters?.status) {
    params.status = filters.status;
  }
  if (filters?.priority) {
    params.priority = filters.priority;
  }
  return params;
}

export const ticketService = {
  list(filters?: TicketFilters): Promise<Ticket[]> {
    return httpClient
      .get<ApiResponse<BackendTicket[]>>('/api/tickets', { params: ticketParams(filters) })
      .then((res) => unwrapEnvelope(res).map(toTicket));
  },

  getManagerTickets(filters?: TicketFilters): Promise<Ticket[]> {
    return httpClient
      .get<ApiResponse<BackendTicket[]>>('/api/tickets/manager', { params: ticketParams(filters) })
      .then((res) => unwrapEnvelope(res).map(toTicket));
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
