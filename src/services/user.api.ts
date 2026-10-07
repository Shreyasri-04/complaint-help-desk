import { httpClient } from '@/api/httpClient';
import { unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
import type { User } from '@/types/user';

export const userService = {

  list(): Promise<User[]> {
    return httpClient.get<ApiResponse<User[]>>('/api/users').then(unwrapEnvelope);
  },


  listManagers(): Promise<User[]> {
    return httpClient.get<ApiResponse<User[]>>('/api/users/managers').then(unwrapEnvelope);
  },


  async getUsersByManager(managerId: number): Promise<User[]> {
    const users = await userService.list();
    return users.filter((user) => user.managerId === managerId);
  },

  /**
   * Enables/disables a user account (ADMIN only, backend-enforced).
   * Uses the existing `/api/users` resource with per-user status actions.
   */
  setEnabled(id: number, enabled: boolean): Promise<User> {
    const action = enabled ? 'enable' : 'disable';
    return httpClient
      .put<ApiResponse<User>>(`/api/users/${id}/${action}`)
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
