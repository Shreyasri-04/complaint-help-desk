export interface FieldErrors {
  [field: string]: string;
}

export interface ApiErrorPayload {
  timestamp?: string;
  status: number;
  error?: string;
  message: string;
  fieldErrors?: FieldErrors;
}

/** Backend pagination request (0-based page, e.g. `?page=0&size=10`). */
export interface PageRequest {
  page: number;
  size: number;
}

/**
 * Paginated payload inside the backend envelope:
 * `{ "data": { "content": [], "page": 0, "size": 10,
 * "totalElements": 25, "totalPages": 3 }, ... }`.
 */
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Raw page wire shape (tolerates Spring's `number` alias for `page`). */
export interface BackendPage<T> {
  content?: T[] | null;
  page?: number | null;
  number?: number | null;
  size?: number | null;
  totalElements?: number | null;
  totalPages?: number | null;
}

/** Normalizes the raw page payload; never throws on missing fields. */
export function toPaginatedResponse<T>(raw: BackendPage<T>): PaginatedResponse<T> {
  return {
    content: Array.isArray(raw.content) ? raw.content : [],
    page: raw.page ?? raw.number ?? 0,
    size: raw.size ?? 0,
    totalElements: raw.totalElements ?? 0,
    totalPages: raw.totalPages ?? 0,
  };
}