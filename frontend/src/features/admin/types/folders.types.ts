export interface AdminFolder {
  id: string;
  name: string;
  ownerId: string;
  parentId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaginatedFoldersResponse {
  content: AdminFolder[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}
