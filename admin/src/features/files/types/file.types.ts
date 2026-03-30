export interface StorageFile {
  id: string;
  name: string;
  type: string;
  size: number;
  ownerId: string;
  folderId?: string | null;
  storedPath?: string;
  createdAt: string;
  accessMode: 'PRIVATE' | 'PUBLIC' | 'RESTRICTED';
  isDeleted: boolean;
  isPublic?: boolean;
  sharedEmails?: string[];
  shareExpiresAt?: string | null;
}

export interface UploadStatus {
  uploadedChunks: number[];
}

export interface DownloadUrl {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}
