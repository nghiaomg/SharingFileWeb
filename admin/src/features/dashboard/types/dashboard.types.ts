// Dashboard Types - Centralized Type Definitions
export interface StorageCategory {
  title: string;
  files: number;
  size: number;
}

export interface RecentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  category: string;
}

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

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  itemCount?: number;
  totalSize?: number;
}

export interface FolderFile {
  id: string;
  name: string;
  type: string;
  size: number;
  ownerId: string;
  folderId: string;
  createdAt: string;
}

export interface Role {
  id?: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  subscriptionPlan: string;
  maxStorage: number;
  maxFileSize: number;
  storageUsed?: number;
  createdAt: string;
  lastLogin?: string | null;
  twoFactorEnabled: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  subscriptionPlan: string;
  maxStorage: number;
  maxFileSize: number;
  createdAt: string;
  lastLogin?: string | null;
  twoFactorEnabled: boolean;
}

export interface StorageUsage {
  used: number;
  limit: number;
  percentUsed: number;
  subscriptionPlan: string;
}

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

export interface Notification {
  id: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface UnreadCount {
  count: number;
}

export interface TrashItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  deletedAt: string;
  daysUntilPermanentDeletion?: number;
  ownerId?: string;
}

export interface TrashItems {
  files: StorageFile[];
  folders: Folder[];
  totalItems: number;
}

export interface SubscriptionPlan {
  plan: string;
  maxStorage: number;
  maxFileSize: number;
  price: number;
  features: string[];
}
