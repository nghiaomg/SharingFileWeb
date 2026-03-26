import { axiosInstance } from '@/shared/api/axios.instance';
import type { Folder, FolderFile } from '../types/folder.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const foldersApi = {
  getFolders: async (): Promise<Folder[]> => {
    const response = await axiosInstance.get<StandardResponse<Folder[]>>('/api/folders/all');
    return response.data.data;
  },
  getFolderFiles: async (folderId: string): Promise<FolderFile[]> => {
    const response = await axiosInstance.get<StandardResponse<FolderFile[]>>(`/api/folders/${folderId}/files`);
    return response.data.data;
  },
  deleteFolder: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/folders/${id}/permanent`);
  },
};


