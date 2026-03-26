import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '../api/folders.api';
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

export const useDeleteFolderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => foldersApi.deleteFolder(id),
    onSuccess: () => {
      message.success('Xóa thư mục vĩnh viễn thành công!');
      queryClient.invalidateQueries({ queryKey: foldersKeys.all });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      message.error(err.response?.data?.message || 'Lỗi xóa thư mục');
    },
  });
};
