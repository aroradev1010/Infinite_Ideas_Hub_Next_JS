// types/db.ts
/**
 * Generic API response shape used across all client fetchers and routes.
 * Keeps consistency between server and client.
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
  [key: string]: any;
}

