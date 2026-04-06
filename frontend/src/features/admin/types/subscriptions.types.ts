export interface AdminSubscriptionPlan {
  id: string;
  name: string;
  maxStorageBytes: number;
  maxFileSizeBytes: number;
  price: number;
  durationDays: number;
  isActive: boolean;
  features: string[];
  sortOrder: number;
  description: string;
}

export interface PaginationResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
