import { httpClient } from '@/api/httpClient';
import { unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
import { toTicket } from '@/services/ticket.api';
import type { BackendTicket } from '@/services/ticket.api';
import type { Category, CategoryPayload } from '@/types/category';
import type { Ticket } from '@/types/ticket';

export const categoryService = {
  list(): Promise<Category[]> {
    return httpClient
      .get<ApiResponse<Category[]>>('/api/categories')
      .then(unwrapEnvelope);
  },

  getById(id: number): Promise<Category> {
    return httpClient
      .get<ApiResponse<Category>>(`/api/categories/${id}`)
      .then(unwrapEnvelope);
  },

  create(payload: CategoryPayload): Promise<Category> {
    return httpClient
      .post<ApiResponse<Category>>('/api/categories', payload)
      .then(unwrapEnvelope);
  },

  update(id: number, payload: CategoryPayload): Promise<Category> {
    return httpClient
      .put<ApiResponse<Category>>(`/api/categories/${id}`, payload)
      .then(unwrapEnvelope);
  },

  delete(id: number): Promise<void> {
    return httpClient
      .delete<ApiResponse<unknown>>(`/api/categories/${id}`)
      .then(() => undefined);
  },

  getTickets(id: number): Promise<Ticket[]> {
    return httpClient
      .get<ApiResponse<BackendTicket[]>>(`/api/categories/${id}/tickets`)
      .then((res) => unwrapEnvelope(res).map(toTicket));
  },
};
