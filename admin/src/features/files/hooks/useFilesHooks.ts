import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../api/files.api';
import { message } from 'antd';

export const filesKeys = {
  all: ['files'] as const,
  lists: () => [...filesKeys.all, 'list'] as const,
};

export const useFilesQuery = () => {
  return useQuery({
    queryKey: filesKeys.lists(),
    queryFn: filesApi.getFiles,
  });
};

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => filesApi.deleteFile(id),
    onSuccess: () => {
      message.success('Xóa file vĩnh viễn thành công!');
      queryClient.invalidateQueries({ queryKey: filesKeys.lists() });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi xóa file');
    },
  });
};
