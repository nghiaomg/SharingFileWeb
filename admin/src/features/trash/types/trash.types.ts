export interface TrashItem {
  id: string;
  name: string;
  type: 'file' | 'folder'; 
  size?: number;
  deletedAt: string;
}

export interface TrashResponse {
  files: TrashItem[]; 
  folders: TrashItem[]; 
}
