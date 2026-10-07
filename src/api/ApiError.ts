import axios from 'axios';
import type { ApiErrorPayload, FieldErrors } from '@/types/api';

export const GENERAL_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Please check your connection and try again.';

function toFieldErrors(value: unknown): FieldErrors {
  // The backend sends `"fieldErrors": null` when there are none — coerce any
  // non-object payload to {} so `hasFieldErrors` can never throw.
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as FieldErrors;
  }
  return {};
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  static from(error: unknown): ApiError {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      // No response at all: backend unreachable, network failure, or timeout.
      // Surface a friendly message instead of axios's raw "Network Error".
      if (!error.response) {
        return new ApiError(NETWORK_ERROR_MESSAGE, 0);
      }
      const payload = error.response.data;
      const message =
        typeof payload?.message === 'string' && payload.message
          ? payload.message
          : (error.message || GENERAL_ERROR_MESSAGE);
      return new ApiError(
        message,
        error.response.status ?? 0,
        toFieldErrors(payload?.fieldErrors),
      );
    }
    if (error instanceof Error) {
      return new ApiError(error.message || GENERAL_ERROR_MESSAGE, 0);
    }
    return new ApiError(GENERAL_ERROR_MESSAGE, 0);
  }

  get hasFieldErrors(): boolean {
    return Object.keys(this.fieldErrors).length > 0;
  }
}