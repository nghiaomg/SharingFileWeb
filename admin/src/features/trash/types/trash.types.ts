// Re-export types from other modules
export type { StorageFile } from '@/features/files/types/file.types';
export type { Folder } from '@/features/folders/types/folder.types';

// Local types
export interface TrashItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  deletedAt?: string;
  daysUntilPermanentDeletion?: number;
  ownerId?: string;
}

export interface TrashItems {
  files: TrashItem[];
  folders: TrashItem[];
  totalItems: number;
}
