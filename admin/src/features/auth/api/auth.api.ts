import { axiosInstance } from '@/shared/api/axios.instance';
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '../types/auth.types';
import type { StandardResponse } from '@/shared/api/api.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<StandardResponse<LoginResponse>>(
      '/api/auth/signin',
      data
    );
    return response.data.data; 
  },
  logout: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/logout');
  },
  changePassword: async (data: Omit<ChangePasswordRequest, 'confirmPassword'>): Promise<void> => {
    await axiosInstance.put('/api/user/password', data);
  },
};
