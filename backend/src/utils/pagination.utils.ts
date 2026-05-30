// ─────────────────────────────────────────────────
// Pagination Utilities
// ─────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parse and validate pagination query parameters
 */
export const parsePagination = (
  pageStr?: string,
  limitStr?: string
): PaginationParams => {
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitStr || '10', 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination metadata for API responses
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Format API success response
 */
export const successResponse = <T>(
  data: T,
  message = 'Success',
  meta?: unknown
) => ({
  success: true,
  message,
  data,
  ...(meta ? { meta } : {}),
});

/**
 * Format API error response
 */
export const errorResponse = (message: string, errors?: unknown) => ({
  success: false,
  message,
  ...(errors ? { errors } : {}),
});
