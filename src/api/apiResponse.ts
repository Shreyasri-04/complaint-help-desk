import type { AxiosResponse } from 'axios';

/**
 * Envelope the backend wraps every payload in:
 * { "data": T, "message": "...", "status": 200 }
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export function unwrapEnvelope<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}
