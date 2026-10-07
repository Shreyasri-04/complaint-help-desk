import { httpClient } from '@/api/httpClient';
import { fetchAllPages, unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
import { toPaginatedResponse } from '@/types/api';
import type { BackendPage, PageRequest, PaginatedResponse } from '@/types/api';
import { toTicket } from '@/services/ticket.api';
import type { BackendTicket } from '@/services/ticket.api';
import type { Category, CategoryPayload } from '@/types/category';
import type { Ticket } from '@/types/ticket';

export const categoryService = {
  /** Server-side paginated categories (`GET /api/categories?page=&size=`). */
  listPage(request: PageRequest): Promise<PaginatedResponse<Category>> {
    return httpClient
      .get<ApiResponse<BackendPage<Category>>>('/api/categories', {
        params: { page: String(request.page), size: String(request.size) },
      })
      .then((res) => toPaginatedResponse(unwrapEnvelope(res)));
  },

  /**
   * Complete category list (form dropdowns, dashboard counts). Categories
   * are a small dataset; tables must use `listPage` instead.
   */
  list(): Promise<Category[]> {
    return fetchAllPages((request) => categoryService.listPage(request));
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
    return fetchAllPages(async (request) => {
      const raw = await httpClient
        .get<ApiResponse<BackendPage<BackendTicket>>>(
          `/api/categories/${id}/tickets`,
          { params: { page: String(request.page), size: String(request.size) } },
        )
        .then((res) => toPaginatedResponse(unwrapEnvelope(res)));
      return { ...raw, content: raw.content.map(toTicket) };
    });
  },
};
