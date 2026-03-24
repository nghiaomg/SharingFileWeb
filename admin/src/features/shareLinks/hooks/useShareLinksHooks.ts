import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shareLinksApi } from '../api/shareLinks.api';
import { message } from 'antd';

export const shareLinksKeys = {
  all: ['shareLinks'] as const,
  lists: () => [...shareLinksKeys.all, 'list'] as const,
};

export const useShareLinksQuery = () => {
  return useQuery({
    queryKey: shareLinksKeys.lists(),
    queryFn: shareLinksApi.getShareLinks,
  });
};

export const useDeleteShareLinkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shareLinksApi.deleteShareLink(id),
    onSuccess: () => {
      message.success('Thu hồi và xóa liên kết chia sẻ thành công!');
      queryClient.invalidateQueries({ queryKey: shareLinksKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi thu hồi liên kết');
    },
  });
};
