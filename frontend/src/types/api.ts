/**
 * Global API types
 */
export interface ApiErrorResponse {
  message: string;
  status?: number;
}

/**
 * Extract error message from Axios error
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
): string {
  const err = error as { response?: { data?: { message?: string } } };
  return err?.response?.data?.message || fallback;
}
