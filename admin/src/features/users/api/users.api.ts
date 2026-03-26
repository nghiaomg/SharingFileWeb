import { axiosInstance } from '@/shared/api/axios.instance';
import type { User, UpdateUserRequest } from '../types/user.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get<StandardResponse<User[]>>('/api/users');
    return response.data.data;
  },
  getUser: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<StandardResponse<User>>(`/api/users/${id}`);
    return response.data.data;
  },
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await axiosInstance.put<StandardResponse<User>>(`/api/users/${id}`, data);
    return response.data.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/users/${id}`);
  },
};
