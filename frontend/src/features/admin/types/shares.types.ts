export interface AdminShareLink {
  id: string;
  token: string;
  fileId: string;
  ownerId: string;
  permission: string;
  expiresAt: string | null;
  maxViews: number | null;
  viewCount: number;
  isRevoked: boolean;
  createdAt: string;
}

export interface AdminPaginatedSharesResponse {
  content: AdminShareLink[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}
