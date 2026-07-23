/**
 * Standard API response envelope used across all services
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Paginated response wrapper
 */
export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}
