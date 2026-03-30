import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '../api/folders.api';
import { axiosInstance } from '@/shared/api/axios.instance';
import { message } from 'antd';

export const foldersKeys = {
  all: ['folders'] as const,
  lists: () => [...foldersKeys.all, 'list'] as const,
  files: (folderId: string) => [...foldersKeys.all, 'files', folderId] as const,
};

export const useFoldersQuery = () => {
  return useQuery({
    queryKey: foldersKeys.lists(),
    queryFn: foldersApi.getFolders,
  });
};

export const useFolderFilesQuery = (folderId: string | null) => {
  return useQuery({
    queryKey: folderId ? foldersKeys.files(folderId) : [],
    queryFn: () => folderId ? foldersApi.getFolderFiles(folderId) : Promise.resolve([]),
    enabled: !!folderId,
  });
};

export const useCreateFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; parentId: string | null }) => {
      const response = await axiosInstance.post('/api/folders', data);
      return response.data;
    },
    onSuccess: () => {
      message.success('Tạo thư mục thành công!');
      queryClient.invalidateQueries({ queryKey: foldersKeys.all });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi khi tạo thư mục');
    },
  });
};

export const useUpdateFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      const response = await axiosInstance.put(`/api/folders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      message.success('Cập nhật thư mục thành công!');
      queryClient.invalidateQueries({ queryKey: foldersKeys.all });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi cập nhật thư mục');
    },
  });
};

export const useDeleteFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => foldersApi.deleteFolder(id),
    onSuccess: () => {
      message.success('Xóa thư mục thành công!');
      queryClient.invalidateQueries({ queryKey: foldersKeys.all });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi xóa thư mục');
    },
  });
};
