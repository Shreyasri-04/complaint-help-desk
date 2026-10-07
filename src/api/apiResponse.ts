import type { AxiosResponse } from 'axios';
import type { PageRequest, PaginatedResponse } from '@/types/api';

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

/**
 * Collects every page of a paginated endpoint (follows `totalPages`).
 * Use ONLY for small datasets that must be complete (form dropdowns,
 * dashboard counts) — tables must use single-page fetches instead.
 */
export async function fetchAllPages<T>(
  fetchPage: (request: PageRequest) => Promise<PaginatedResponse<T>>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 0;
  let totalPages = Number.POSITIVE_INFINITY;
  while (page < totalPages) {
    const result = await fetchPage({ page, size: 50 });
    all.push(...result.content);
    totalPages = result.totalPages;
    page += 1;
  }
  return all;
}
