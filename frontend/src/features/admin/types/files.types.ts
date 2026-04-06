export interface AdminStorageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  isDeleted: boolean;
  isBanned?: boolean;
  folderId?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  b2FileId?: string;
  b2FileName?: string;
}

export interface AdminPaginatedFilesResponse {
  content: AdminStorageFile[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}
