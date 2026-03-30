import { axiosInstance } from '@/shared/api/axios.instance';
import type { TrashItems } from '../types/trash.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const trashApi = {
  getTrashItems: async (): Promise<TrashItems> => {
    const response = await axiosInstance.get<StandardResponse<TrashItems>>('/api/trash');
    return response.data.data;
  },
  restoreItem: async (type: 'file' | 'folder', id: string): Promise<void> => {
    await axiosInstance.put(`/api/trash/restore/${type}/${id}`);
  },
  deletePermanent: async (type: 'file' | 'folder', id: string): Promise<void> => {
    await axiosInstance.delete(`/api/trash/permanent/${type}/${id}`);
  },
  emptyTrash: async (): Promise<void> => {
    await axiosInstance.delete('/api/trash/empty');
  },
};
