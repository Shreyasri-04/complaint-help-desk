import { httpClient } from '@/api/httpClient';
import { unwrapEnvelope } from '@/api/apiResponse';
import type { ApiResponse } from '@/api/apiResponse';
import type { AuthCredentials, AuthResponse, RegisterResponse } from '@/types/auth';

export const authService = {
  login(credentials: AuthCredentials): Promise<AuthResponse> {
    return httpClient
      .post<ApiResponse<AuthResponse>>('/auth/login', credentials)
      .then(unwrapEnvelope);
  },

  register(credentials: AuthCredentials): Promise<RegisterResponse> {
    return httpClient
      .post<ApiResponse<RegisterResponse>>('/auth/register', credentials)
      .then(unwrapEnvelope);
  },
};
