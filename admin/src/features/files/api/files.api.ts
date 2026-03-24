import { axiosInstance } from '@/shared/api/axios.instance';
import type { StorageFile } from '../types/file.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const filesApi = {
  getFiles: async (): Promise<StorageFile[]> => {
    const response = await axiosInstance.get<StandardResponse<StorageFile[]>>('/api/files/admin/all');
    return response.data.data;
  },
  deleteFile: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/files/admin/${id}`);
  },
};

