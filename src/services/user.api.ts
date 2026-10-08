import { httpClient } from '@/api/httpClient';
import { fetchAllPages, unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
import { toPaginatedResponse } from '@/types/api';
import type { BackendPage, PageRequest, PaginatedResponse } from '@/types/api';
import type { User } from '@/types/user';

export const userService = {

  /**
   * Complete user list — used ONLY for the admin dashboard enabled/disabled
   * counts until the backend provides counts or an `enabled` filter.
   * Tables must use `listPage` below.
   */
  list(): Promise<User[]> {
    return fetchAllPages((request) => userService.listPage(request));
  },

  /** Server-side paginated users (`GET /api/users?page=&size=`). */
  listPage(request: PageRequest): Promise<PaginatedResponse<User>> {
    return httpClient
      .get<ApiResponse<BackendPage<User>>>('/api/users', {
        params: { page: String(request.page), size: String(request.size) },
      })
      .then((res) => toPaginatedResponse(unwrapEnvelope(res)));
  },


  /**
   * Manager dropdown options. Tolerates both a bare array and a paginated
   * payload, since list endpoints now page by default.
   */
  listManagers(): Promise<User[]> {
    return httpClient
      .get<ApiResponse<User[] | BackendPage<User>>>('/api/users/managers', {
        params: { page: '0', size: '100' },
      })
      .then((res) => {
        const data = unwrapEnvelope(res);
        return Array.isArray(data) ? data : toPaginatedResponse(data).content;
      });
  },


  async getUsersByManager(managerId: number): Promise<User[]> {
    const users = await userService.list();
    return users.filter((user) => user.managerId === managerId);
  },

  /**
   * Enables/disables a user account (ADMIN only, backend-enforced).
   * Backend contract: `PATCH /api/users/{id}/status` with `{ enabled }`.
   */
  setEnabled(id: number, enabled: boolean): Promise<User> {
    return httpClient
      .patch<ApiResponse<User>>(`/api/users/${id}/status`, { enabled })
      .then(unwrapEnvelope);
  },

  /**
   * Assigns a user to a manager (ADMIN only, backend-enforced).
   * Pass `managerId: null` to unassign.
   */
  assignManager(id: number, managerId: number | null): Promise<User> {
    return httpClient
      .put<ApiResponse<User>>(`/api/users/${id}/manager`, { managerId })
      .then(unwrapEnvelope);
  },
};
