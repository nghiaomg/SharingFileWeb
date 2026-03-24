export interface ShareLink {
  id: string;
  token: string;
  fileId: string;
  permission: string;
  expiresAt: string;
  createdAt: string;
  createdBy: string;
  isCustomUrl: boolean;
  isRevoked: boolean;
}
