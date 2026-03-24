export interface StorageFile {
  id: string;
  name: string;
  type: string;
  size: number;
  ownerId: string;
  folderId?: string;
  storedPath: string;
  createdAt: string;
  accessMode: string;
  isDeleted: boolean;
}
