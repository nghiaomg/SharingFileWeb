import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { axiosInstance } from '@/shared/api/axios.instance';
import type { UpdateUserRequest } from '../types/user.types';
import { message } from 'antd';

const USERS_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_KEYS.all, 'list'] as const,
  details: () => [...USERS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
};

export { USERS_KEYS as usersKeys };

export const useUsersQuery = () => {
  return useQuery({
    queryKey: USERS_KEYS.lists(),
    queryFn: usersApi.getUsers,
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => usersApi.updateUser(id, data),
    onSuccess: () => {
      message.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
    },
    onError: () => {
      message.error('Update failed');
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      message.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
    },
    onError: () => {
      message.error('Delete failed');
    },
  });
};

export const useUpgradeUserPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/api/users/${userId}`, {
        subscriptionPlan: 'PRO',
      });
    },
    onSuccess: () => {
      message.success('Plan upgraded successfully');
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
    },
    onError: () => {
      message.error('Upgrade failed');
    },
  });
};
