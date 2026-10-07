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