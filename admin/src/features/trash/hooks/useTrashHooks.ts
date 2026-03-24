import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trashApi } from '../api/trash.api';
import { message } from 'antd';

export const trashKeys = {
  all: ['trash'] as const,
  lists: () => [...trashKeys.all, 'list'] as const,
};

export const useTrashQuery = () => {
  return useQuery({
    queryKey: trashKeys.lists(),
    queryFn: trashApi.getTrashItems,
  });
};

export const useRestoreItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: 'file' | 'folder'; id: string }) => trashApi.restoreItem(type, id),
    onSuccess: () => {
      message.success('Khôi phục thành công!');
      queryClient.invalidateQueries({ queryKey: trashKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi khôi phục');
    },
  });
};

export const useDeletePermanentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: 'file' | 'folder'; id: string }) => trashApi.deletePermanent(type, id),
    onSuccess: () => {
      message.success('Xóa vĩnh viễn thành công!');
      queryClient.invalidateQueries({ queryKey: trashKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi xóa vĩnh viễn');
    },
  });
};

export const useEmptyTrashMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => trashApi.emptyTrash(),
    onSuccess: () => {
      message.success('Dọn dẹp thùng rác thành công!');
      queryClient.invalidateQueries({ queryKey: trashKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi dọn rác');
    },
  });
};
