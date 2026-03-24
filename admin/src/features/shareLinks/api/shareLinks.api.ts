import { axiosInstance } from '@/shared/api/axios.instance';
import type { ShareLink } from '../types/shareLink.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const shareLinksApi = {
  getShareLinks: async (): Promise<ShareLink[]> => {
    const response = await axiosInstance.get<StandardResponse<ShareLink[]>>('/api/share/admin/links');
    return response.data.data;
  },
  deleteShareLink: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/share/admin/links/${id}`);
  },
};

