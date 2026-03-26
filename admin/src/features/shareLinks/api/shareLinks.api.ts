import { axiosInstance } from '@/shared/api/axios.instance';
import type { ShareLink } from '../types/shareLink.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const shareLinksApi = {
  getShareLinks: async (): Promise<ShareLink[]> => {
    const response = await axiosInstance.get<StandardResponse<ShareLink[]>>('/api/share/links');
    return response.data.data;
  },
  deleteShareLink: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/share/links/${id}`);
  },
};

