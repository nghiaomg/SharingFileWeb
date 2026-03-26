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
}
