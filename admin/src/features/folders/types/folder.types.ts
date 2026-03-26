export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
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
