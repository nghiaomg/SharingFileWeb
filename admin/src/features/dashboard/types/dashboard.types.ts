export interface StorageCategory {
  category: string;
  fileCount: number;
  totalSize: number;
}

export interface RecentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}
