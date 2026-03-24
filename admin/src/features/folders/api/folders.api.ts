import { axiosInstance } from '@/shared/api/axios.instance';
import type { Folder } from '../types/folder.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const foldersApi = {
  getFolders: async (): Promise<Folder[]> => {
    const response = await axiosInstance.get<StandardResponse<Folder[]>>('/api/folders/admin/all');
    return response.data.data;
  },
  deleteFolder: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/folders/admin/${id}`);
  },
};

