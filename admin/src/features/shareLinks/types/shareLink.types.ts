export interface ShareLink {
  id: string;
  token: string;
  fullUrl?: string;
  fileId: string;
  fileName?: string;
  permission: 'VIEW' | 'DOWNLOAD';
  password?: string | null;
  hasPassword: boolean;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
  isRevoked: boolean;
}

export interface ShareAccess {
  id: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  ownerEmail: string;
  recipientEmail: string;
  permission: 'VIEW' | 'DOWNLOAD';
  createdAt: string;
}
